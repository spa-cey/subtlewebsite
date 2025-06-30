import { prisma } from '../src/db/index';

async function checkConfigs() {
  try {
    console.log('Checking Azure configurations in database...\n');
    
    const configs = await prisma.azureConfig.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    if (configs.length === 0) {
      console.log('No configurations found in database.');
    } else {
      console.log(`Found ${configs.length} configuration(s):\n`);
      
      configs.forEach((config, index) => {
        console.log(`Configuration ${index + 1}:`);
        console.log(`  ID: ${config.id}`);
        console.log(`  Name: ${config.name}`);
        console.log(`  Endpoint: ${config.endpoint}`);
        console.log(`  API Version: ${config.apiVersion}`);
        console.log(`  Deployment: ${config.deploymentName}`);
        console.log(`  Active: ${config.isActive}`);
        console.log(`  Primary: ${config.isPrimary}`);
        console.log(`  Health Status: ${config.healthStatus}`);
        console.log(`  Has API Key: ${config.apiKey ? 'Yes (encrypted)' : 'No'}`);
        console.log(`  Created: ${config.createdAt}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error checking configs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfigs();