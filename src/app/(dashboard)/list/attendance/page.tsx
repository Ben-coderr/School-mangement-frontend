'use client';

import { useEffect, useMemo, useState } from 'react';
import FormModal from '@/components/FormModal';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import Image from 'next/image';
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Attendance = {
    id: number;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    lessonId: number;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const AttendanceListPage = () => {
    const { user } = useAuth();
    const canEdit = user?.role === 'ADMIN' || user?.role === 'TEACHER';
    const isStudent = user?.role === 'STUDENT';

    /* ------------- build column list once role is known -------------- */
    const tableColumns = useMemo(
        () => [
            { header: 'Date', accessor: 'date' },
            { header: 'Status', accessor: 'status' },
            {
                header: 'Lesson ID',
                accessor: 'lessonId',
                className: 'hidden md:table-cell',
            },
            ...(canEdit ? [{ header: 'Actions', accessor: 'action' }] : []),
        ],
        [canEdit],
    );

    /* ---------------------------- data ------------------------------- */
    const [records, setRecords] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAttendance = async () => {
        if (!user) return; // wait for user object

        const endpoint = isStudent
            ? `/students/${user.userId}/attendance`
            : '/attendances';

        try {
            const { data } = await api.get(endpoint);
            setRecords(
                data.map((r: any) => ({
                    id: r.id,
                    date: r.date,
                    status: r.status,
                    lessonId: r.lessonId,
                })),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    /* fetch again whenever the user info (and id) becomes available */
    useEffect(() => {
        if (user) {
            setLoading(true);      // reset spinner when role changes
            fetchAttendance();
        }
    }, [user]);               // only runs when user updates

    /* ------------------------- Row renderer ------------------------- */
    const renderRow = (item: Attendance) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
        >
            {/* Date */}
            <td className="p-4">{item.date}</td>

            {/* Status badge */}
            <td>
        <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'PRESENT'
                    ? 'bg-green-100 text-green-700'
                    : item.status === 'ABSENT'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
            }`}
        >
          {item.status}
        </span>
            </td>

            {/* Lesson ID */}
            <td className="hidden md:table-cell">{item.lessonId}</td>

            {/* Actions — only teachers/admins */}
            {canEdit && (
                <td>
                    <div className="flex items-center gap-2">
                        <FormModal
                            table="attendance"
                            type="update"
                            data={item}
                            onSuccess={fetchAttendance}
                        />
                        <FormModal
                            table="attendance"
                            type="delete"
                            id={item.id}
                            onSuccess={fetchAttendance}
                        />
                    </div>
                </td>
            )}
        </tr>
    );

    /* ------------------------- States ------------------------------ */
    if (loading) return <div className="p-4 text-center">Loading attendance…</div>;
    if (error)    return <div className="p-4 text-red-500">Error: {error}</div>;

    /* ------------------------- Render ------------------------------ */
    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Attendance Records</h1>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/filter.png" alt="Filter" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/sort.png" alt="Sort" width={14} height={14} />
                        </button>
                        {canEdit && (
                            <FormModal
                                table="attendance"
                                type="create"
                                onSuccess={fetchAttendance}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <Table columns={tableColumns} renderRow={renderRow} data={records} />


        </div>
    );
};

export default AttendanceListPage;
