'use client';

import { useEffect, useMemo, useState } from 'react';
import FormModal from '@/components/FormModal';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import Image from 'next/image';
import { useAuth } from '@/context/authContext';
import api from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Result = {
    id: number;
    score: number;
    kind: 'EXAM' | 'CC';
    studentId: number;
    examId: number;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ResultListPage = () => {
    const { user } = useAuth();

    const isAdmin   = user?.role === 'ADMIN';
    const isTeacher = user?.role === 'TEACHER';
    const isStudent = user?.role === 'STUDENT';
    const isParent  = user?.role === 'PARENT';

    const canEdit = isAdmin || isTeacher;

    /* ------------------------- columns ------------------------------ */
    const tableColumns = useMemo(() => {
        const base = [
            { header: 'Kind', accessor: 'kind' },
            { header: 'Score', accessor: 'score' },
            {
                header: 'Exam ID',
                accessor: 'examId',
                className: 'hidden md:table-cell',
            },
        ];

        // Show Student ID for everyone except the student himself
        if (!isStudent) {
            base.splice(1, 0, {
                header: 'Student ID',
                accessor: 'studentId',
                className: 'hidden md:table-cell',
            });
        }

        if (canEdit) base.push({ header: 'Actions', accessor: 'action' });

        return base;
    }, [isStudent, canEdit]);

    /* ---------------------- data / fetch ---------------------------- */
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchResults = async () => {
        if (!user) return;

        const endpoint = isStudent
            ? `/students/${user.userId}/results`
            : isParent
                ? `/parents/${user.userId}/students/results`
                : '/results';

        try {
            const { data } = await api.get(endpoint);
            setResults(
                data.map((r: any) => ({
                    id: r.id,
                    score: r.score,
                    kind: r.kind,
                    studentId: r.studentId,
                    examId: r.examId,
                })),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            setLoading(true);
            fetchResults();
        }
    }, [user]);

    /* ----------------------- row renderer --------------------------- */
    const renderRow = (item: Result) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
        >
            <td className="p-4">{item.kind}</td>

            {!isStudent && (
                <td className="hidden md:table-cell">{item.studentId}</td>
            )}

            <td>{item.score}</td>
            <td className="hidden md:table-cell">{item.examId}</td>

            {canEdit && (
                <td>
                    <div className="flex items-center gap-2">
                        <FormModal
                            table="result"
                            type="update"
                            data={item}
                            onSuccess={fetchResults}
                        />
                        <FormModal
                            table="result"
                            type="delete"
                            id={item.id}
                            onSuccess={fetchResults}
                        />
                    </div>
                </td>
            )}
        </tr>
    );

    /* ---------------------------- ui states ------------------------- */
    if (loading) return <div className="p-4 text-center">Loading results…</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    /* ---------------------------- render ---------------------------- */
    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* toolbar */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Results</h1>

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
                                table="result"
                                type="create"
                                onSuccess={fetchResults}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* table */}
            <Table columns={tableColumns} renderRow={renderRow} data={results} />

            {/* pagination — enable when you need it */}
            {/* <Pagination /> */}
        </div>
    );
};

export default ResultListPage;
