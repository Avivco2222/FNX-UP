'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { TABLE_SEARCH_COLUMNS } from '@/lib/admin-columns';
import { ADMIN_TABLES, UPSERT_KEYS, type AdminTableName } from '@/types';

// ----------------------------------------------------------------
// Validation helper
// ----------------------------------------------------------------

function assertValidTable(tableName: string): asserts tableName is AdminTableName {
  if (!(ADMIN_TABLES as readonly string[]).includes(tableName)) {
    throw new Error(`Invalid table name: "${tableName}"`);
  }
}

// ----------------------------------------------------------------
// 1. FETCH (paginated + text search)
// ----------------------------------------------------------------

export interface FetchResult {
  data: Record<string, unknown>[];
  count: number;       // total matching rows
  page: number;
  limit: number;
  error: string | null;
}

/**
 * Generic paginated fetch for any admin table.
 *
 * @param tableName  One of ADMIN_TABLES
 * @param page       1-indexed page number
 * @param limit      Rows per page (default 25)
 * @param search     Optional text search (case-insensitive ilike on a searchable column)
 */
export async function fetchGenericTable(
  tableName: string,
  page: number = 1,
  limit: number = 25,
  search: string = '',
): Promise<FetchResult> {
  assertValidTable(tableName);

  const supabase = createAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(tableName)
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  // Apply text search if there's a searchable column configured
  if (search.trim()) {
    const searchCol = TABLE_SEARCH_COLUMNS[tableName];
    if (searchCol) {
      query = query.ilike(searchCol, `%${search.trim()}%`);
    }
  }

  const { data, count, error } = await query;

  if (error) {
    return { data: [], count: 0, page, limit, error: error.message };
  }

  return {
    data: (data ?? []) as Record<string, unknown>[],
    count: count ?? 0,
    page,
    limit,
    error: null,
  };
}

// ----------------------------------------------------------------
// 2. UPSERT (bulk – uses UPSERT_KEYS for conflict resolution)
// ----------------------------------------------------------------

export interface UpsertResult {
  success: boolean;
  inserted: number;
  errors: string[];
}

/**
 * Bulk upsert rows into any admin table.
 * Uses the natural keys from UPSERT_KEYS for ON CONFLICT resolution.
 *
 * @param tableName  One of ADMIN_TABLES
 * @param rows       Array of row objects (from Excel import or single-add form)
 */
export async function upsertGenericTable(
  tableName: string,
  rows: Record<string, unknown>[],
): Promise<UpsertResult> {
  assertValidTable(tableName);

  if (!rows.length) {
    return { success: true, inserted: 0, errors: [] };
  }

  const supabase = createAdminClient();
  const conflictKeys = UPSERT_KEYS[tableName];

  // If we have defined conflict keys, use upsert; otherwise plain insert
  const onConflict = conflictKeys?.join(',');

  // Strip out empty-string values for UUID columns (avoid Postgres cast errors)
  const cleaned = rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(row)) {
      // Skip completely empty cells
      if (val === '' || val === undefined) continue;
      out[key] = val;
    }
    return out;
  });

  // Supabase JS upsert with ignoreDuplicates=false (true merge)
  const { data, error } = onConflict
    ? await supabase
        .from(tableName)
        .upsert(cleaned, { onConflict, ignoreDuplicates: false })
        .select()
    : await supabase.from(tableName).insert(cleaned).select();

  if (error) {
    return {
      success: false,
      inserted: 0,
      errors: [error.message],
    };
  }

  return {
    success: true,
    inserted: data?.length ?? cleaned.length,
    errors: [],
  };
}

// ----------------------------------------------------------------
// 3. DELETE (single row by id)
// ----------------------------------------------------------------

export interface DeleteResult {
  success: boolean;
  error: string | null;
}

/**
 * Delete a single row by its primary key.
 * For composite-PK tables, pass the composite key as `id` object.
 */
export async function deleteGenericRow(
  tableName: string,
  id: string | Record<string, string>,
): Promise<DeleteResult> {
  assertValidTable(tableName);

  const supabase = createAdminClient();

  let query = supabase.from(tableName).delete();

  if (typeof id === 'string') {
    query = query.eq('id', id);
  } else {
    // Composite key: { user_id: '...', skill_id: '...' }
    for (const [col, val] of Object.entries(id)) {
      query = query.eq(col, val);
    }
  }

  const { error } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// ----------------------------------------------------------------
// 4. EXPORT (all rows for CSV/Excel download)
// ----------------------------------------------------------------

export interface ExportResult {
  data: Record<string, unknown>[];
  error: string | null;
}

/**
 * Fetch ALL rows from a table (no pagination) for Excel export.
 * Limited to 5000 rows as a safety cap.
 */
export async function exportGenericTable(
  tableName: string,
): Promise<ExportResult> {
  assertValidTable(tableName);

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data ?? []) as Record<string, unknown>[], error: null };
}
