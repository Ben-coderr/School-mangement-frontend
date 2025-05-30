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

type LessonItem = {
  id: number;
  topic: string;
  lessonDate: string; // "YYYY-MM-DD"
  day: string;        // e.g. "MONDAY"
  startTime: string;  // "HH:mm:ss"
  endTime: string;    // "HH:mm:ss"
  classId: number;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const LessonListPage = () => {
  const { user } = useAuth();
  const isAdmin   = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

  /* ------------------------- columns ------------------------------ */
  const tableColumns = useMemo(
      () => [
        { header: 'Topic', accessor: 'topic' },
        {
          header: 'Date',
          accessor: 'lessonDate',
          className: 'hidden md:table-cell',
        },
        {
          header: 'Start',
          accessor: 'startTime',
          className: 'hidden lg:table-cell',
        },
        {
          header: 'End',
          accessor: 'endTime',
          className: 'hidden lg:table-cell',
        },
        {
          header: 'Class ID',
          accessor: 'classId',
          className: 'hidden md:table-cell',
        },
        ...(isAdmin ? [{ header: 'Actions', accessor: 'action' }] : []),
      ],
      [isAdmin],
  );

  /* ---------------------------- data ------------------------------ */
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchLessons = async () => {
    if (!user) return;

    const endpoint = isStudent
        ? `/students/${user.userId}/lessons`
        : isTeacher
            ? `/teachers/${user.userId}/lessons`
            : '/lessons';

    try {
      const { data } = await api.get(endpoint);
      setLessons(
          data.map((l: any) => ({
            id:         l.id,
            topic:      l.topic,
            lessonDate: l.lessonDate,
            day:        l.day,
            startTime:  l.startTime,
            endTime:    l.endTime,
            classId:    l.classId,
          })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchLessons();
    }
  }, [user]);

  /* ------------------------ row renderer -------------------------- */
  const renderRow = (item: LessonItem) => (
      <tr
          key={item.id}
          className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">{item.topic}</td>
        <td className="hidden md:table-cell">{item.lessonDate}</td>
        <td className="hidden lg:table-cell">{item.startTime}</td>
        <td className="hidden lg:table-cell">{item.endTime}</td>
        <td className="hidden md:table-cell">{item.classId}</td>

        {isAdmin && (
            <td>
              <div className="flex items-center gap-2">
                <FormModal
                    table="lesson"
                    type="update"
                    data={item}
                    onSuccess={fetchLessons}
                />
                <FormModal
                    table="lesson"
                    type="delete"
                    id={item.id}
                    onSuccess={fetchLessons}
                />
              </div>
            </td>
        )}
      </tr>
  );

  /* ------------------------ states / UI --------------------------- */
  if (loading) return <div className="p-4 text-center">Loading lessons…</div>;
  if (error)   return <div className="p-4 text-red-500">Error: {error}</div>;

  /* -------------------------- render ------------------------------ */
  return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* toolbar */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">Lessons</h1>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="Filter" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="Sort" width={14} height={14} />
              </button>
              {isAdmin && (
                  <FormModal table="lesson" type="create" onSuccess={fetchLessons} />
              )}
            </div>
          </div>
        </div>

        {/* table */}
        <Table columns={tableColumns} renderRow={renderRow} data={lessons} />


      </div>
  );
};

export default LessonListPage;
