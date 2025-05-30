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

type Attendance = {
  id: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  lessonId: number;
  studentId?: number;   // comes from teacher / parent endpoints
  studentName?: string; // resolved client-side
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const AttendanceListPage = () => {
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
      { header: 'Date', accessor: 'date' },
      { header: 'Status', accessor: 'status' },
    ];

    if (showStudent) {
      cols.push({
        header: 'Student',
        accessor: 'studentName',
        className: 'hidden md:table-cell',
      });
    }

    cols.push({
      header: 'Lesson ID',
      accessor: 'lessonId',
      className: 'hidden md:table-cell',
    });

    if (canEdit) cols.push({ header: 'Actions', accessor: 'action' });
    return cols;
  }, [showStudent, canEdit]);

  /* ---------------------------- data ------------------------------ */
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  /* Resolve names --------------------------------------------------- */
  const fetchStudentNames = async (items: Attendance[]) => {
    const ids = [...new Set(items.map(i => i.studentId).filter(Boolean))] as number[];
    if (!ids.length) return {};

    const nameMap: Record<number, string> = {};

    await Promise.all(
      ids.map(async id => {
        try {
          const { data } = await api.get(`/students/${id}`);
          nameMap[id] = data.fullName ?? data.name ?? `#${id}`;
        } catch {
          nameMap[id] = `#${id}`;
        }
      }),
    );
    return nameMap;
  };

  /* Main fetch ------------------------------------------------------ */
  const fetchAttendance = async () => {
    if (!user) return;

    const endpoint = isStudent
      ? `/students/${user.userId}/attendance`
      : isParent
      ? `/parents/${user.userId}/students/attendances`
      : isTeacher
      ? `/teachers/${user.userId}/students/attendance`
      : '/attendances';

    try {
      const { data } = await api.get(endpoint);

      const base: Attendance[] = data.map((r: any) => ({
        id:        r.id,
        date:      r.date,
        status:    r.status,
        lessonId:  r.lessonId,
        studentId: r.studentId ?? r.student?.id,
      }));

      if (showStudent) {
        const nameMap = await fetchStudentNames(base);
        base.forEach(b => {
          if (b.studentId) b.studentName = nameMap[b.studentId];
        });
      }

      setRecords(base);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchAttendance();
    }
  }, [user]);

  /* ------------------------ row renderer -------------------------- */
  const renderRow = (item: Attendance) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.date}</td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === 'PRESENT'
              ? 'bg-green-100 text-green-700'
              : item.status === 'ABSENT'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {item.status}
        </span>
      </td>

      {showStudent && (
        <td className="hidden md:table-cell">{item.studentName ?? '—'}</td>
      )}

      <td className="hidden md:table-cell">{item.lessonId}</td>

      {canEdit && (
        <td>
          <div className="flex items-center gap-2">
            <FormModal
              table="attendance"
              type="update"
              data={item}
              onSuccess={fetchAttendance}
            />
            <FormModal
              table="attendance"
              type="delete"
              id={item.id}
              onSuccess={fetchAttendance}
            />
          </div>
        </td>
      )}
    </tr>
  );

  /* ---------------------------- UI ------------------------------- */
  if (loading) return <div className="p-4 text-center">Loading attendance…</div>;
  if (error)   return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Attendance Records
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
            {canEdit && (
              <FormModal
                table="attendance"
                type="create"
                onSuccess={fetchAttendance}
              />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <Table columns={tableColumns} renderRow={renderRow} data={records} />
    </div>
  );
};

export default AttendanceListPage;
