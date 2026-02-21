import { getJobs, createJob } from '@/actions/jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Plus, Coins, Zap } from 'lucide-react'

export default async function AdminJobsPage() {
  const jobs = await getJobs()

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-black text-slate-900">ניהול משרות</h1>
           <p className="text-slate-500">צפה, ערוך וצור משרות חדשות במערכת</p>
        </div>
      </div>

      {/* טופס הוספה מהירה (זמני לבדיקה) */}
      <Card className="bg-slate-50 border-dashed border-2 border-slate-300">
         <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-500 uppercase">בדיקת חיבור: צור משרה מהירה</CardTitle>
         </CardHeader>
         <CardContent>
            <form action={createJob} className="flex gap-4">
               <Input name="title" placeholder="שם המשרה (למשל: Product Manager)" required className="bg-white" />
               <Input name="code" placeholder="קוד משרה (למשל: PM-101)" required className="bg-white w-40" />
               <Button type="submit" className="bg-slate-900"><Plus size={16} className="mr-2"/> צור משרה</Button>
            </form>
         </CardContent>
      </Card>

      {/* רשימת המשרות מה-DB */}
      <div className="grid gap-4">
        {jobs.length === 0 ? (
           <div className="text-center py-20 text-slate-400">
              עדיין אין משרות בבסיס הנתונים. נסה ליצור אחת למעלה! ☝️
           </div>
        ) : (
           jobs.map((job) => (
             <Card key={job.id} className="flex items-center p-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg ml-4">
                   <Briefcase size={24} />
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{job.title}</h3>
                      <Badge variant="outline">{job.code}</Badge>
                      <Badge className={job.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                         {job.status}
                      </Badge>
                   </div>
                   <div className="flex gap-4 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Zap size={14} className="text-orange-500"/> {job.xp_reward} XP</span>
                      <span className="flex items-center gap-1"><Coins size={14} className="text-yellow-500"/> {job.coin_reward} מטבעות</span>
                   </div>
                </div>
                <Button variant="outline">ערוך</Button>
             </Card>
           ))
        )}
      </div>
    </div>
  )
}
