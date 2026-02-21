import Employee360Card from '@/components/admin/Employee360Card';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/users" className="hover:text-indigo-600 transition font-medium">
          ניהול עובדים
        </Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-bold">כרטיס עובד 360</span>
      </div>

      <Employee360Card userId={id} />
    </div>
  );
}
