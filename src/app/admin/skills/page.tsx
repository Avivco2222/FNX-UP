import UniversalTable from '@/components/admin/universal-table';

export default function SkillsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Skills Taxonomy</h1>
        <p className="text-sm text-muted-foreground">
          Manage the skill catalog. Import skills via Excel or add them manually.
        </p>
      </div>

      <UniversalTable tableName="skills" allowDelete />
    </div>
  );
}
