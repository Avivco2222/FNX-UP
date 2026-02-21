'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import {
  Upload,
  Download,
  Plus,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  MoreHorizontal,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

import {
  fetchGenericTable,
  upsertGenericTable,
  deleteGenericRow,
  exportGenericTable,
} from '@/actions/admin-generic';
import {
  TABLE_DISPLAY_COLUMNS,
  TABLE_LABELS,
} from '@/lib/admin-columns';
import { UPSERT_KEYS, type AdminTableName } from '@/types';

// ----------------------------------------------------------------
// Props
// ----------------------------------------------------------------

interface UniversalTableProps {
  readonly tableName: AdminTableName;
  readonly allowDelete?: boolean;
  /** Replace the default "Add New" button with a custom element (e.g. JobWizard trigger) */
  readonly customAddButton?: React.ReactNode;
  /** Called after any successful mutation (import, add, delete) so parent can react */
  readonly onMutate?: () => void;
}

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------

const PAGE_LIMIT = 10;
const MAX_AUTO_COLUMNS = 5;
const DEBOUNCE_MS = 350;

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-/;
const TS_RE = /^\d{4}-\d{2}-\d{2}T/;

/** Columns to skip when auto-detecting display columns */
const SKIP_COLUMNS = new Set(['metadata', 'payload', 'avatar_config', 'perks']);

/**
 * Auto-detect which columns to display from the first data row.
 * Returns at most MAX_AUTO_COLUMNS keys, excluding JSONB blobs.
 */
function autoDetectColumns(row: Record<string, unknown>): string[] {
  return Object.keys(row)
    .filter((k) => !SKIP_COLUMNS.has(k))
    .slice(0, MAX_AUTO_COLUMNS);
}

/** Pretty-print a cell value for display */
function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 0).slice(0, 80);
  }

  const str = typeof value === 'string' ? value : `${value as string | number}`;

  // Truncate long UUIDs for readability
  if (UUID_RE.exec(str) && str.length > 20) {
    return str.slice(0, 8) + '…';
  }
  // Format timestamps
  if (TS_RE.exec(str)) {
    return str.replaceAll('T', ' ').slice(0, 19);
  }

  return str.length > 60 ? str.slice(0, 57) + '…' : str;
}

/** Column header label: snake_case → Title Case */
function colLabel(col: string): string {
  return col
    .replaceAll('_', ' ')
    .replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

export default function UniversalTable({
  tableName,
  allowDelete = false,
  customAddButton,
  onMutate,
}: UniversalTableProps) {
  // ---- State ----
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_LIMIT));
  const label = TABLE_LABELS[tableName] ?? tableName;

  // ---- Debounce search input ----
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on new search
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // ---- Data Fetching ----
  const loadData = useCallback(() => {
    setIsLoading(true);
    startTransition(async () => {
      const result = await fetchGenericTable(
        tableName,
        page,
        PAGE_LIMIT,
        debouncedSearch,
      );

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Fetch Error',
          description: result.error,
        });
        setIsLoading(false);
        return;
      }

      setData(result.data);
      setTotalCount(result.count);

      // Determine columns: prefer configured, else auto-detect from data
      const configured = TABLE_DISPLAY_COLUMNS[tableName];
      if (configured) {
        setColumns(configured.slice(0, MAX_AUTO_COLUMNS));
      } else if (result.data.length > 0) {
        setColumns(autoDetectColumns(result.data[0]));
      }

      setIsLoading(false);
    });
  }, [tableName, page, debouncedSearch, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ----------------------------------------------------------
  // Export to Excel / CSV
  // ----------------------------------------------------------
  const handleExport = () => {
    startTransition(async () => {
      const result = await exportGenericTable(tableName);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Export Error',
          description: result.error,
        });
        return;
      }

      const ws = XLSX.utils.json_to_sheet(result.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, tableName);
      XLSX.writeFile(wb, `${tableName}_export.xlsx`);

      toast({
        title: 'Export Complete',
        description: `${result.data.length} rows exported.`,
      });
    });
  };

  // ----------------------------------------------------------
  // Import from Excel (The "Magic" Button)
  // ----------------------------------------------------------
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      try {
        const buffer = await file.arrayBuffer();
        const arrayData = new Uint8Array(buffer);
        const workbook = XLSX.read(arrayData, { type: 'array', cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          firstSheet,
          { raw: false, dateNF: 'yyyy-mm-dd' },
        );

        if (!jsonData.length) {
          toast({
            variant: 'destructive',
            title: 'Empty File',
            description: 'No rows found in the uploaded file.',
          });
          return;
        }

        const result = await upsertGenericTable(tableName, jsonData);

        if (result.success) {
          toast({
            title: 'Import Successful',
            description: `${result.inserted} ${label} records imported/updated.`,
          });
          loadData();
          onMutate?.();
        } else {
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: result.errors.join('; '),
          });
        }
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Parse Error',
          description:
            err instanceof Error
              ? err.message
              : 'Failed to read the Excel file.',
        });
      }
    });

    // Reset input so the same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ----------------------------------------------------------
  // Add single row
  // ----------------------------------------------------------
  const openAddDialog = () => {
    const cols = TABLE_DISPLAY_COLUMNS[tableName] ?? columns;
    const initial: Record<string, string> = {};
    for (const col of cols) {
      if (col === 'id' || col === 'created_at' || col === 'updated_at') continue;
      initial[col] = '';
    }
    setFormData(initial);
    setAddDialogOpen(true);
  };

  const handleAddSubmit = () => {
    startTransition(async () => {
      const result = await upsertGenericTable(tableName, [formData]);
      if (result.success) {
        toast({ title: 'Created', description: `New ${label} record added.` });
        setAddDialogOpen(false);
        loadData();
        onMutate?.();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.errors.join('; '),
        });
      }
    });
  };

  // ----------------------------------------------------------
  // Delete single row (behind allowDelete flag)
  // ----------------------------------------------------------
  const handleDelete = (row: Record<string, unknown>) => {
    if (!allowDelete) return;

    const upsertKeys = UPSERT_KEYS[tableName];

    let idParam: string | Record<string, string>;
    if (row.id && typeof row.id === 'string') {
      idParam = row.id;
    } else if (upsertKeys) {
      const compositeId: Record<string, string> = {};
      for (const k of upsertKeys) {
        const v = row[k];
        if (v === null || v === undefined) {
          compositeId[k] = '';
        } else if (typeof v === 'object') {
          compositeId[k] = JSON.stringify(v);
        } else {
          compositeId[k] = `${v as string | number}`;
        }
      }
      idParam = compositeId;
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot determine row ID for deletion.',
      });
      return;
    }

    startTransition(async () => {
      const result = await deleteGenericRow(tableName, idParam);
      if (result.success) {
        toast({ title: 'Deleted', description: 'Row removed.' });
        loadData();
        onMutate?.();
      } else {
        toast({
          variant: 'destructive',
          title: 'Delete Error',
          description: result.error ?? 'Unknown error',
        });
      }
    });
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* ---- Header Bar ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight">{label}</h2>
          <Badge variant="secondary" className="text-xs tabular-nums">
            {totalCount} rows
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-52 pl-8 text-sm"
            />
          </div>

          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isPending}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>

          {/* Import Excel */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            <Upload className="mr-1.5 h-4 w-4" />
            Import Excel
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleImport}
          />

          {/* Add New — custom or default */}
          {customAddButton ?? (
            <Button size="sm" onClick={openAddDialog} disabled={isPending}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* ---- Data Table ---- */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col}
                  className="text-xs font-semibold whitespace-nowrap"
                >
                  {colLabel(col)}
                </TableHead>
              ))}
              {/* Actions column */}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading state */}
            {isLoading && data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-32 text-center text-muted-foreground"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            )}

            {/* Empty state */}
            {!isLoading && data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-32 text-center text-muted-foreground"
                >
                  <AlertCircle className="mx-auto mb-2 h-6 w-6" />
                  No records found.
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {data.map((row, idx) => (
              <TableRow key={(row.id as string) ?? idx} className="group">
                {columns.map((col) => (
                  <TableCell
                    key={col}
                    className="text-sm whitespace-nowrap max-w-[200px] truncate"
                  >
                    {formatCell(row[col])}
                  </TableCell>
                ))}

                {/* Row actions dropdown */}
                <TableCell className="text-right">
                  {allowDelete && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isPending}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(row)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ---- Pagination ---- */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1 || isPending}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages || isPending}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ---- Add New Dialog ---- */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New {label}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {Object.keys(formData).map((field) => (
              <div key={field} className="grid gap-1.5">
                <Label htmlFor={field} className="text-xs font-medium">
                  {colLabel(field)}
                </Label>
                <Input
                  id={field}
                  value={formData[field]}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  placeholder={field}
                  className="h-9 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddSubmit} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-1.5 h-4 w-4" />
              )}
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
