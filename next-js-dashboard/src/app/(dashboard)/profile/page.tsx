'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link  from 'next/link';
import { useAuth } from '@/context/authContext';
import api       from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
type InfoTileProps = { label: string; value?: string | number | null };

const InfoTile = ({ label, value }: InfoTileProps) =>
  value != null && value !== '' ? (
    <div className="bg-white border rounded-xl p-5 shadow transition hover:shadow-md">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-[15px] text-gray-800 break-words">{String(value)}</p>
    </div>
  ) : null;

/* map backend keys → human-readable labels */
const LABELS: Record<string, string> = {
  id:            'ID',
  fullName:      'Full Name',
  surname:       'Surname',
  email:         'Email',
  phone:         'Phone',
  address:       'Address',
  bloodType:     'Blood Type',
  sex:           'Sex',
  birthday:      'Birthday',
  subjectId:     'Subject ID',
  placeOfBirth:  'Place of Birth',
  classId:       'Class ID',
  matricule:     'Matricule',
  parentId:      'Parent ID',
};

const ROLE_FIELDS: Record<string, string[]> = {
  STUDENT: [
    'id',
    'fullName',
    'surname',
    'email',
    'phone',
    'classId',
    'matricule',
    'placeOfBirth',
    'parentId',
    'address',
    'bloodType',
    'sex',
    'birthday',
  ],
  TEACHER: [
    'id',
    'fullName',
    'email',
    'phone',
    'subjectId',
    'placeOfBirth',
    'bloodType',
    'sex',
    'birthday',
  ],
  PARENT: [
    'id',
    'fullName',
    'phone',
    'email',
    'address',
  ],
  ADMIN: [
    'id',
    'fullName',
    'email',
  ],
};

const endpointForRole = (role: string, id: string | number) => {
  switch (role) {
    case 'STUDENT': return `/students/${id}`;
    case 'TEACHER': return `/teachers/${id}`;
    case 'PARENT':  return `/parents/${id}`;
    case 'ADMIN':   return `/admins/${id}`;  // adjust if different
    default:        return `/users/${id}`;
  }
};

/* ------------------------------------------------------------------ */
/*  Profile Page                                                      */
/* ------------------------------------------------------------------ */
const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  /* ------------------------ fetch profile ------------------------ */
  useEffect(() => {
    if (authLoading || !user) return;

    (async () => {
      try {
        setBusy(true);
        const { role, userId } = user;
        const endpoint = endpointForRole(role, userId);
        const res      = await api.get(endpoint);
        /* some admin endpoints return an array */
        setData(Array.isArray(res.data) ? res.data[0] : res.data);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Failed to load profile');
      } finally {
        setBusy(false);
      }
    })();
  }, [authLoading, user]);

  /* ------------------------- states ------------------------------ */
  if (authLoading || busy) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Loading profile&hellip;
      </div>
    );
  }
  if (err) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        {err}
      </div>
    );
  }
  if (!data || !user) return null;

  const role         = user.role;
  const fieldsToShow = ROLE_FIELDS[role] ?? Object.keys(data);
  const displayName  =
    `${data.fullName ?? ''} ${data.surname ?? ''}`.trim() || 'Unnamed';
  const avatarSrc    = data.img || '/avatar.png';

  /* ----------------------------- UI ------------------------------ */
  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10 space-y-14">
      {/* ────────────── HERO ────────────── */}
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-lamaSky via-lamaPurple to-lamaPink shadow-lg">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent_70%)]" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10 px-8 py-16 sm:py-20">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
            <Image
              src={avatarSrc}
              alt="User avatar"
              fill
              className="rounded-full border-4 border-white object-cover shadow-xl"
            />
          </div>

          <div className="text-white">
            <h1 className="text-3xl sm:text-5xl font-extrabold drop-shadow-md leading-tight">
              {displayName}
            </h1>
            <p className="mt-2 text-lg sm:text-xl font-medium capitalize opacity-90 tracking-wide">
              {role.toLowerCase()}
            </p>
          </div>
        </div>
      </section>

      {/* ────────────── DETAILS GRID ────────────── */}
      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {fieldsToShow.map((key) => (
          <InfoTile key={key} label={LABELS[key] ?? key} value={data[key]} />
        ))}
        {/* always show role */}
        <InfoTile label="Role" value={role} />
      </section>

      
    </div>
  );
};

export default ProfilePage;
