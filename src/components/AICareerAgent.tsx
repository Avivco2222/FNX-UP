'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
};

export function AICareerAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. טעינת היסטוריה
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  // גלילה אוטומטית למטה
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data && data.length > 0) {
      setMessages(data);
    } else {
      // הודעת פתיחה אם אין היסטוריה
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'היי! אני סוכן הקריירה שלך 🤖. אפשר לשאול אותי על משרות פתוחות, קורסים מומלצים או מסלולי קריירה. איך אפשר לעזור?'
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userText = inputValue;
    setInputValue('');
    
    // א. הוספת הודעת המשתמש למסך ול-DB
    const tempUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsTyping(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('chat_messages').insert({ user_id: user.id, role: 'user', content: userText });
    }

    // ב. "חשיבה" של ה-AI (עיבוד לוגי פשוט שמחקה LLM)
    setTimeout(async () => {
      let aiResponse = "מעניין... תוכלי לפרט יותר?";
      let metadata = null;
      const lowerText = userText.toLowerCase();

      // --- לוגיקה חכמה מול הדאטהבייס ---
      
      // תרחיש 1: חיפוש משרות
      if (lowerText.includes('משרה') || lowerText.includes('עבודה') || lowerText.includes('מחפש') || lowerText.includes('ניהול')) {
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id, title, location')
          .eq('status', 'published')
          .limit(3);
        
        if (jobs && jobs.length > 0) {
          aiResponse = `מצאתי ${jobs.length} משרות שיכולות לעניין אותך בפניקס:`;
          metadata = { type: 'jobs', data: jobs };
        } else {
          aiResponse = "לא מצאתי משרות פתוחות כרגע, אבל אני ממליץ להירשם להתראות.";
        }
      }
      
      // תרחיש 2: חיפוש למידה/קורסים
      else if (lowerText.includes('ללמוד') || lowerText.includes('קורס') || lowerText.includes('python') || lowerText.includes('sql')) {
        const { data: courses } = await supabase
          .from('courses')
          .select('id, title, provider')
          .limit(2);
        
        if (courses && courses.length > 0) {
          aiResponse = "לימודים זה המפתח לקידום! הנה כמה קורסים מומלצים עבורך:";
          metadata = { type: 'courses', data: courses };
        }
      }

      // תרחיש 3: שכר/תנאים (תשובה גנרית)
      else if (lowerText.includes('שכר') || lowerText.includes('כסף') || lowerText.includes('העלאה')) {
        aiResponse = "נושאי שכר כדאי לדבר בשיחות המשוב השנתיות או מול ה-HRBP שלך. אני כאן כדי לעזור לך לשפר מיומנויות!";
      }

      // תרחיש 4: עזרה כללית
      else {
        aiResponse = "אני מבין. אני יכול לעזור לך למצוא את התפקיד הבא שלך או להמליץ על קורסים לסגירת פערים. מה מעניין אותך?";
      }

      // ג. הוספת תשובת ה-AI
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiResponse, metadata };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);

      if (user) {
        await supabase.from('chat_messages').insert({ 
          user_id: user.id, 
          role: 'assistant', 
          content: aiResponse,
          metadata: metadata || {}
        });
      }
    }, 1500);
  };

  return (
    <>
      {/* כפתור צף לפתיחה */}
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-tr from-orange-600 to-red-600 hover:scale-110 transition-transform z-50 flex items-center justify-center"
        >
          <Bot size={28} className="text-white" />
        </Button>
      )}

      {/* חלון הצ'אט */}
      {isOpen && (
        <Card className="fixed bottom-6 left-6 w-[350px] h-[500px] shadow-2xl z-50 flex flex-col border-orange-200 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">סוכן הקריירה</h3>
                <p className="text-[10px] opacity-80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/> מחובר
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-slate-50 p-4 overflow-y-auto" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="w-8 h-8 border border-slate-200">
                    {msg.role === 'assistant' ? (
                      <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600"><Bot size={16}/></div>
                    ) : (
                      <AvatarFallback className="bg-slate-200"><User size={14}/></AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="max-w-[80%] space-y-2">
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-slate-800 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>

                    {/* Rich Content (Cards within chat) */}
                    {msg.metadata?.type === 'jobs' && (
                      <div className="flex flex-col gap-2 mt-2">
                        {msg.metadata.data.map((job: any) => (
                          <Link href={`/opportunities/${job.id}`} key={job.id} className="block bg-white border border-orange-100 p-3 rounded-xl hover:shadow-md transition-shadow group">
                            <div className="font-bold text-slate-800 text-xs group-hover:text-orange-600">{job.title}</div>
                            <div className="text-[10px] text-slate-500">{job.location}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                     {msg.metadata?.type === 'courses' && (
                      <div className="flex flex-col gap-2 mt-2">
                        {msg.metadata.data.map((course: any) => (
                          <div key={course.id} className="bg-white border border-blue-100 p-3 rounded-xl">
                            <div className="font-bold text-slate-800 text-xs">{course.title}</div>
                            <div className="text-[10px] text-slate-500">{course.provider}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><Bot size={16}/></div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex items-center gap-2"
            >
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="שאל אותי על קריירה..." 
                className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-orange-500"
              />
              <Button type="submit" size="icon" className="bg-slate-900 hover:bg-slate-800 shrink-0" disabled={!inputValue.trim() || isTyping}>
                <Send size={16} />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
}
