import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

// POST test Azure configuration
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
    let { apiKey, endpoint, deploymentName, apiVersion } = body;
    const { configId } = body;

    // If configId is provided, fetch from database
    if (configId) {
      const config = await prisma.systemAzureConfig.findUnique({
        where: { id: configId }
      });

      if (!config) {
        return NextResponse.json(
          { error: 'Configuration not found' },
          { status: 404 }
        );
      }

      apiKey = decrypt(config.apiKey);
      endpoint = config.endpoint;
      deploymentName = config.deploymentName;
      apiVersion = config.apiVersion;
    }

    // Validate required fields
    if (!apiKey || !endpoint || !deploymentName) {
      return NextResponse.json(
        { error: 'Missing required fields for testing' },
        { status: 400 }
      );
    }

    // Test the configuration
    try {
      // Log the configuration being tested
      console.log('Testing Azure configuration:', {
        endpoint,
        deploymentName,
        apiVersion,
        baseURL: `${endpoint}/openai/deployments/${deploymentName}`
      });

      // Ensure endpoint has proper format
      const formattedEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
      
      const client = new OpenAI({
        apiKey,
        baseURL: `${formattedEndpoint}/openai/deployments/${deploymentName}`,
        defaultQuery: { 'api-version': apiVersion || '2024-04-01-preview' },
        defaultHeaders: {
          'api-key': apiKey,
        },
      });

      const startTime = Date.now();
      
      // Simple test completion
      const response = await client.chat.completions.create({
        model: deploymentName, // For Azure OpenAI, model is the deployment name
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Azure OpenAI connection successful" if you can read this.' }
        ],
        max_tokens: 50,
        temperature: 0
      });

      const endTime = Date.now();
      const latency = endTime - startTime;

      // Update health check if configId provided
      if (configId) {
        await prisma.systemAzureConfig.update({
          where: { id: configId },
          data: {
            lastHealthCheck: new Date(),
            healthStatus: 'healthy',
            metadata: {
              lastTestLatency: latency,
              lastTestResponse: response.choices[0]?.message?.content
            }
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          status: 'healthy',
          latency,
          message: response.choices[0]?.message?.content,
          model: response.model,
          usage: response.usage
        }
      });
    } catch (error: any) {
      console.error('Azure test failed:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        endpoint,
        deploymentName,
        apiVersion
      });

      // Extract meaningful error message
      let errorMessage = 'Connection failed';
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Update health status if configId provided
      if (configId) {
        await prisma.systemAzureConfig.update({
          where: { id: configId },
          data: {
            lastHealthCheck: new Date(),
            healthStatus: 'unhealthy',
            metadata: {
              lastTestError: errorMessage,
              lastTestDetails: {
                endpoint,
                deploymentName,
                apiVersion,
                errorResponse: error.response?.data
              }
            }
          }
        });
      }

      return NextResponse.json({
        success: false,
        data: {
          status: 'unhealthy',
          error: errorMessage,
          details: {
            endpoint,
            deploymentName,
            apiVersion
          }
        }
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error testing Azure config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}