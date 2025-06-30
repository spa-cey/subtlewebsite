import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserToAdmin() {
  const email = 'sanaan27@gmail.com';
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        subscriptionTier: 'admin'
      }
    });
    
    console.log(`Successfully updated user ${email} to admin status`);
    console.log('User details:', {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      fullName: user.fullName
    });
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserToAdmin();