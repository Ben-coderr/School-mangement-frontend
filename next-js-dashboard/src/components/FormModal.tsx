'use client';

import { useState } from 'react';
import dynamic      from 'next/dynamic';
import Image        from 'next/image';
import api          from '@/lib/axios';

/* ─────────────────── Types ─────────────────── */
type Table =
  | 'teacher'
  | 'student'
  | 'parent'
  | 'subject'
  | 'class'
  | 'lesson'
  | 'exam'
  | 'assignment'
  | 'result'
  | 'attendance'
  | 'event'
  | 'announcement';

type Mode = 'create' | 'update' | 'delete';

interface Props {
  table: Table;
  type: Mode;
  data?: any;   // full row object for update
  id?: number;  // explicit id for update / delete
  onSuccess?: () => void;
}

/* ─────────────────── Loader (must be declared first) ─────────────────── */
const Loader = () => <p className="p-4">Loading…</p>;

/* ─────────────────── Lazy-loaded forms ─────────────────── */
const StudentForm    = dynamic(() => import('./forms/StudentForm'),    { loading: Loader });
const TeacherForm    = dynamic(() => import('./forms/TeacherForm'),    { loading: Loader });
const ExamForm       = dynamic(() => import('./forms/ExamForm'),       { loading: Loader });
const AttendanceForm = dynamic(() => import('./forms/AttendanceForm'), { loading: Loader });
const AssignmentForm = dynamic(() => import('./forms/AssignmentForm'), { loading: Loader });
const ResultForm     = dynamic(() => import('./forms/ResultForm'),     { loading: Loader });

/* ─────────────────── Component ─────────────────── */
const FormModal: React.FC<Props> = ({
  table,
  type,
  data,
  id,
  onSuccess,
}) => {
  const [open,    setOpen]  = useState(false);
  const [loading, setLoad]  = useState(false);
  const [error,   setError] = useState<string | null>(null);

  /* ─────────── POST / PUT ─────────── */
  async function saveRow(payload: any) {
    setLoad(true);
    setError(null);
    try {
      if (type === 'create') {
        await api.post(`/${table}s`, payload);
      } else {
        const rowId = id ?? data?.id;
        if (!rowId) throw new Error('Missing id for update');
        await api.put(`/${table}s/${rowId}`, payload);
      }
      onSuccess?.();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoad(false);
    }
  }

  /* ─────────── DELETE ─────────── */
  async function deleteRow(e: React.FormEvent) {
    e.preventDefault();
    const rowId = id ?? data?.id;
    if (!rowId) return;

    setLoad(true);
    setError(null);
    try {
      await api.delete(`/${table}s/${rowId}`);
      onSuccess?.();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setLoad(false);
    }
  }

  /* ─────────── choose form ─────────── */
  function renderForm() {
    if (type === 'delete') {
      return (
        <form onSubmit={deleteRow} className="p-4 flex flex-col gap-4">
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this&nbsp;
            {table}?
          </span>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-red-700 text-white py-2 px-4 rounded-md self-center disabled:bg-red-400"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </form>
      );
    }

    const common = { type, data, onSave: saveRow, loading, error } as const;

    switch (table) {
      case 'student':     return <StudentForm    {...common} />;
      case 'teacher':     return <TeacherForm    {...common} />;
      case 'exam':        return <ExamForm       {...common} />;
      case 'attendance':  return <AttendanceForm {...common} />;
      case 'assignment':  return <AssignmentForm {...common} />;
      case 'result':      return <ResultForm     {...common} />;
      default:
        return <p className="p-4">Form for “{table}” not implemented.</p>;
    }
  }

  /* ─────────── Trigger styling ─────────── */
  const triggerSize  = type === 'create' ? 'w-8 h-8' : 'w-7 h-7';
  const triggerColor =
    type === 'create'
      ? 'bg-lamaYellow'
      : type === 'update'
      ? 'bg-lamaSky'
      : 'bg-lamaPurple';

  /* ─────────── render ─────────── */
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`${triggerSize} flex items-center justify-center rounded-full ${triggerColor}`}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            {renderForm()}

            <button
              disabled={loading}
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4"
            >
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
