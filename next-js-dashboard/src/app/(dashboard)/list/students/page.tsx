'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link  from 'next/link';

import Table           from '@/components/Table';
import FormModal       from '@/components/FormModal';
import TableSearch, {
  SearchField,
}                       from '@/components/TableSearch';
import { useAuth }      from '@/context/authContext';
import api              from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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
  /* raw keys for client-side sort fallback */
  [key: string]: any;
};

/* ------------------------------------------------------------------ */
/*  Table columns                                                      */
/* ------------------------------------------------------------------ */

const columns = [
  { header: 'Info',       accessor: 'info' },
  { header: 'Student ID', accessor: 'studentId', className: 'hidden md:table-cell' },
  { header: 'Grade',      accessor: 'grade',     className: 'hidden md:table-cell' },
  { header: 'Phone',      accessor: 'phone',     className: 'hidden lg:table-cell' },
  { header: 'Address',    accessor: 'address',   className: 'hidden lg:table-cell' },
  { header: 'Actions',    accessor: 'action' },
];

/* ------------------------------------------------------------------ */
/*  Fields the backend accepts (search + sort)                         */
/* ------------------------------------------------------------------ */

const STUDENT_FIELDS: SearchField[] = [
  { label: 'ID',             value: 'id' },
  { label: 'Surname',        value: 'surname' },
  
];

const SORT_ALGOS = ['bubble', 'insertion', 'selection', 'quick', 'merge'] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const StudentListPage = () => {
  const { user } = useAuth();

  const isAdmin   = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const isParent  = user?.role === 'PARENT';

  /* ----------------------------- data ----------------------------- */
  const [students,  setStudents]  = useState<Student[]>([]);
  const [loading,   setLoading]   = useState(false);  // spinner for later actions
  const [firstLoad, setFirstLoad] = useState(true);   // banner only once
  const [error,     setError]     = useState('');

  /* active search */
  const [searchTerm,  setSearchTerm]  = useState('');
  const [searchField, setSearchField] = useState('id');

  /* sort controls */
  const [sortField, setSortField] = useState<string>('surname');
  const [sortAlgo,  setSortAlgo]  = useState<typeof SORT_ALGOS[number]>('bubble');

  /* ----------------------- helpers -------------------------------- */
  const transform = (s: any): Student => ({
    ...s,  /* keep all raw keys */
    studentId: s.id ?? 'N/A',
    name:      `${s.fullName ?? ''} ${s.surname ?? ''}`.trim(),
    photo:     s.img || './avatar.png',
    grade:     s.schoolClass?.grade?.level ?? 0,
    class:     s.schoolClass?.name ?? 'Unassigned',
  });

  const fetchStudents = async () => {
    if (!user) return;

    const endpoint = isTeacher
      ? `/teachers/${user.userId}/students`
      : isParent
      ? `/parents/${user.userId}/students`
      : '/students';

    if (firstLoad) setLoading(true);

    try {
      const { data } = await api.get(endpoint);
      setStudents(data.map(transform));
      if (firstLoad) setFirstLoad(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  /* initial load */
  useEffect(() => {
    fetchStudents();
  }, [user]);

  /* ---------------------- search helper --------------------------- */
  const searchStudents = async (field: string, value: string) => {
    setSearchTerm(value);
    setSearchField(field);

    const { data } = await api.get(
      `/students/search/${field}/${encodeURIComponent(value)}`
    );
    const list = Array.isArray(data) ? data : [data];
    return list.map(transform);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchField('id');
    fetchStudents();
  };

  /* ---------------------- sort helper ----------------------------- */
  const sortStudents = async () => {
    if (searchTerm.trim()) {
      /* client-side sort of current search result */
      const sorted = [...students].sort((a: any, b: any) => {
        const fa = a[sortField];
        const fb = b[sortField];
        if (typeof fa === 'number' && typeof fb === 'number') return fa - fb;
        return String(fa).localeCompare(String(fb));
      });
      setStudents(sorted);
      return;
    }

    /* backend sort */
    try {
      setLoading(true);
      const { data } = await api.get(
        `/students/sort/${sortField}?algo=${sortAlgo}`
      );
      setStudents(data.map(transform));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sort failed');
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------- row UI ---------------------------- */
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
          onError={(e) => (e.currentTarget.src = './avatar.png')}
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.class}</p>
        </div>
      </td>

      <td className="hidden md:table-cell">{item.studentId}</td>
      <td className="hidden md:table-cell">{item.grade}</td>
      <td className="hidden lg:table-cell">{item.phone ?? 'N/A'}</td>
      <td className="hidden lg:table-cell">{item.address}</td>

      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="View" width={16} height={16} />
            </button>
          </Link>
          {isAdmin && (
            <FormModal
              table="student"
              type="delete"
              id={item.id}
              onSuccess={fetchStudents}
            />
          )}
        </div>
      </td>
    </tr>
  );

  /* --------------------------- states ----------------------------- */
  if (firstLoad && loading) {
    return <div className="p-4 text-center">Loading students…</div>;
  }
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  /* --------------------------- render ----------------------------- */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="hidden md:block text-lg font-semibold">Students</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* SEARCH */}
          <TableSearch
            fields={STUDENT_FIELDS}
            trigger="both"
            search={searchStudents}
            onResults={setStudents}
            onClear={clearSearch}
          />

          {/* SORT */}
          <div className="flex items-center gap-2 self-end">
            {/* field pick */}
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="text-xs ring-1 ring-gray-300 rounded px-2 py-1 bg-transparent"
            >
              {STUDENT_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            {/* algo pick – disabled when search active */}
            <select
              value={sortAlgo}
              onChange={(e) => setSortAlgo(e.target.value as any)}
              disabled={!!searchTerm.trim()}
              className="text-xs ring-1 ring-gray-300 rounded px-2 py-1 bg-transparent disabled:opacity-50"
            >
              {SORT_ALGOS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            {/* sort button */}
            <button
              type="button"
              onClick={sortStudents}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow disabled:opacity-50"
              title="Sort"
            >
              {loading && !firstLoad ? (
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="4"
                    fill="none"
                  />
                </svg>
              ) : (
                <Image src="/sort.png" alt="Sort" width={14} height={14} />
              )}
            </button>

            {/* example filter btn */}
            {/* <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
            >
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button> */}

            {isAdmin && (
              <FormModal
                table="student"
                type="create"
                onSuccess={fetchStudents}
              />
            )}
          </div>
        </div>
      </div>

      {/* Table – re-mounts when search/sort mutate list */}
      <Table
        key={`${searchTerm}-${sortField}-${sortAlgo}-${students.map((s) => s.id).join('-')}`}
        columns={columns}
        renderRow={renderRow}
        data={students}
      />
    </div>
  );
};

export default StudentListPage;
