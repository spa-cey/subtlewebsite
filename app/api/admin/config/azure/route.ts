import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt, maskApiKey } from '@/lib/encryption';

// GET all Azure configurations
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (middleware should handle this)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const configs = await prisma.systemAzureConfig.findMany({
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Mask API keys before sending to client
    const maskedConfigs = configs.map(config => ({
      ...config,
      apiKey: maskApiKey(config.apiKey)
    }));

    return NextResponse.json({
      success: true,
      data: maskedConfigs
    });
  } catch (error) {
    console.error('Error fetching Azure configs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new Azure configuration
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      endpoint,
      apiKey,
      deploymentName,
      modelName,
      apiVersion,
      isPrimary,
      maxTokens,
      temperature,
      rateLimitRpm,
      rateLimitTpd
    } = body;

    // Validate required fields
    if (!name || !endpoint || !apiKey || !deploymentName || !modelName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Encrypt API key
    const encryptedApiKey = encrypt(apiKey);

    // If this is set as primary, unset other primary configs
    if (isPrimary) {
      await prisma.systemAzureConfig.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false }
      });
    }

    // Create new config
    const config = await prisma.systemAzureConfig.create({
      data: {
        name,
        endpoint,
        apiKey: encryptedApiKey,
        deploymentName,
        modelName,
        apiVersion: apiVersion || '2024-04-01-preview',
        isPrimary: isPrimary || false,
        maxTokens: maxTokens || null,
        temperature: temperature || 0.7,
        rateLimitRpm: rateLimitRpm || null,
        rateLimitTpd: rateLimitTpd || null
      }
    });

    // Log admin action
    await prisma.auditLog.create({
      data: {
        userId,
        adminId: userId,
        action: 'CREATE_AZURE_CONFIG',
        details: {
          configId: config.id,
          configName: name
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...config,
        apiKey: maskApiKey(config.apiKey)
      }
    });
  } catch (error) {
    console.error('Error creating Azure config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}