import { prisma } from '../src/db/index';

async function updateConfigEndpoint() {
  try {
    console.log('Updating Azure configuration endpoint...\n');
    
    // Find the configuration
    const config = await prisma.azureConfig.findFirst({
      where: { name: 'global' }
    });
    
    if (!config) {
      console.log('No configuration found with name "global".');
      return;
    }
    
    console.log('Current endpoint:', config.endpoint);
    
    // Extract base URL if full URL is provided
    let newEndpoint = config.endpoint;
    if (newEndpoint.includes('/openai/deployments/')) {
      const url = new URL(newEndpoint);
      newEndpoint = `${url.protocol}//${url.host}`;
    }
    
    // Remove trailing slash
    newEndpoint = newEndpoint.replace(/\/$/, '');
    
    console.log('New endpoint:', newEndpoint);
    
    // Update the configuration
    const updated = await prisma.azureConfig.update({
      where: { id: config.id },
      data: { 
        endpoint: newEndpoint,
        healthStatus: 'unknown', // Reset health status to test again
        lastHealthCheck: null
      }
    });
    
    console.log('\nConfiguration updated successfully!');
    console.log('You can now test the configuration from the admin panel.');
    
  } catch (error) {
    console.error('Error updating config:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateConfigEndpoint();