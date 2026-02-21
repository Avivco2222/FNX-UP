'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Save, Globe, User, Mail, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
    location: '',
    bio: ''
  });
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (data) {
          setFormData({
            display_name: data.display_name || '',
            phone: data.phone || '050-1234567',
            location: data.location || 'מטה - גבעתיים',
            bio: 'מגייסת טכנולוגית שאוהבת אנשים וקוד.'
          });
        }
      }
    }
    loadData();
  }, [supabase]);

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('users')
        .update({ 
          display_name: formData.display_name,
          location: formData.location 
        })
        .eq('id', user.id);
        
      if (!error) {
        setTimeout(() => {
            setLoading(false);
            alert('הפרטים נשמרו בהצלחה! ✅');
        }, 800);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">הגדרות ופרטים אישיים</h1>
        <p className="text-slate-500">נהל את הפרופיל שלך ואת העדפות המערכת</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="general">כללי</TabsTrigger>
          <TabsTrigger value="notifications">התראות</TabsTrigger>
          <TabsTrigger value="security">אבטחה</TabsTrigger>
        </TabsList>
        
        {/* --- TAB: GENERAL --- */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>פרטים אישיים</CardTitle>
              <CardDescription>פרטים אלו גלויים לעובדים אחרים במערכת</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20 border-2 border-slate-100">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Noa" />
                  <AvatarFallback>NL</AvatarFallback>
                </Avatar>
                <div>
                   <Button variant="outline" size="sm">החלף תמונה</Button>
                   <p className="text-[10px] text-slate-400 mt-2">מומלץ להשתמש בתמונה ייצוגית (PNG, JPG)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">שם מלא</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="name" className="pr-10" value={formData.display_name} onChange={(e) => setFormData({...formData, display_name: e.target.value})} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">כתובת אימייל</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="email" className="pr-10 bg-slate-50" value="noa.levy@phoenix.co.il" disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">טלפון נייד</Label>
                  <div className="relative">
                    <Smartphone className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="phone" className="pr-10" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">מיקום משרד</Label>
                  <div className="relative">
                    <Globe className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="location" className="pr-10" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white gap-2">
                  {loading ? 'שומר...' : <><Save size={16} /> שמור שינויים</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB: NOTIFICATIONS --- */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>העדפות התראות</CardTitle>
              <CardDescription>בחר מתי לקבל עדכונים במייל או בנייד</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {[
                 { title: 'התראות על משרות חדשות', desc: 'כאשר נפתחת משרה המתאימה לפרופיל שלי' },
                 { title: 'עדכוני קורסים', desc: 'תזכורות להשלמת קורסים ומשימות' },
                 { title: 'פיד חברתי', desc: 'כאשר מישהו מגיב לפוסט שלי או מתייג אותי' },
                 { title: 'חדשות הארגון', desc: 'עדכונים רשמיים וניוזלטר שבועי' }
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                    <div className="space-y-0.5">
                      <Label className="text-base">{item.title}</Label>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={true} />
                 </div>
               ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB: SECURITY (Placeholder) --- */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>אבטחה וגישה</CardTitle>
              <CardDescription>ניהול סיסמה ואימות דו-שלבי</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-slate-400">בקרוב — ניהול סיסמה ו-2FA</div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
