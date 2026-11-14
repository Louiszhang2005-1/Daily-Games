import fs from "node:fs";
import path from "node:path";
import { matchesFilter, UNIQUE_KEYS, type Filter, type Row, type SelectOptions, type Store } from "./types";

// Development-only store: one JSON file, read and written synchronously.
// Fine for a single dev server; never used when Supabase is configured.

const FILE = path.join(process.cwd(), ".data", "db.json");

type DB = Record<string, Row[]>;

function load(): DB {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as DB;
  } catch {
    return {};
  }
}

function save(db: DB) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, FILE);
}

function conflicts(table: string, a: Row, b: Row, keys?: string[]): boolean {
  const sets = keys ? [keys] : (UNIQUE_KEYS[table] ?? []);
  return sets.some((set) => set.every((k) => a[k] !== undefined && a[k] === b[k]));
}

export class LocalStore implements Store {
  readonly kind = "local" as const;

  async select<T = Row>(table: string, filter?: Filter, opts?: SelectOptions): Promise<T[]> {
    let rows = (load()[table] ?? []).filter((r) => matchesFilter(r, filter));
    if (opts?.order) {
      const { col, asc = true } = opts.order;
      rows = rows.slice().sort((a, b) => {
        const x = a[col] as string | number;
        const y = b[col] as string | number;
        return (x < y ? -1 : x > y ? 1 : 0) * (asc ? 1 : -1);
      });
    }
    if (opts?.limit !== undefined) rows = rows.slice(0, opts.limit);
    return rows as T[];
  }

  async insert(table: string, input: object): Promise<boolean> {
    const row = input as Row;
    const db = load();
    const rows = (db[table] ??= []);
    if (rows.some((r) => conflicts(table, r, row))) return false;
    rows.push(row);
    save(db);
    return true;
  }

  async upsert(table: string, input: object, onConflict: string[]): Promise<void> {
    const row = input as Row;
    const db = load();
    const rows = (db[table] ??= []);
    const i = rows.findIndex((r) => conflicts(table, r, row, onConflict));
    if (i >= 0) rows[i] = { ...rows[i], ...row };
    else rows.push(row);
    save(db);
  }

  async update(table: string, filter: Filter, patch: object): Promise<void> {
    const db = load();
    db[table] = (db[table] ?? []).map((r) => (matchesFilter(r, filter) ? { ...r, ...patch } : r));
    save(db);
  }

  async remove(table: string, filter: Filter): Promise<void> {
    const db = load();
    db[table] = (db[table] ?? []).filter((r) => !matchesFilter(r, filter));
    save(db);
  }
}
