'use client';

import { useEffect, useState } from 'react';
import FormModal from '@/components/FormModal';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import Image from 'next/image';
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Types & columns                                                    */
/* ------------------------------------------------------------------ */

type AnnouncementApi = {
  id: number;
  title: string;
  content: string;
  publishedAt: string; // ISO
  classId: number;
};

type Announcement = {
  id: number;
  title: string;
  class: string;
  date: string;
};

const columns = [
  { header: 'Title', accessor: 'title' },
  { header: 'Class', accessor: 'class' },
  {
    header: 'Date',
    accessor: 'date',
    className: 'hidden md:table-cell',
  },
  { header: 'Actions', accessor: 'action' },
];

/* ------------------------------------------------------------------ */

const AnnouncementListPage = () => {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ------------------------- Fetch ------------------------------- */
  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get<AnnouncementApi[]>('/announcements');

      const transformed = data.map<Announcement>((a) => ({
        id: a.id,
        title: a.title,
        // If you later want real class names, replace this with a lookup
        class: a.classId ? `Class #${a.classId}` : 'All',
        date: new Date(a.publishedAt).toLocaleDateString(),
      }));

      setAnnouncements(transformed);
    } catch (err) {
      setError(
          err instanceof Error ? err.message : 'Failed to fetch announcements'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------- Row renderer ------------------------- */
  const renderRow = (item: Announcement) => (
      <tr
          key={item.id}
          className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">{item.title}</td>
        <td>{item.class}</td>
        <td className="hidden md:table-cell">{item.date}</td>
        <td>
          <div className="flex items-center gap-2">
            {user?.role === 'ADMIN' && (
                <>
                  <FormModal
                      table="announcement"
                      type="update"
                      data={item}
                      onSuccess={fetchAnnouncements}
                  />
                  <FormModal
                      table="announcement"
                      type="delete"
                      id={item.id}
                      onSuccess={fetchAnnouncements}
                  />
                </>
            )}
          </div>
        </td>
      </tr>
  );

  /* ------------------------- States ------------------------------ */
  if (loading) return <div className="p-4 text-center">Loading announcements…</div>;
  if (error)   return <div className="p-4 text-red-500">Error: {error}</div>;

  /* ------------------------- Render ------------------------------ */
  return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* Header ---------------------------------------------------- */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            All Announcements
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="Filter" width={14} height={14} />
              </button> */}
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="Sort" width={14} height={14} />
              </button>
              {user?.role === 'ADMIN' && (
                  <FormModal
                      table="announcement"
                      type="create"
                      onSuccess={fetchAnnouncements}
                  />
              )}
            </div>
          </div>
        </div>

        {/* Table & pagination ---------------------------------------- */}
        <Table columns={columns} renderRow={renderRow} data={announcements} />
        <Pagination />
      </div>
  );
};

export default AnnouncementListPage;
