'use client';

import { useEffect, useMemo, useState } from 'react';
import FormModal from '@/components/FormModal';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import Image from 'next/image';
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AssignmentItem = {
  id: number;
  title: string;
  dueDate: string;
  lessonId: number;
  studentId?: number;       // teacher/parent endpoints include this
  studentName?: string;     // resolved client-side
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const AssignmentListPage = () => {
  const { user } = useAuth();

  const isAdmin   = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';
  const isParent  = user?.role === 'PARENT';

  const canEdit     = isAdmin || isTeacher;
  const showStudent = isTeacher || isParent;

  /* ------------------------- columns ------------------------------ */
  const tableColumns = useMemo(() => {
    const cols = [
      { header: 'Title', accessor: 'title' },
    ];

    if (showStudent) {
      cols.push({
        header: 'Student',
        accessor: 'studentName',
        className: 'hidden md:table-cell',
      });
    }

    cols.push(
      {
        header: 'Due Date',
        accessor: 'dueDate',
        className: 'hidden md:table-cell',
      },
      {
        header: 'Lesson ID',
        accessor: 'lessonId',
        className: 'hidden md:table-cell',
      },
    );

    if (canEdit) cols.push({ header: 'Actions', accessor: 'action' });
    return cols;
  }, [showStudent, canEdit]);

  /* -------------------------- data -------------------------------- */
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* Resolve names --------------------------------------------------- */
  const fetchStudentNames = async (items: AssignmentItem[]) => {
    const ids = [...new Set(items.map(a => a.studentId).filter(Boolean))] as number[];
    if (!ids.length) return {};

    const map: Record<number, string> = {};
    await Promise.all(
      ids.map(async id => {
        try {
          const { data } = await api.get(`/students/${id}`);
          map[id] = data.fullName ?? data.name ?? `#${id}`;
        } catch {
          map[id] = `#${id}`;
        }
      }),
    );
    return map;
  };

  const fetchAssignments = async () => {
    if (!user) return;

    const endpoint = isStudent
      ? `/students/${user.userId}/assignments`
      : isTeacher
      ? `/teachers/${user.userId}/assignments`
      : isParent
      ? `/parents/${user.userId}/students/assignments`
      : '/assignments';

    try {
      const { data } = await api.get(endpoint);

      const base: AssignmentItem[] = data.map((a: any) => ({
        id:        a.id,
        title:     a.title,
        dueDate:   a.dueDate,
        lessonId:  a.lessonId,
        studentId: a.studentId ?? a.student?.id,
      }));

      if (showStudent) {
        const nameMap = await fetchStudentNames(base);
        base.forEach(b => { b.studentName = nameMap[b.studentId]; });
      }

      setAssignments(base);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchAssignments();
    }
  }, [user]);

  /* --------------------- row renderer ----------------------------- */
  const renderRow = (item: AssignmentItem) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>

      {showStudent && (
        <td className="hidden md:table-cell">{item.studentName ?? '—'}</td>
      )}

      <td className="hidden md:table-cell">{item.dueDate}</td>
      <td className="hidden md:table-cell">{item.lessonId}</td>

      {canEdit && (
        <td>
          <div className="flex items-center gap-2">
            <FormModal
              table="assignment"
              type="update"
              data={item}
              onSuccess={fetchAssignments}
            />
            <FormModal
              table="assignment"
              type="delete"
              id={item.id}
              onSuccess={fetchAssignments}
            />
          </div>
        </td>
      )}
    </tr>
  );

  /* ------------------------ states -------------------------------- */
  if (loading) return <div className="p-4 text-center">Loading assignments…</div>;
  if (error)   return <div className="p-4 text-red-500">Error: {error}</div>;

  /* ------------------------ render -------------------------------- */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* toolbar */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Assignments</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button> */}
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {canEdit && (
              <FormModal
                table="assignment"
                type="create"
                onSuccess={fetchAssignments}
              />
            )}
          </div>
        </div>
      </div>

      {/* table */}
      <Table columns={tableColumns} renderRow={renderRow} data={assignments} />

      {/* pagination (uncomment when needed) */}
      {/* <Pagination /> */}
    </div>
  );
};

export default AssignmentListPage;
