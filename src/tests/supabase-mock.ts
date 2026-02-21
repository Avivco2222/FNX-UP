/**
 * supabase-mock.ts
 *
 * A chainable Supabase query-builder mock for unit tests.
 * Each method returns `this` so callers can chain, and the final
 * await resolves to the configured response.
 *
 * Usage in tests:
 *   const mock = createMockQueryBuilder({ data: [...], count: 5, error: null });
 *   vi.mocked(createAdminClient).mockReturnValue(
 *     createMockSupabaseClient(mock)
 *   );
 */

import { vi } from 'vitest';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface MockResponse {
  data: Record<string, unknown>[] | null;
  count?: number | null;
  error: { message: string; code?: string } | null;
}

// ----------------------------------------------------------------
// Query builder mock
// ----------------------------------------------------------------

export function createMockQueryBuilder(response: MockResponse) {
  const builder = {
    // Read methods
    select: vi.fn().mockReturnThis(),
    // Filters
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    // Pagination & ordering
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    // Write methods
    insert: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),

    // Terminal: makes the builder thenable so `await` works
    then: vi.fn().mockImplementation((resolve: (value: MockResponse) => void) => {
      resolve(response);
    }),
  };

  return builder;
}

export type MockQueryBuilder = ReturnType<typeof createMockQueryBuilder>;

// ----------------------------------------------------------------
// Supabase client mock
// ----------------------------------------------------------------

export function createMockSupabaseClient(builder: MockQueryBuilder) {
  return {
    from: vi.fn().mockReturnValue(builder),
  } as unknown as ReturnType<typeof import('@supabase/supabase-js').createClient>;
}

// ----------------------------------------------------------------
// Convenience: create client + builder in one call
// ----------------------------------------------------------------

export function createFullMock(response: MockResponse) {
  const builder = createMockQueryBuilder(response);
  const client = createMockSupabaseClient(builder);
  return { builder, client };
}
