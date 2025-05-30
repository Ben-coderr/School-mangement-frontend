'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link  from 'next/link';

import Table           from '@/components/Table';
import FormModal       from '@/components/FormModal';
import TableSearch, { SearchField } from '@/components/TableSearch';
import { useAuth }      from '@/context/authContext';
import api              from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Teacher = {
  id:         number;
  fullName:   string;
  email:      string;
  phone:      string;
  img:        string;
  bloodType:  string;
  sex:        string;
  birthday:   string;
  subjectId:  number;
  placeOfBirth: string;
  /* raw keys for client-side sort */
  [key: string]: any;
};

/* ------------------------------------------------------------------ */
/*  Table columns (match new API)                                      */
/* ------------------------------------------------------------------ */
const columns = [
  { header: 'Info',             accessor: 'info' },
  { header: 'ID',               accessor: 'id',             className: 'hidden md:table-cell' },
  { header: 'Subject ID',       accessor: 'subjectId',      className: 'hidden md:table-cell' },
  { header: 'Blood Type',       accessor: 'bloodType',      className: 'hidden md:table-cell' },
  { header: 'Sex',              accessor: 'sex',            className: 'hidden lg:table-cell' },
  { header: 'Birthday',         accessor: 'birthday',       className: 'hidden lg:table-cell' },
  { header: 'Phone',            accessor: 'phone',          className: 'hidden xl:table-cell' },
  { header: 'Place of Birth',   accessor: 'placeOfBirth',   className: 'hidden xl:table-cell' },
  { header: 'Actions',          accessor: 'action' },
];

/* ------------------------------------------------------------------ */
/*  Searchable fields                                                  */
/* ------------------------------------------------------------------ */
const TEACHER_FIELDS: SearchField[] = [
  { label: 'ID',        value: 'id' },
  { label: 'Name',      value: 'fullName' },
  { label: 'Subject',   value: 'subjectId' },
];

/* ------------------------------------------------------------------ */
/*  Sort algorithms                                                    */
/* ------------------------------------------------------------------ */
const SORT_ALGOS = ['bubble', 'insertion', 'selection', 'quick', 'merge'] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const TeacherListPage = () => {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'ADMIN';

  const [teachers,  setTeachers]  = useState<Teacher[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [error,     setError]     = useState('');

  const [searchTerm,  setSearchTerm]  = useState('');
  const [searchField, setSearchField] = useState('id');

  const [sortField, setSortField] = useState<string>('fullName');
  const [sortAlgo,  setSortAlgo]  = useState<typeof SORT_ALGOS[number]>('bubble');

  /* ---------------------- helpers ---------------------- */
  const transform = (t: any): Teacher => ({
    ...t,
    img: t.img || '/avatar.png',
  });

  const fetchTeachers = async () => {
    if (firstLoad) setLoading(true);
    try {
      const { data } = await api.get('/teachers');
      setTeachers(data.map(transform));
      if (firstLoad) setFirstLoad(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  /* ------------------ search ------------------ */
  const searchTeachers = async (field: string, value: string) => {
    setSearchTerm(value);
    setSearchField(field);
    const { data }  = await api.get(`/teachers/search/${field}/${encodeURIComponent(value)}`);
    const list      = Array.isArray(data) ? data : [data];
    return list.map(transform);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchField('id');
    fetchTeachers();
  };

  /* ------------------ sort ------------------ */
  const sortTeachers = async () => {
    if (searchTerm.trim()) {
      const sorted = [...teachers].sort((a: any, b: any) => {
        const fa = a[sortField];
        const fb = b[sortField];
        if (typeof fa === 'number' && typeof fb === 'number') return fa - fb;
        return String(fa).localeCompare(String(fb));
      });
      setTeachers(sorted);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/teachers/sort/${sortField}?algo=${sortAlgo}`);
      setTeachers(data.map(transform));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sort failed');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ row renderer ------------------ */
  const renderRow = (item: Teacher) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* Info */}
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img}
          alt="Teacher avatar"
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
          onError={(e) => (e.currentTarget.src = '/avatar.png')}
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.fullName}</h3>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      </td>

      <td className="hidden md:table-cell">{item.id}</td>
      <td className="hidden md:table-cell">{item.subjectId}</td>
      <td className="hidden md:table-cell">{item.bloodType}</td>
      <td className="hidden lg:table-cell">{item.sex}</td>
      <td className="hidden lg:table-cell">
        {new Date(item.birthday).toLocaleDateString()}
      </td>
      <td className="hidden xl:table-cell">{item.phone}</td>
      <td className="hidden xl:table-cell">{item.placeOfBirth}</td>

      {/* Actions */}
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="View" width={16} height={16} />
            </button>
          </Link>
          {isAdmin && (
            <FormModal
              table="teacher"
              type="delete"
              id={item.id}
              onSuccess={fetchTeachers}
            />
          )}
        </div>
      </td>
    </tr>
  );

  /* ------------------ states ------------------ */
  if (firstLoad && loading) return <div className="p-4 text-center">Loading teachers…</div>;
  if (error)                return <div className="p-4 text-red-500">Error: {error}</div>;

  /* ------------------ render ------------------ */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="hidden md:block text-lg font-semibold">Teachers</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch
            fields={TEACHER_FIELDS}
            trigger="both"
            search={searchTeachers}
            onResults={setTeachers}
            onClear={clearSearch}
          />

          <div className="flex items-center gap-2 self-end">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="text-xs ring-1 ring-gray-300 rounded px-2 py-1 bg-transparent"
            >
              {TEACHER_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

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

            <button
              type="button"
              onClick={sortTeachers}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow disabled:opacity-50"
              title="Sort"
            >
              {loading && !firstLoad ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="4" fill="none" />
                </svg>
              ) : (
                <Image src="/sort.png" alt="Sort" width={14} height={14} />
              )}
            </button>

            {isAdmin && (
              <FormModal table="teacher" type="create" onSuccess={fetchTeachers} />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        key={`${searchTerm}-${sortField}-${sortAlgo}-${teachers.map((t) => t.id).join('-')}`}
        columns={columns}
        renderRow={renderRow}
        data={teachers}
      />
    </div>
  );
};

export default TeacherListPage;
