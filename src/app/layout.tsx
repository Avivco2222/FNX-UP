import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import { Header } from '@/components/Header';
import { AICareerAgent } from '@/components/AICareerAgent';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '@/context/UserContext';
import './globals.css';

const heebo = Heebo({ subsets: ['hebrew', 'latin'] });

export const metadata: Metadata = {
  title: 'FnxLevelUp | הפניקס',
  description: 'המערכת לצמיחה ופיתוח עובדים',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} bg-slate-50/50 text-slate-900 min-h-screen flex flex-col`}>
        <UserProvider>
          {/* ה-Header יושב למעלה וקבוע */}
          <Header />
          
          {/* התוכן הראשי תופס את כל הרוחב (אין סיידבר שתופס מקום) */}
          <main className="flex-1 container mx-auto px-6 py-8">
            {children}
          </main>
          <AICareerAgent />
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
