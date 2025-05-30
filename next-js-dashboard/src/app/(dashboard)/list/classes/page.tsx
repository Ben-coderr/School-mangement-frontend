'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import FormModal from '@/components/FormModal';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ClassItem = {
  id: number;
  name: string;
  gradeId: number;
};

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

const ClassListPage = () => {
  const { user } = useAuth();

  const isAdmin   = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';

  /* ------------------------- columns ------------------------------ */
  const tableColumns = useMemo(
    () => [
      { header: 'Class Name', accessor: 'name' },
      { header: 'Grade',      accessor: 'gradeId', className: 'hidden md:table-cell' },
      ...(isAdmin ? [{ header: 'Actions', accessor: 'action' }] : []),
    ],
    [isAdmin]
  );

  /* -------------------------- data -------------------------------- */
  const [classes,    setClasses]    = useState<ClassItem[]>([]);
  const [loading,    setLoading]    = useState(true);   // first-load banner
  const [error,      setError]      = useState('');

  const fetchClasses = async () => {
    /* choose endpoint by role */
    const endpoint = isTeacher
      ? `/teachers/${user?.userId}/students/classes`
      : '/classes';

    try {
      setLoading(true);
      const { data } = await api.get(endpoint);
      setClasses(
        data.map((c: any) => ({
          id:      c.id,
          name:    c.name,
          gradeId: c.gradeId,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  /* initial load */
  useEffect(() => {
    if (user) fetchClasses();
  }, [user]);

  /* ----------------------- row renderer --------------------------- */
  const renderRow = (item: ClassItem) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">{item.gradeId}</td>

      {isAdmin && (
        <td>
          <div className="flex items-center gap-2">
            <FormModal
              table="class"
              type="update"
              data={item}
              onSuccess={fetchClasses}
            />
            <FormModal
              table="class"
              type="delete"
              id={item.id}
              onSuccess={fetchClasses}
            />
          </div>
        </td>
      )}
    </tr>
  );

  /* ------------------------- states ------------------------------- */
  if (loading) return <div className="p-4 text-center">Loading classes…</div>;
  if (error)   return <div className="p-4 text-red-500">Error: {error}</div>;

  /* ------------------------- render ------------------------------- */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Classes</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                 <Image src="/filter.png" alt="Filter" width={14} height={14} />
               </button> */}
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {isAdmin && (
              <FormModal table="class" type="create" onSuccess={fetchClasses} />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <Table columns={tableColumns} renderRow={renderRow} data={classes} />

      {/* Pagination (disabled for now) */}
      {/* <Pagination /> */}
    </div>
  );
};

export default ClassListPage;
