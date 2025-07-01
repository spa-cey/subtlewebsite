import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt, maskApiKey } from '@/lib/encryption';

// PUT update Azure configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // Check if config exists
    const existingConfig = await prisma.systemAzureConfig.findUnique({
      where: { id }
    });

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    // Only update provided fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.endpoint !== undefined) updateData.endpoint = body.endpoint;
    if (body.deploymentName !== undefined) updateData.deploymentName = body.deploymentName;
    if (body.modelName !== undefined) updateData.modelName = body.modelName;
    if (body.apiVersion !== undefined) updateData.apiVersion = body.apiVersion;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.maxTokens !== undefined) updateData.maxTokens = body.maxTokens;
    if (body.temperature !== undefined) updateData.temperature = body.temperature;
    if (body.rateLimitRpm !== undefined) updateData.rateLimitRpm = body.rateLimitRpm;
    if (body.rateLimitTpd !== undefined) updateData.rateLimitTpd = body.rateLimitTpd;
    
    // Handle API key update (only if provided and not masked)
    if (body.apiKey && !body.apiKey.includes('...')) {
      updateData.apiKey = encrypt(body.apiKey);
    }
    
    // Handle primary flag
    if (body.isPrimary === true) {
      // Unset other primary configs
      await prisma.systemAzureConfig.updateMany({
        where: { 
          isPrimary: true,
          id: { not: id }
        },
        data: { isPrimary: false }
      });
      updateData.isPrimary = true;
    } else if (body.isPrimary === false) {
      updateData.isPrimary = false;
    }

    // Update config
    const updatedConfig = await prisma.systemAzureConfig.update({
      where: { id },
      data: updateData
    });

    // Log admin action
    await prisma.auditLog.create({
      data: {
        userId,
        adminId: userId,
        action: 'UPDATE_AZURE_CONFIG',
        details: {
          configId: id,
          configName: updatedConfig.name,
          updatedFields: Object.keys(updateData)
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedConfig,
        apiKey: maskApiKey(updatedConfig.apiKey)
      }
    });
  } catch (error) {
    console.error('Error updating Azure config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE Azure configuration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Check if config exists
    const config = await prisma.systemAzureConfig.findUnique({
      where: { id }
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Don't allow deletion of the last active config
    const activeCount = await prisma.systemAzureConfig.count({
      where: { isActive: true }
    });

    if (config.isActive && activeCount === 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last active configuration' },
        { status: 400 }
      );
    }

    // Delete config
    await prisma.systemAzureConfig.delete({
      where: { id }
    });

    // Log admin action
    await prisma.auditLog.create({
      data: {
        userId,
        adminId: userId,
        action: 'DELETE_AZURE_CONFIG',
        details: {
          configId: id,
          configName: config.name
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Azure config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}