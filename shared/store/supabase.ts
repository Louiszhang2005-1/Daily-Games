import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Filter, Row, SelectOptions, Store } from "./types";

// Server-side store using the service role key. Row Level Security is enabled on
// every table with no public policies, so only the server can read or write.

type Query = ReturnType<ReturnType<SupabaseClient["from"]>["select"]>;

function applyFilter<Q extends Query>(q: Q, filter?: Filter): Q {
  if (!filter) return q;
  let out = q;
  for (const [col, cond] of Object.entries(filter)) {
    if (cond === null) out = out.is(col, null) as Q;
    else if (typeof cond === "object") {
      if ("in" in cond) out = out.in(col, cond.in) as Q;
      else if ("neq" in cond) out = (cond.neq === null ? out.not(col, "is", null) : out.neq(col, cond.neq)) as Q;
      else {
        if (cond.gte !== undefined) out = out.gte(col, cond.gte) as Q;
        if (cond.lte !== undefined) out = out.lte(col, cond.lte) as Q;
      }
    } else out = out.eq(col, cond) as Q;
  }
  return out;
}

export class SupabaseStore implements Store {
  readonly kind = "supabase" as const;
  private db: SupabaseClient;

  constructor(url: string, serviceKey: string) {
    this.db = createClient(url, serviceKey, { auth: { persistSession: false } });
  }

  async select<T = Row>(table: string, filter?: Filter, opts?: SelectOptions): Promise<T[]> {
    let q = applyFilter(this.db.from(table).select("*"), filter);
    if (opts?.order) q = q.order(opts.order.col, { ascending: opts.order.asc ?? true });
    if (opts?.limit !== undefined) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) throw new Error(`select ${table}: ${error.message}`);
    return (data ?? []) as T[];
  }

  async insert(table: string, row: object): Promise<boolean> {
    const { error } = await this.db.from(table).insert(row);
    if (error) {
      if (error.code === "23505") return false; // unique violation
      throw new Error(`insert ${table}: ${error.message}`);
    }
    return true;
  }

  async upsert(table: string, row: object, onConflict: string[]): Promise<void> {
    const { error } = await this.db.from(table).upsert(row, { onConflict: onConflict.join(",") });
    if (error) throw new Error(`upsert ${table}: ${error.message}`);
  }

  async update(table: string, filter: Filter, patch: object): Promise<void> {
    const { error } = await applyFilter(this.db.from(table).update(patch) as unknown as Query, filter);
    if (error) throw new Error(`update ${table}: ${error.message}`);
  }

  async remove(table: string, filter: Filter): Promise<void> {
    const { error } = await applyFilter(this.db.from(table).delete() as unknown as Query, filter);
    if (error) throw new Error(`delete ${table}: ${error.message}`);
  }
}
