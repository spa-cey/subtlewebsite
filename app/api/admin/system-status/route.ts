import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const status = {
      database: {
        status: 'unknown',
        message: '',
      },
      email: {
        status: 'unknown',
        message: '',
      },
      apiKeys: {
        status: 'unknown',
        message: '',
        azureConfigs: 0,
        activeConfigs: 0,
      },
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      status.database.status = 'healthy';
      status.database.message = 'Connected';
    } catch (error) {
      status.database.status = 'unhealthy';
      status.database.message = 'Connection failed';
    }

    // Check email configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      try {
        // Create test transporter
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: parseInt(smtpPort) === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        // Verify connection
        await transporter.verify();
        status.email.status = 'healthy';
        status.email.message = 'Configured';
      } catch (error) {
        status.email.status = 'degraded';
        status.email.message = 'Configuration error';
      }
    } else {
      status.email.status = 'unconfigured';
      status.email.message = 'Not configured';
    }

    // Check Azure API keys
    try {
      const azureConfigs = await prisma.systemAzureConfig.findMany({
        select: {
          id: true,
          isActive: true,
          healthStatus: true,
        },
      });

      status.apiKeys.azureConfigs = azureConfigs.length;
      status.apiKeys.activeConfigs = azureConfigs.filter(c => c.isActive).length;

      if (azureConfigs.length === 0) {
        status.apiKeys.status = 'unconfigured';
        status.apiKeys.message = 'No configurations';
      } else if (status.apiKeys.activeConfigs === 0) {
        status.apiKeys.status = 'degraded';
        status.apiKeys.message = 'No active configs';
      } else {
        const healthyConfigs = azureConfigs.filter(c => c.isActive && c.healthStatus === 'healthy').length;
        if (healthyConfigs === status.apiKeys.activeConfigs) {
          status.apiKeys.status = 'healthy';
          status.apiKeys.message = `${healthyConfigs} active`;
        } else {
          status.apiKeys.status = 'degraded';
          status.apiKeys.message = 'Check required';
        }
      }
    } catch (error) {
      status.apiKeys.status = 'error';
      status.apiKeys.message = 'Failed to check';
    }

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error checking system status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}