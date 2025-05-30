'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField  from '../InputField';
import { useAuth } from '@/context/authContext';
import api         from '@/lib/axios';

/* ────────────────── Validation schema ────────────────── */
const attendanceSchema = z.object({
  date: z.string().min(1, 'Date is required!'),
  status: z.enum(['PRESENT', 'LATE', 'ABSENT'], {
    errorMap: () => ({ message: 'Status is required!' }),
  }),
  lessonId: z.preprocess(
    (v) => Number(v),
    z.number({ invalid_type_error: 'Lesson ID is required!' })
      .int()
      .positive('Lesson ID must be positive'),
  ),
  studentId: z
    .preprocess(
      (v) => (v === '' || v == null ? undefined : Number(v)),
      z.number({ invalid_type_error: 'Student ID must be a number' })
        .int()
        .positive('Student ID must be positive'),
    )
    .optional(),
});

export type AttendanceInputs = z.infer<typeof attendanceSchema>;

/* ────────────────── Props ────────────────── */
type Props = {
  type: 'create' | 'update';
  data?: Partial<AttendanceInputs & { id: number; lesson?: { id: number } }>;
  onSave: (payload: any) => void;
  loading?: boolean;
  error?: string | null;
};

/* ────────────────── Component ────────────────── */
const AttendanceForm: React.FC<Props> = ({
  type,
  data,
  onSave,
  loading = false,
  error = null,
}) => {
  const { user }   = useAuth();
  const isTeacher  = user?.role === 'TEACHER';

  /* ---------- teacher lessons for dropdown ---------- */
  const [lessons, setLessons] = useState<{ id: number; topic: string }[]>([]);
  const [lessonErr, setLessonErr] = useState('');

  useEffect(() => {
    if (!isTeacher) return;
    (async () => {
      try {
        const { data: les } = await api.get(`/teachers/${user!.userId}/lessons`);
        setLessons(
          les.map((l: any) => ({
            id: l.id,
            topic: l.topic ?? `Lesson ${l.id}`,
          })),
        );
      } catch {
        setLessonErr('Could not load lessons');
      }
    })();
  }, [isTeacher, user]);

  /* ---------- RHF ---------- */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AttendanceInputs>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      date:      data?.date      ?? '',
      status:    data?.status    ?? 'PRESENT',
      lessonId:  data?.lessonId  ?? data?.lesson?.id ?? '',
      studentId: data?.studentId ?? '',
    },
  });

  /* ---------- submit ---------- */
  const submit = (values: AttendanceInputs) => {
    const payload: any = {
      date:   values.date,
      status: values.status,
      lesson: { id: values.lessonId },
    };
    if (values.studentId) payload.student = { id: values.studentId };
    onSave(payload);
  };

  /* ---------- render ---------- */
  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(submit)}>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <h1 className="text-xl font-semibold">
        {type === 'create'
          ? 'Create attendance record'
          : 'Update attendance'}
      </h1>

      <div className="flex flex-wrap gap-4 justify-between">
        {/* ID (read-only) when editing */}
        {type === 'update' && data?.id !== undefined && (
          <div className="flex flex-col gap-2 w-full md:w-[30%]">
            <label className="text-xs text-gray-500">ID</label>
            <input
              value={data.id}
              disabled
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm bg-gray-100 cursor-not-allowed"
            />
          </div>
        )}

        <InputField
          label="Date"
          name="date"
          type="date"
          register={register}
          error={errors.date}
        />

        {/* Status select */}
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">Status</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            {...register('status')}
          >
            <option value="PRESENT">PRESENT</option>
            <option value="LATE">LATE</option>
            <option value="ABSENT">ABSENT</option>
          </select>
          {errors.status && (
            <p className="text-xs text-red-400">{errors.status.message}</p>
          )}
        </div>

        {/* Lesson field: dropdown for teacher, numeric for others */}
        {isTeacher ? (
          <div className="flex flex-col gap-2 w-full md:w-[30%]">
            <label className="text-xs text-gray-500">Lesson</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
              {...register('lessonId')}
            >
              <option value="">— choose —</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.id} – {l.topic}
                </option>
              ))}
            </select>
            {lessonErr && <p className="text-xs text-red-400">{lessonErr}</p>}
            {errors.lessonId && (
              <p className="text-xs text-red-400">
                {errors.lessonId.message}
              </p>
            )}
          </div>
        ) : (
          <InputField
            label="Lesson ID"
            name="lessonId"
            register={register}
            error={errors.lessonId}
          />
        )}

        <InputField
          label="Student ID (optional)"
          name="studentId"
          register={register}
          error={errors.studentId}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded-md
                   disabled:bg-blue-300 disabled:cursor-not-allowed
                   hover:bg-blue-600 transition-colors"
      >
        {loading
          ? type === 'create'
            ? 'Creating…'
            : 'Updating…'
          : type === 'create'
          ? 'Create Attendance'
          : 'Update Attendance'}
      </button>
    </form>
  );
};

export default AttendanceForm;
