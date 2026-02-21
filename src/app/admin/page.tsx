import { Users, Briefcase, BadgeCheck, TrendingUp, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ----------------------------------------------------------------
// Mock stats (will be replaced with real queries later)
// ----------------------------------------------------------------

const STATS = [
  {
    label: 'Total Employees',
    value: '1,248',
    change: '+12 this month',
    icon: Users,
    accent: 'text-blue-600 bg-blue-50',
  },
  {
    label: 'Active Jobs',
    value: '37',
    change: '5 published this week',
    icon: Briefcase,
    accent: 'text-emerald-600 bg-emerald-50',
  },
  {
    label: 'Skills Verified',
    value: '3,892',
    change: '+148 this month',
    icon: BadgeCheck,
    accent: 'text-primary bg-primary/10',
  },
] as const;

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome to FnxLevelUp
            </h1>
            <p className="text-sm text-muted-foreground">
              Select a module from the sidebar to manage your platform.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map(({ label, value, change, icon: Icon, accent }) => (
          <Card key={label} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{value}</div>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions hint */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 rounded-full bg-muted p-3">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Getting Started</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Import your employees, define your skills taxonomy, and publish your first
            job — all from the sidebar navigation. The Phoenix awaits!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
