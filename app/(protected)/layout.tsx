import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-utils';
import { Navbar } from '@/components/Navbar-nextjs';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}