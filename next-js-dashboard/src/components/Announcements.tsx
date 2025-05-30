'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api  from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Announcement = {
  id:          number;
  title:       string;
  content:     string;
  publishedAt: string;   // ISO string
};

/* Soft-color cycle for the first three cards */
const CARD_COLORS = ['bg-lamaSkyLight', 'bg-lamaPurpleLight', 'bg-lamaYellowLight'];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const Announcements = () => {
  const [items,   setItems]   = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  /* fetch once on mount */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/announcements');
        setItems((Array.isArray(data) ? data : []).slice(0, 3));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ------------- UI state guards ------------- */
  if (loading) return (
    <div className="bg-white p-4 rounded-md text-gray-500">
      Loading announcements…
    </div>
  );
  if (error)   return (
    <div className="bg-white p-4 rounded-md text-red-500">
      {error}
    </div>
  );
  if (!items.length) return (
    <div className="bg-white p-4 rounded-md text-gray-500">
      No announcements yet.
    </div>
  );

  /* --------------- Render -------------------- */
  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <Link href="/list/announcements" className="text-xs text-gray-400">
          View All
        </Link>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {items.map((a, idx) => (
          <div key={a.id} className={`${CARD_COLORS[idx % CARD_COLORS.length]} rounded-md p-4`}>
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{a.title}</h2>
              <span className="text-xs text-gray-600 bg-white rounded-md px-1 py-0.5">
                {new Date(a.publishedAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-1 line-clamp-3">
              {a.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
