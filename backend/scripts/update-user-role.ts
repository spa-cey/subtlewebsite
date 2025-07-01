import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRole() {
  const email = 'test@gmail.com';
  const newRole = 'admin'; // Can be 'user', 'support', 'admin', or 'super_admin'
  
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser) {
      console.error(`User with email ${email} not found`);
      return;
    }

    // Update user role
    const user = await prisma.user.update({
      where: { email },
      data: {
        role: newRole
      }
    });
    
    console.log(`Successfully updated user ${email} to ${newRole} role`);
    console.log('User details:', {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      subscriptionTier: user.subscriptionTier
    });
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();