'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr'; // השינוי הגדול: ספרייה מודרנית
import { useRouter } from 'next/navigation';
import { Loader2, Flame, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('noa.levi@phoenix.co.il');
  const [password, setPassword] = useState('Phoenix2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // יצירת הקליינט בצורה שתומכת ב-Cookies
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // ריענון כדי שהשרת יקבל את העוגייה החדשה
      router.refresh();
      // הפנייה לדף הבית
      router.replace('/'); 
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'התחברות נכשלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden" dir="ltr">
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-200 rounded-full blur-[120px] opacity-30" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-red-200 rounded-full blur-[100px] opacity-30" />

      <Card className="w-full max-w-md relative z-10 shadow-xl border-orange-100/50">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Flame size={28} fill="currentColor" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            FnxLevelUp
          </CardTitle>
          <CardDescription>
            המערכת לקידום ופיתוח עובדים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-50/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50/50"
              />
            </div>
            
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-md shadow-orange-500/20 transition-all h-11" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  מתחבר...
                </>
              ) : (
                <>
                  כניסה למערכת
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground pb-6 pt-2">
          Demo Access: noa.levi@phoenix.co.il / Phoenix2026!
        </CardFooter>
      </Card>
    </div>
  );
}
