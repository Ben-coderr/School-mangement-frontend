'use client';

import { useEffect, useState } from 'react';
import FormModal from '@/components/FormModal';
import Table     from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import Image       from 'next/image';
import { useAuth } from '@/context/authContext';
import api         from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Result = {
  id:          number;
  ccScore:     number | null;
  examScore:   number | null;
  average?:    number | null;
  subjectId:   number;
  subjectName?:string;
  studentId:   number;
  studentName?:string;
};

/* ------------------------------------------------------------------ */
const ResultListPage = () => {
  const { user } = useAuth();

  const isAdmin   = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';

  const canEdit = isAdmin || isTeacher;

  /* --------------- fixed columns --------------- */
  const tableColumns = [
    { header: 'ID',      accessor: 'id' },
    { header: 'Subject', accessor: 'subjectName' },
    { header: 'Student', accessor: 'studentName' },
    { header: 'CC',      accessor: 'ccScore' },
    { header: 'Exam',    accessor: 'examScore' },
    { header: 'Average', accessor: 'average' },
    ...(canEdit ? [{ header: 'Actions', accessor: 'action' }] : []),
  ];

  /* ---------------------- data ----------------------- */
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  /* -------- helper resolvers -------- */
  const getMap = async (ids: number[], path: string, key: string) => {
    const m: Record<number,string> = {};
    await Promise.all(
      ids.map(async id => {
        try {
          const { data } = await api.get(`/${path}/${id}`);
          m[id] = data[key] ?? `#${id}`;
        } catch {
          m[id] = `#${id}`;
        }
      }),
    );
    return m;
  };

  const getAverages = async (pairs: string[]) => {
    const m: Record<string,number|null> = {};
    await Promise.all(
      pairs.map(async key => {
        const [stu, sub] = key.split('-');
        try {
          const { data } = await api.get(
            `/results/student/${stu}/subject/${sub}/average`,
          );
          m[key] = Number(data);
        } catch {
          m[key] = null;
        }
      }),
    );
    return m;
  };

  /* -------------- main fetch --------------- */
  const fetchResults = async () => {
    if (!user) return;

    const endpoint =
      user.role === 'STUDENT'
        ? `/students/${user.userId}/results`
        : user.role === 'PARENT'
        ? `/parents/${user.userId}/students/results`
        : '/results';

    try {
      const { data } = await api.get(endpoint);

      const base: Result[] = data.map((r: any) => ({
        id:         r.id,
        ccScore:    r.ccScore   != null ? Number(r.ccScore)   : null,  // ⬅️ parse
        examScore:  r.examScore != null ? Number(r.examScore) : null,  // ⬅️ parse
        subjectId:  r.subjectId,
        studentId:  r.studentId,
      }));

      /* resolve names + averages */
      const subjMap = await getMap(
        [...new Set(base.map(b => b.subjectId))],
        'subjects',
        'name',
      );
      const studMap = await getMap(
        [...new Set(base.map(b => b.studentId))],
        'students',
        'fullName',
      );
      const avgMap = await getAverages(
        [...new Set(base.map(b => `${b.studentId}-${b.subjectId}`))],
      );

      base.forEach(b => {
        b.subjectName = subjMap[b.subjectId];
        b.studentName = studMap[b.studentId];
        b.average     = avgMap[`${b.studentId}-${b.subjectId}`];
      });

      setResults(base);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchResults(); }, [user]);

  /* -------------- row renderer --------------- */
  const renderRow = (r: Result) => (
    <tr
      key={r.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{r.id}</td>
      <td>{r.subjectName}</td>
      <td>{r.studentName}</td>
      <td>{r.ccScore    ?? '—'}</td>
      <td>{r.examScore  ?? '—'}</td>
      <td>{r.average != null ? r.average.toFixed(2) : '—'}</td>

      {canEdit && (
        <td>
          <div className="flex items-center gap-2">
            <FormModal table="result" type="update" data={r} onSuccess={fetchResults} />
            <FormModal table="result" type="delete" id={r.id} onSuccess={fetchResults} />
          </div>
        </td>
      )}
    </tr>
  );

  /* -------------- UI states --------------- */
  if (loading) return <div className="p-4 text-center">Loading results…</div>;
  if (error)   return <div className="p-4 text-red-500">Error: {error}</div>;

  /* -------------- render --------------- */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* toolbar */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Results</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {canEdit && (
              <FormModal table="result" type="create" onSuccess={fetchResults} />
            )}
          </div>
        </div>
      </div>

      <Table columns={tableColumns} renderRow={renderRow} data={results} />
    </div>
  );
};

export default ResultListPage;
