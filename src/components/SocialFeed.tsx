'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ThumbsUp, MessageCircle, Send, Sparkles, Trophy, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

export function SocialFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [commentOpenId, setCommentOpenId] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // טעינת פוסטים + ספירת תגובות
  const fetchPosts = async () => {
    let query = supabase
      .from('posts')
      .select('*, users(display_name, avatar_url, role_title), post_comments(count)')
      .order('created_at', { ascending: false });
    
    if (activeTab === 'official') {
       query = query.eq('post_type', 'promotion'); 
    }

    const { data } = await query;
    if (data) setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, [activeTab]);

  const handlePost = async () => {
    if (!newPostContent.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('posts').insert({
      user_id: user.id, content: newPostContent, post_type: 'tip'
    });
    setNewPostContent('');
    fetchPosts();
  };

  return (
    <div className="space-y-6">
      
      {/* אזור כתיבה מעוצב */}
      <Card className="border-none shadow-md bg-white overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Avatar className="w-10 h-10 border-2 border-orange-100">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Noa" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea 
                placeholder="מה למדת היום? שתף את הצוות..." 
                className="resize-none border-slate-100 bg-slate-50 focus:bg-white min-h-[80px]"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <div className="flex justify-between items-center">
                 <div className="flex gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-orange-600"><Sparkles size={14}/> הוסף GIF</span>
                    <span className="flex items-center gap-1 cursor-pointer hover:text-orange-600"><Share2 size={14}/> תייג עובד</span>
                 </div>
                 <Button size="sm" onClick={handlePost} className="bg-slate-900 text-white rounded-full px-6">פרסם</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* טאבים לסינון */}
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-transparent p-0 border-b border-slate-200 w-full justify-start rounded-none h-auto">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-4 pb-2">כל העדכונים</TabsTrigger>
          <TabsTrigger value="official" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-4 pb-2">📣 הודעות החברה</TabsTrigger>
          <TabsTrigger value="social" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-4 pb-2">☕ הווי ובידור</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {posts.map((post) => (
            <Card key={post.id} className="border-none shadow-sm hover:shadow-md transition-all group">
              <CardHeader className="p-4 pb-2 flex flex-row items-start gap-3">
                <Avatar className="cursor-pointer">
                  <AvatarImage src={post.users?.avatar_url} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{post.users?.display_name}</h3>
                      <p className="text-xs text-slate-500">{post.users?.role_title}</p>
                    </div>
                    {post.post_type === 'promotion' && <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 gap-1"><Trophy size={12}/> קידום!</Badge>}
                    {post.post_type === 'tip' && <Badge variant="secondary" className="bg-blue-50 text-blue-700 gap-1"><Sparkles size={12}/> טיפ זהב</Badge>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: he })}</p>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-1">
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </CardContent>

              <CardFooter className="p-2 border-t border-slate-50 bg-slate-50/30 flex justify-between">
                 <Button variant="ghost" size="sm" className="text-slate-500 hover:text-orange-600 gap-2">
                    <ThumbsUp size={16} /> {post.likes_count || 0}
                 </Button>
                 <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600 gap-2" onClick={() => setCommentOpenId(commentOpenId === post.id ? null : post.id)}>
                    <MessageCircle size={16} /> {post.post_comments?.[0]?.count || 0} תגובות
                 </Button>
                 <Button variant="ghost" size="sm" className="text-slate-500 hover:text-green-600 gap-2">
                    <Share2 size={16} /> שתף
                 </Button>
              </CardFooter>
              
              {/* אזור תגובות (נפתח בלחיצה) */}
              {commentOpenId === post.id && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-2">
                   <div className="text-center text-xs text-slate-400 py-2">אין תגובות עדיין. היה הראשון להגיב!</div>
                </div>
              )}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
