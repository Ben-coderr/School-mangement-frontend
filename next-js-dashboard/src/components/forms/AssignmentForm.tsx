'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '../InputField';
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';

/* ────────────────── Validation schema ────────────────── */
const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required!'),
  dueDate: z.string().min(1, 'Due date is required!'),
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

export type AssignmentInputs = z.infer<typeof assignmentSchema>;

/* ────────────────── Props ────────────────── */
type Props = {
  type: 'create' | 'update';
  data?: Partial<AssignmentInputs & { id: number; lesson?: { id: number } }>;
  onSave: (payload: any) => void;
  loading?: boolean;
  error?: string | null;
};

/* ────────────────── Component ────────────────── */
const AssignmentForm: React.FC<Props> = ({
  type,
  data,
  onSave,
  loading = false,
  error = null,
}) => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';

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
  } = useForm<AssignmentInputs>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title:     data?.title    ?? '',
      dueDate:   data?.dueDate  ?? '',
      lessonId:  data?.lessonId ?? data?.lesson?.id ?? '',
      studentId: data?.studentId ?? '',
    },
  });

  /* ---------- submit ---------- */
  const submit = (values: AssignmentInputs) => {
    const payload: any = {
      title:    values.title,
      dueDate:  values.dueDate,
      lessonId: values.lessonId,
    };
    if (values.studentId) payload.student = { id: values.studentId };
    onSave(payload);
  };

  /* ---------- render ---------- */
  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(submit)}>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create assignment' : 'Update assignment'}
      </h1>

      <div className="flex flex-wrap gap-4 justify-between">
        {/* ID (read-only) in update mode */}
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
          label="Title"
          name="title"
          register={register}
          error={errors.title}
        />
        <InputField
          label="Due Date"
          name="dueDate"
          type="date"
          register={register}
          error={errors.dueDate}
        />

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
              <p className="text-xs text-red-400">{errors.lessonId.message}</p>
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
          ? 'Create Assignment'
          : 'Update Assignment'}
      </button>
    </form>
  );
};

export default AssignmentForm;
