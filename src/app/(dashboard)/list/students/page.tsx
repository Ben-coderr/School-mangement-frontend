'use client';

import { useEffect, useState } from 'react';
import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';

type Student = {
  id: number;
  studentId: string;
  name: string;
  email?: string;
  photo: string;
  phone?: string;
  grade: number;
  class: string;
  address: string;
};

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student ID",
    accessor: "studentId",
    className: "hidden md:table-cell",
  },
  {
    header: "Grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const StudentListPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');

      // Transform new backend data structure to match frontend requirements
      const transformedStudents = response.data.map((student: any) => ({
        id: student.id,
        studentId: student.id || 'N/A',
        name: `${student.fullName || ''} ${student.surname || ''}`.trim(),
        email: student.email,
        photo: student.img || './avatar.png',
        phone: student.phone,
        grade: student.schoolClass?.grade?.level || 0,
        class: student.schoolClass?.name || 'Unassigned',
        address: student.address || 'No address',
      }));

      setStudents(transformedStudents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const renderRow = (item: Student) => (
      <tr
          key={item.id}
          className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">
          <Image
              src={item.photo}
              alt="Student photo"
              width={40}
              height={40}
              className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                // Fallback to default avatar if image fails to load
                e.currentTarget.src = './avatar.png';
              }}
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-xs text-gray-500">{item.class}</p>
          </div>
        </td>
        <td className="hidden md:table-cell">{item.studentId}</td>
        <td className="hidden md:table-cell">{item.grade}</td>
        <td className="hidden lg:table-cell">{item.phone || 'N/A'}</td>
        <td className="hidden lg:table-cell">{item.address}</td>
        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/students/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                <Image src="/view.png" alt="View" width={16} height={16} />
              </button>
            </Link>
            {user?.role === 'ADMIN' && (
                <FormModal table="student" type="delete" id={item.id} onSuccess={fetchStudents} />
            )}
          </div>
        </td>
      </tr>
  );

  if (loading) return <div className="p-4 text-center">Loading students...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="Filter" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="Sort" width={14} height={14} />
              </button>
              {user?.role === 'ADMIN' && (
                  <FormModal table="student" type="create" onSuccess={fetchStudents} />
              )}
            </div>
          </div>
        </div>

        <Table columns={columns} renderRow={renderRow} data={students} />
      </div>
  );
};

export default StudentListPage;