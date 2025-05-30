'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link  from 'next/link';

import BigCalendar, { CalendarEvent } from '@/components/BigCalender';
import Announcements from '@/components/Announcements';
import Performance   from '@/components/Performance';
import api           from '@/lib/axios';

/* --------- Backend shapes (only fields actually used) ------------- */
type Student = {
  id: number;
  fullName: string;
  surname: string;
  email: string;
  phone: string;
  classId?: number;
  img: string;
  bloodType: string;
  birthday: string;
  parent?: { fullName: string };
};

type AttendanceStats = { percentage: number };
type ClassItem       = { id: number; name: string; gradeId: number };
type Grade           = { id: number; level: number };

/* ------------------------ Component ------------------------------- */
const SingleStudentPage = () => {
  const { id }    = useParams<{ id: string }>();
  const studentId = id;

  const [student, setStudent]       = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceStats | null>(null);
  const [schoolClass, setClass]     = useState<ClassItem | null>(null);
  const [grade, setGrade]           = useState<Grade | null>(null);
  const [events, setEvents]         = useState<CalendarEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  /* -------------- fetch everything on mount ---------------------- */
  useEffect(() => {
    if (!studentId) return;

    (async () => {
      try {
        setLoading(true);

        /* 1) Student */
        const { data: stu } = await api.get(`/students/${studentId}`);
        setStudent(stu);

        /* 2) Attendance % */
        try {
          const { data: att } = await api.get(
            `/students/${studentId}/attendance/percentage`,
          );
          setAttendance(att);
        } catch {
          setAttendance(null);
        }

        /* 3) Class & grade */
        if (stu.classId) {
          const { data: cls } = await api.get(`/classes/${stu.classId}`);
          setClass(cls);

          if (cls.gradeId) {
            const { data: gr } = await api.get(`/grades/${cls.gradeId}`);
            setGrade(gr);
          }
        }

        /* 4) Lessons -> calendar events */
        const { data: lessons } = await api.get(
          `/students/${studentId}/lessons`,
        );
        const evts: CalendarEvent[] = lessons.map((l: any) => ({
          id:    l.id,
          title: l.topic,
          start: new Date(`${l.lessonDate}T${l.startTime}`),
          end:   new Date(`${l.lessonDate}T${l.endTime}`),
        }));
        setEvents(evts);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch student');
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  /* --------------------- UI guards ------------------------------- */
  if (loading) return <div className="p-4">Loading…</div>;
  if (error)   return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!student) return <div className="p-4">Student not found</div>;

  /* ------------------------ Render ------------------------------- */
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT column */}
      <div className="w-full xl:w-2/3">
        {/* Info & mini cards */}
        <TopSection
          student={student}
          attendance={attendance}
          schoolClass={schoolClass}
          grade={grade}
          events={events}
        />

        {/* Calendar */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1>Schedule</h1>
          <BigCalendar events={events} />
        </div>
      </div>

      {/* RIGHT column */}
      <RightSidebar />
    </div>
  );
};

/* ----------------- Smaller reusable pieces ----------------------- */
const TopSection = ({
  student,
  attendance,
  schoolClass,
  grade,
  events,
}: {
  student: Student;
  attendance: AttendanceStats | null;
  schoolClass: ClassItem | null;
  grade: Grade | null;
  events: CalendarEvent[];
}) => (
  <div className="flex flex-col lg:flex-row gap-4">
    {/* Info card */}
    <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
      <div className="w-1/3">
        <Image
          src={student.img || '/avatar.png'}
          alt="Student avatar"
          width={144}
          height={144}
          className="w-36 h-36 rounded-full object-cover"
        />
      </div>
      <div className="w-2/3 flex flex-col justify-between gap-4">
        <h1 className="text-xl font-semibold">
          {student.fullName} {student.surname}
        </h1>
        <p className="text-sm text-gray-100">
          {grade
            ? `Grade ${grade.level} — Class ${schoolClass?.name ?? 'N/A'}`
            : 'Unassigned to class'}
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium">
          <Info icon="/blood.png" val={student.bloodType} />
          <Info
            icon="/date.png"
            val={
              student.birthday
                ? new Date(student.birthday).toLocaleDateString()
                : 'N/A'
            }
          />
          <Info icon="/mail.png" val={student.email} />
          <Info icon="/phone.png" val={student.phone} />
          {student.parent && (
            <Info icon="/parent.png" val={student.parent.fullName} />
          )}
        </div>
      </div>
    </div>

    {/* Mini-cards */}
    <div className="flex-1 flex gap-4 flex-wrap">
      <Mini
        icon="/singleAttendance.png"
        val={
          attendance
            ? Math.floor(attendance.percentage * 10) / 10 + '%'
            : 'N/A'
        }
        label="Attendance"
      />
      <Mini
        icon="/singleBranch.png"
        val={grade?.level ?? 'N/A'}
        label="Grade"
      />
      <Mini
        icon="/singleLesson.png"
        val={events.length}
        label="Lessons"
      />
      <Mini
        icon="/singleClass.png"
        val={schoolClass?.name ?? 'N/A'}
        label="Class"
      />
    </div>
  </div>
);

const RightSidebar = () => (
  <div className="w-full xl:w-1/3 flex flex-col gap-4">
    <div className="bg-white p-4 rounded-md">
      <h1 className="text-xl font-semibold">Shortcuts</h1>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <Shortcut href="/list/lessons"     txt="Lessons"     color="bg-lamaSkyLight" />
        <Shortcut href="/list/teachers"    txt="Teachers"    color="bg-lamaPurpleLight" />
        <Shortcut href="/list/exams"       txt="Exams"       color="bg-pink-50" />
        <Shortcut href="/list/assignments" txt="Assignments" color="bg-lamaSkyLight" />
        <Shortcut href="/list/results"     txt="Results"     color="bg-lamaYellowLight" />
      </div>
    </div>
    <Performance />
    <Announcements />
  </div>
);

const Info = ({ icon, val }: { icon: string; val?: string | number }) => (
  <span className="inline-flex items-center gap-1">
    <Image src={icon} alt="" width={14} height={14} />
    {val ?? 'N/A'}
  </span>
);

const Mini = ({
  icon,
  val,
  label,
}: {
  icon: string;
  val: string | number;
  label: string;
}) => (
  <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
    <Image src={icon} alt="" width={24} height={24} className="w-6 h-6" />
    <div>
      <h1 className="text-xl font-semibold">{val}</h1>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  </div>
);

const Shortcut = ({
  href,
  txt,
  color,
}: {
  href: string;
  txt: string;
  color: string;
}) => (
  <Link href={href} className={`p-3 rounded-md ${color}`}>
    {txt}
  </Link>
);

export default SingleStudentPage;
