'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';

export type SearchField = { label: string; value: string };
type TriggerMode = 'button' | 'realtime' | 'both';

export interface TableSearchProps<T = unknown> {
  fields?: SearchField[];
  search:   (field: string, value: string) => Promise<T[]>;
  onResults:(rows: T[]) => void;
  onClear?: () => void;            // ← fetch full list
  trigger?:  TriggerMode;          // 'button' | 'realtime' | 'both'
  debounceMs?: number;             // default 400 ms
}

const TableSearch = <T,>({
  fields     = [],
  search,
  onResults,
  onClear,
  trigger    = 'button',
  debounceMs = 400,
}: TableSearchProps<T>) => {
  /* -------------------------------------------------------------- */
  const safeFields   = Array.isArray(fields) ? fields : [];
  const defaultField = safeFields.length ? safeFields[0].value : '';

  const [field, setField]     = useState(defaultField);
  const [term,  setTerm]      = useState('');
  const [loading, setLoading] = useState(false);

  const shouldRealtime =
    trigger === 'realtime' || trigger === 'both';
  const shouldButton =
    trigger === 'button'   || trigger === 'both';

  /* ----------------------- realtime ------------------------------ */
  useEffect(() => {
    if (!shouldRealtime) return;

    if (!term.trim()) {          // ← box was cleared
      onClear?.();
      return;
    }

    const timer = setTimeout(() => {
      runSearch(term.trim());
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [term, field]);

  /* ------------------------- helpers ----------------------------- */
  const runSearch = async (value: string) => {
    try {
      setLoading(true);
      const rows = await search(field, value);
      onResults(rows);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = term.trim();

    if (value) {
      runSearch(value);
    } else {
      onClear?.();               // ← empty box + Enter / click
    }
  };

  const handleInput = (v: string) => {
    setTerm(v);

    /* in *button-only* mode, call onClear immediately when empty */
    if (!shouldRealtime && v.trim() === '') {
      onClear?.();
    }
  };

  /* --------------------------- UI -------------------------------- */
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2"
    >
      {/* dropdown (optional) */}
      {safeFields.length > 0 && (
        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="bg-transparent outline-none px-1"
        >
          {safeFields.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      )}

      {/* textbox */}
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        placeholder="Search…"
        value={term}
        onChange={(e) => handleInput(e.target.value)}
        className="w-[200px] p-2 bg-transparent outline-none"
      />

      {/* submit button (optional) */}
      {/* {shouldButton && (
        <button
          type="submit"
          disabled={loading}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky disabled:opacity-50"
          title="Search"
        >
          <Image src="/arrow-right.png" alt="" width={12} height={12} />
        </button>
      )} */}
    </form>
  );
};

export default TableSearch;
