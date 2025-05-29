'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import Performance from "@/components/Performance";
import Image from "next/image";
import Link from "next/link";
import api from '@/lib/axios';

type Grade = {
  id: number;
  level: number;
};

type SchoolClass = {
  id: number;
  name: string;
  grade: Grade;
};

type Parent = {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
};

type Student = {
  id: number;
  fullName: string;
  surname: string;
  email: string;
  phone: string;
  schoolClass: SchoolClass | null;
  matricule: string;
  placeOfBirth: string;
  parent: Parent | null;
  address: string;
  img: string;
  bloodType: string;
  sex: string;
  birthday: string;
};

const SingleStudentPage = () => {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudent = async () => {
    try {
      const response = await api.get(`/students/${studentId}`);
      setStudent(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  if (loading) return <div className="flex-1 p-4">Loading...</div>;
  if (error) return <div className="flex-1 p-4">Error: {error}</div>;
  if (!student) return <div className="flex-1 p-4">Student not found</div>;

  return (
      <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
          {/* TOP */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* USER INFO CARD */}
            <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
              <div className="w-1/3">
                <Image
                    src={student.img || "/avatar.png"}
                    alt="Student photo"
                    width={144}
                    height={144}
                    className="w-36 h-36 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/avatar.png';
                    }}
                />
              </div>
              <div className="w-2/3 flex flex-col justify-between gap-4">
                <h1 className="text-xl font-semibold">
                  {student.fullName} {student.surname}
                </h1>
                <p className="text-sm text-gray-500">
                  {student.schoolClass
                      ? `Student in Grade ${student.schoolClass.grade.level}, Class ${student.schoolClass.name}`
                      : 'Unassigned to class'}
                </p>
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                  <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                    <Image src="/blood.png" alt="" width={14} height={14} />
                    <span>{student.bloodType || 'N/A'}</span>
                  </div>
                  <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                    <Image src="/date.png" alt="" width={14} height={14} />
                    <span>
                      {student.birthday
                          ? new Date(student.birthday).toLocaleDateString()
                          : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                    <Image src="/mail.png" alt="" width={14} height={14} />
                    <span>{student.email || 'N/A'}</span>
                  </div>
                  <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                    <Image src="/phone.png" alt="" width={14} height={14} />
                    <span>{student.phone || 'N/A'}</span>
                  </div>
                  {student.parent && (
                      <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                        <Image src="/parent.png" alt="" width={14} height={14} />
                        <span>{student.parent.fullName || 'N/A'}</span>
                      </div>
                  )}
                </div>
              </div>
            </div>
            {/* SMALL CARDS */}
            <div className="flex-1 flex gap-4 justify-between flex-wrap">
              {/* CARD */}
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                <Image
                    src="/singleAttendance.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6"
                />
                <div className="">
                  <h1 className="text-xl font-semibold">90%</h1>
                  <span className="text-sm text-gray-400">Attendance</span>
                </div>
              </div>
              {/* CARD */}
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                <Image
                    src="/singleBranch.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6"
                />
                <div className="">
                  <h1 className="text-xl font-semibold">
                    {student.schoolClass?.grade.level || 'N/A'}
                  </h1>
                  <span className="text-sm text-gray-400">Grade</span>
                </div>
              </div>
              {/* CARD */}
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                <Image
                    src="/singleLesson.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6"
                />
                <div className="">
                  <h1 className="text-xl font-semibold">18</h1>
                  <span className="text-sm text-gray-400">Lessons</span>
                </div>
              </div>
              {/* CARD */}
              <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                <Image
                    src="/singleClass.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6"
                />
                <div className="">
                  <h1 className="text-xl font-semibold">
                    {student.schoolClass?.name || 'N/A'}
                  </h1>
                  <span className="text-sm text-gray-400">Class</span>
                </div>
              </div>
            </div>
          </div>
          {/* BOTTOM */}
          <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
            <h1>Student&apos;s Schedule</h1>
            <BigCalendar />
          </div>
        </div>
        {/* RIGHT */}
        <div className="w-full xl:w-1/3 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-md">
            <h1 className="text-xl font-semibold">Shortcuts</h1>
            <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
              <Link className="p-3 rounded-md bg-lamaSkyLight" href="/">
                Student&apos;s Lessons
              </Link>
              <Link className="p-3 rounded-md bg-lamaPurpleLight" href="/">
                Student&apos;s Teachers
              </Link>
              <Link className="p-3 rounded-md bg-pink-50" href="/">
                Student&apos;s Exams
              </Link>
              <Link className="p-3 rounded-md bg-lamaSkyLight" href="/">
                Student&apos;s Assignments
              </Link>
              <Link className="p-3 rounded-md bg-lamaYellowLight" href="/">
                Student&apos;s Results
              </Link>
            </div>
          </div>
          <Performance />
          <Announcements />
        </div>
      </div>
  );
};

export default SingleStudentPage;