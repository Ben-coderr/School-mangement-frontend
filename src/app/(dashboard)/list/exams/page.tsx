'use client';

import { useEffect, useMemo, useState } from 'react';
import FormModal from '@/components/FormModal';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import Image from 'next/image';
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ExamItem = {
  id: number;
  title: string;
  examDate: string; // ISO date
  lessonId: number;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ExamListPage = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';
  const isAdmin   = user?.role === 'ADMIN';
  const canEdit   = isTeacher || isAdmin;
  const isStudent = user?.role === 'STUDENT';

  /* ------------------------- columns ------------------------------ */
  const tableColumns = useMemo(
      () => [
        { header: 'Title', accessor: 'title' },
        {
          header: 'Date',
          accessor: 'examDate',
          className: 'hidden md:table-cell',
        },
        {
          header: 'Lesson ID',
          accessor: 'lessonId',
          className: 'hidden md:table-cell',
        },
        ...(canEdit ? [{ header: 'Actions', accessor: 'action' }] : []),
      ],
      [canEdit],
  );

  /* ---------------------------- data ------------------------------ */
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchExams = async () => {
    if (!user) return;

    const endpoint = isStudent
        ? `/students/${user.userId}/exams`
        : isTeacher
            ? `/teachers/${user.userId}/exams`
            : '/exams';

    try {
      const { data } = await api.get(endpoint);
      setExams(
          data.map((e: any) => ({
            id:       e.id,
            title:    e.title,
            examDate: e.examDate,
            lessonId: e.lessonId,
          })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchExams();
    }
  }, [user]);

  /* ------------------------ row renderer -------------------------- */
  const renderRow = (item: ExamItem) => (
      <tr
          key={item.id}
          className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">{item.title}</td>
        <td className="hidden md:table-cell">{item.examDate}</td>
        <td className="hidden md:table-cell">{item.lessonId}</td>

        {canEdit && (
            <td>
              <div className="flex items-center gap-2">
                <FormModal
                    table="exam"
                    type="update"
                    data={item}
                    onSuccess={fetchExams}
                />
                <FormModal
                    table="exam"
                    type="delete"
                    id={item.id}
                    onSuccess={fetchExams}
                />
              </div>
            </td>
        )}
      </tr>
  );

  /* ---------------------------- states ---------------------------- */
  if (loading) return <div className="p-4 text-center">Loading exams…</div>;
  if (error)   return <div className="p-4 text-red-500">Error: {error}</div>;

  /* ---------------------------- render ---------------------------- */
  return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* toolbar */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">Exams</h1>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="Filter" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="Sort" width={14} height={14} />
              </button>
              {canEdit && (
                  <FormModal table="exam" type="create" onSuccess={fetchExams} />
              )}
            </div>
          </div>
        </div>

        {/* table */}
        <Table columns={tableColumns} renderRow={renderRow} data={exams} />

        {/* pagination */}
        {/*<Pagination />*/}
      </div>
  );
};

export default ExamListPage;
