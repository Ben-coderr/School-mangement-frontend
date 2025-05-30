'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link  from 'next/link';

import FormModal       from '@/components/FormModal';
import BigCalendar, { CalendarEvent } from '@/components/BigCalender';   // 🟢 matches file name
import Performance     from '@/components/Performance';
import Announcements   from '@/components/Announcements';
import { useAuth }     from '@/context/authContext';
import api             from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Teacher = {
  id:          number;
  fullName:    string;
  email:       string;
  phone:       string;
  img:         string;
  bloodType:   string;
  sex:         string;
  birthday:    string;
  subjectId:   number;
  placeOfBirth:string;
};

type SchoolClass = { id: number; name: string; gradeId: number };

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const SingleTeacherPage = () => {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'ADMIN';

  const { id }   = useParams<{ id: string }>();
  const teacherId = id;

  /* ---------------- state ---------------- */
  const [teacher, setTeacher]   = useState<Teacher | null>(null);
  const [classes, setClasses]   = useState<SchoolClass[]>([]);
  const [events,  setEvents]    = useState<CalendarEvent[]>([]);  // ⬅ lessons for calendar

  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState('');

  /* --------------- fetch all --------------- */
  const fetchEverything = async () => {
    try {
      setLoading(true);

      /* Teacher details */
      const { data: t } = await api.get(`/teachers/${teacherId}`);
      setTeacher(t);

      /* Classes taught */
      try {
        const { data: cls } = await api.get(
          `/teachers/${teacherId}/students/classes`,
        );
        setClasses(cls);
      } catch {
        setClasses([]);
      }

      /* Lessons → calendar events */
      try {
        const { data: les } = await api.get(`/teachers/${teacherId}/lessons`);
        const evts: CalendarEvent[] = les.map((l: any) => ({
          id:    l.id,
          title: l.topic,
          start: new Date(`${l.lessonDate}T${l.startTime}`),
          end:   new Date(`${l.lessonDate}T${l.endTime}`),
        }));
        setEvents(evts);
      } catch {
        setEvents([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch teacher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) fetchEverything();
  }, [teacherId]);

  /* ---------------- guards ---------------- */
  if (loading) return <div className="p-4">Loading teacher…</div>;
  if (error)   return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!teacher) return <div className="p-4">Teacher not found</div>;

  /* ---------------- UI ------------------- */
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT column */}
      <div className="w-full xl:w-2/3">
        {/* Top section: info + stats */}
        <TopSection
          teacher={teacher}
          isAdmin={isAdmin}
          classCount={classes.length}
          lessonCount={events.length}
          onEdit={fetchEverything}
        />

        {/* Calendar */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1>Teacher&apos;s Schedule</h1>
          <BigCalendar events={events} />
        </div>
      </div>

      {/* RIGHT column */}
      <RightSidebar teacherId={teacherId} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */
const TopSection = ({
  teacher,
  isAdmin,
  classCount,
  lessonCount,
  onEdit,
}: {
  teacher: Teacher;
  isAdmin: boolean;
  classCount: number;
  lessonCount: number;
  onEdit: () => void;
}) => (
  <div className="flex flex-col lg:flex-row gap-4">
    {/* INFO CARD */}
    <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
      <div className="w-1/3">
        <Image
          src={teacher.img || '/avatar.png'}
          alt="Teacher avatar"
          width={144}
          height={144}
          className="w-36 h-36 rounded-full object-cover"
          onError={(e) => (e.currentTarget.src = '/avatar.png')}
        />
      </div>

      <div className="w-2/3 flex flex-col justify-between gap-4 text-white">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{teacher.fullName}</h1>
          {isAdmin && (
            <FormModal
              table="teacher"
              type="update"
              data={teacher}
              onSuccess={onEdit}
            />
          )}
        </div>

        <p className="text-sm">
          Subject ID: {teacher.subjectId ?? 'N/A'} — Birthplace:&nbsp;
          {teacher.placeOfBirth ?? 'N/A'}
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium">
          <Info icon="/blood.png" val={teacher.bloodType} />
          <Info
            icon="/date.png"
            val={
              teacher.birthday
                ? new Date(teacher.birthday).toLocaleDateString()
                : 'N/A'
            }
          />
          <Info icon="/mail.png"  val={teacher.email} />
          <Info icon="/phone.png" val={teacher.phone} />
        </div>
      </div>
    </div>

    {/* MINI CARDS */}
    <div className="flex-1 flex gap-4 flex-wrap">
      <Mini icon="/singleAttendance.png" val="92%"       label="Attendance" />
      <Mini icon="/singleBranch.png"     val={teacher.subjectId} label="Subject ID" />
      <Mini icon="/singleLesson.png"     val={lessonCount} label="Lessons" />
      <Mini icon="/singleClass.png"      val={classCount}  label="Classes" />
    </div>
  </div>
);

const RightSidebar = ({ teacherId }: { teacherId: string }) => (
  <div className="w-full xl:w-1/3 flex flex-col gap-4">
    <div className="bg-white p-4 rounded-md">
      <h1 className="text-xl font-semibold">Shortcuts</h1>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <Shortcut
          href={`/teachers/${teacherId}/classes`}
          text="Teacher's Classes"
          color="bg-lamaSkyLight"
        />
        <Shortcut
          href={`/teachers/${teacherId}/students`}
          text="Teacher's Students"
          color="bg-lamaPurpleLight"
        />
        <Shortcut
          href={`/teachers/${teacherId}/lessons`}
          text="Teacher's Lessons"
          color="bg-lamaYellowLight"
        />
        <Shortcut
          href={`/teachers/${teacherId}/exams`}
          text="Teacher's Exams"
          color="bg-pink-50"
        />
        <Shortcut
          href={`/teachers/${teacherId}/assignments`}
          text="Teacher's Assignments"
          color="bg-lamaSkyLight"
        />
      </div>
    </div>

    <Performance />
    <Announcements />
  </div>
);

/* ---------------- visual helpers ---------------- */
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
  text,
  color,
}: {
  href: string;
  text: string;
  color: string;
}) => (
  <Link href={href} className={`p-3 rounded-md ${color}`}>
    {text}
  </Link>
);

export default SingleTeacherPage;
