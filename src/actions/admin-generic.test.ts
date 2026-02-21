import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockQueryBuilder,
  createMockSupabaseClient,
  type MockQueryBuilder,
} from '@/tests/supabase-mock';

// ----------------------------------------------------------------
// Mock the Supabase server client BEFORE importing the actions.
// vi.mock is hoisted by vitest so this is fine.
// ----------------------------------------------------------------
const mockCreateAdminClient = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: (...args: unknown[]) => mockCreateAdminClient(...args),
}));

// Now import the functions under test
import {
  fetchGenericTable,
  upsertGenericTable,
  deleteGenericRow,
  exportGenericTable,
} from './admin-generic';

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

/** Wire up a mock builder → mock client → inject into createAdminClient */
function useMockBuilder(builder: MockQueryBuilder) {
  const client = createMockSupabaseClient(builder);
  mockCreateAdminClient.mockReturnValue(client);
  return client;
}

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// ================================================================
// fetchGenericTable
// ================================================================

describe('fetchGenericTable', () => {
  it('returns paginated data on success', async () => {
    const rows = [
      { id: 'aaa', slug: 'react', name: 'React', created_at: '2025-01-01T00:00:00Z' },
      { id: 'bbb', slug: 'node', name: 'Node.js', created_at: '2025-01-02T00:00:00Z' },
    ];
    const builder = createMockQueryBuilder({ data: rows, count: 42, error: null });
    useMockBuilder(builder);

    const result = await fetchGenericTable('skills', 2, 10);

    expect(result.error).toBeNull();
    expect(result.data).toEqual(rows);
    expect(result.count).toBe(42);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);

    // Verify pagination: page 2, limit 10 → range(10, 19)
    expect(builder.range).toHaveBeenCalledWith(10, 19);
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('applies ilike search on the correct column for skills', async () => {
    const builder = createMockQueryBuilder({ data: [], count: 0, error: null });
    useMockBuilder(builder);

    await fetchGenericTable('skills', 1, 25, 'react');

    // skills search column is 'name' (from TABLE_SEARCH_COLUMNS)
    expect(builder.ilike).toHaveBeenCalledWith('name', '%react%');
  });

  it('applies ilike search on the correct column for jobs', async () => {
    const builder = createMockQueryBuilder({ data: [], count: 0, error: null });
    useMockBuilder(builder);

    await fetchGenericTable('jobs', 1, 25, 'engineer');

    // jobs search column is 'title'
    expect(builder.ilike).toHaveBeenCalledWith('title', '%engineer%');
  });

  it('does NOT apply ilike when no search column exists for the table', async () => {
    const builder = createMockQueryBuilder({ data: [], count: 0, error: null });
    useMockBuilder(builder);

    // feed_events has no search column configured
    await fetchGenericTable('feed_events', 1, 25, 'anything');

    expect(builder.ilike).not.toHaveBeenCalled();
  });

  it('does NOT apply ilike when search string is empty/whitespace', async () => {
    const builder = createMockQueryBuilder({ data: [], count: 0, error: null });
    useMockBuilder(builder);

    await fetchGenericTable('skills', 1, 25, '   ');

    expect(builder.ilike).not.toHaveBeenCalled();
  });

  it('returns graceful error on DB failure', async () => {
    const builder = createMockQueryBuilder({
      data: null,
      count: null,
      error: { message: 'connection refused' },
    });
    useMockBuilder(builder);

    const result = await fetchGenericTable('skills', 1, 25);

    expect(result.error).toBe('connection refused');
    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
  });

  it('throws on invalid table name', async () => {
    await expect(
      fetchGenericTable('bobby_tables', 1, 25),
    ).rejects.toThrow('Invalid table name: "bobby_tables"');
  });

  it('uses default pagination when no args provided', async () => {
    const builder = createMockQueryBuilder({ data: [], count: 0, error: null });
    useMockBuilder(builder);

    const result = await fetchGenericTable('skills');

    expect(result.page).toBe(1);
    expect(result.limit).toBe(25);
    expect(builder.range).toHaveBeenCalledWith(0, 24);
  });
});

// ================================================================
// upsertGenericTable
// ================================================================

describe('upsertGenericTable', () => {
  it('upserts rows and returns inserted count on success', async () => {
    const returnedRows = Array.from({ length: 10 }, (_, i) => ({
      id: `id-${i}`,
      slug: `skill-${i}`,
      name: `Skill ${i}`,
    }));
    const builder = createMockQueryBuilder({ data: returnedRows, error: null });
    const client = useMockBuilder(builder);

    const inputRows = returnedRows.map(({ slug, name }) => ({ slug, name }));
    const result = await upsertGenericTable('skills', inputRows);

    expect(result.success).toBe(true);
    expect(result.inserted).toBe(10);
    expect(result.errors).toEqual([]);

    // Verify upsert was called (not insert) because skills has UPSERT_KEYS
    expect(client.from).toHaveBeenCalledWith('skills');
    expect(builder.upsert).toHaveBeenCalled();

    // Verify the onConflict column is 'slug' for skills
    const upsertCall = builder.upsert.mock.calls[0];
    expect(upsertCall[1]).toEqual({ onConflict: 'slug', ignoreDuplicates: false });
  });

  it('uses correct conflict keys for jobs (code)', async () => {
    const builder = createMockQueryBuilder({ data: [{ id: '1' }], error: null });
    useMockBuilder(builder);

    await upsertGenericTable('jobs', [{ code: 'JOB-001', title: 'Dev' }]);

    const upsertCall = builder.upsert.mock.calls[0];
    expect(upsertCall[1]).toEqual({ onConflict: 'code', ignoreDuplicates: false });
  });

  it('uses correct composite conflict keys for user_skills', async () => {
    const builder = createMockQueryBuilder({ data: [{ user_id: 'u1', skill_id: 's1' }], error: null });
    useMockBuilder(builder);

    await upsertGenericTable('user_skills', [{ user_id: 'u1', skill_id: 's1', skill_level: 3 }]);

    const upsertCall = builder.upsert.mock.calls[0];
    expect(upsertCall[1]).toEqual({ onConflict: 'user_id,skill_id', ignoreDuplicates: false });
  });

  it('uses insert (not upsert) for tables without UPSERT_KEYS', async () => {
    const builder = createMockQueryBuilder({ data: [{ id: 'x' }], error: null });
    useMockBuilder(builder);

    // xp_transactions has no UPSERT_KEYS defined → falls back to plain insert
    await upsertGenericTable('xp_transactions', [
      { user_id: 'u1', xp_amount: 100, coin_amount: 50 },
    ]);

    expect(builder.insert).toHaveBeenCalled();
    expect(builder.upsert).not.toHaveBeenCalled();
  });

  it('strips empty string and undefined values from rows', async () => {
    const builder = createMockQueryBuilder({ data: [{ id: '1' }], error: null });
    useMockBuilder(builder);

    await upsertGenericTable('skills', [
      { slug: 'ts', name: 'TypeScript', description: '', parent_skill_id: undefined },
    ]);

    const upsertCall = builder.upsert.mock.calls[0];
    const cleanedRows = upsertCall[0];
    // description (empty string) and parent_skill_id (undefined) should be stripped
    expect(cleanedRows[0]).toEqual({ slug: 'ts', name: 'TypeScript' });
    expect(cleanedRows[0]).not.toHaveProperty('description');
    expect(cleanedRows[0]).not.toHaveProperty('parent_skill_id');
  });

  it('returns success with 0 inserted for empty input', async () => {
    const result = await upsertGenericTable('skills', []);

    expect(result.success).toBe(true);
    expect(result.inserted).toBe(0);
    expect(result.errors).toEqual([]);
    // Should not even call the Supabase client
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
  });

  it('returns graceful error on DB failure', async () => {
    const builder = createMockQueryBuilder({
      data: null,
      error: { message: 'duplicate key value violates unique constraint' },
    });
    useMockBuilder(builder);

    const result = await upsertGenericTable('skills', [{ slug: 'dup', name: 'Dup' }]);

    expect(result.success).toBe(false);
    expect(result.inserted).toBe(0);
    expect(result.errors).toEqual(['duplicate key value violates unique constraint']);
  });

  it('throws on invalid table name', async () => {
    await expect(
      upsertGenericTable('drop_database', [{ bad: 'data' }]),
    ).rejects.toThrow('Invalid table name: "drop_database"');
  });
});

// ================================================================
// deleteGenericRow
// ================================================================

describe('deleteGenericRow', () => {
  it('deletes by UUID id on success', async () => {
    const builder = createMockQueryBuilder({ data: [], error: null });
    useMockBuilder(builder);

    const result = await deleteGenericRow('skills', 'abc-123');

    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
    expect(builder.eq).toHaveBeenCalledWith('id', 'abc-123');
  });

  it('deletes by composite key', async () => {
    const builder = createMockQueryBuilder({ data: [], error: null });
    useMockBuilder(builder);

    const result = await deleteGenericRow('user_skills', {
      user_id: 'u1',
      skill_id: 's1',
    });

    expect(result.success).toBe(true);
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(builder.eq).toHaveBeenCalledWith('skill_id', 's1');
  });

  it('returns graceful error on DB failure', async () => {
    const builder = createMockQueryBuilder({
      data: null,
      error: { message: 'foreign key violation' },
    });
    useMockBuilder(builder);

    const result = await deleteGenericRow('skills', 'abc-123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('foreign key violation');
  });

  it('throws on invalid table name', async () => {
    await expect(
      deleteGenericRow('evil_table', 'id-1'),
    ).rejects.toThrow('Invalid table name: "evil_table"');
  });
});

// ================================================================
// exportGenericTable
// ================================================================

describe('exportGenericTable', () => {
  it('exports all rows on success', async () => {
    const rows = [
      { id: '1', slug: 'a', name: 'A' },
      { id: '2', slug: 'b', name: 'B' },
    ];
    const builder = createMockQueryBuilder({ data: rows, error: null });
    useMockBuilder(builder);

    const result = await exportGenericTable('skills');

    expect(result.error).toBeNull();
    expect(result.data).toEqual(rows);
    expect(builder.limit).toHaveBeenCalledWith(5000);
  });

  it('returns graceful error on DB failure', async () => {
    const builder = createMockQueryBuilder({
      data: null,
      error: { message: 'timeout' },
    });
    useMockBuilder(builder);

    const result = await exportGenericTable('skills');

    expect(result.error).toBe('timeout');
    expect(result.data).toEqual([]);
  });

  it('throws on invalid table name', async () => {
    await expect(
      exportGenericTable('sys_tables'),
    ).rejects.toThrow('Invalid table name: "sys_tables"');
  });
});
