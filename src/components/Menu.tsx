'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/authContext';

/* ------------ helper types ------------ */
type Role = 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';

interface MenuLink {
  icon: string;
  label: string;
  href: string;
  visible: Role[];
}

interface MenuSection {
  title: string;
  items: MenuLink[];
}

/* ------------ menu config ------------ */
const menuItems: MenuSection[] = [
  {
    title: 'MENU',
    items: [
      { icon: '/home.png',       label: 'Home',        href: '/',               visible: [] },
      { icon: '/teacher.png',    label: 'Teachers',    href: '/list/teachers',  visible: ['ADMIN', 'TEACHER'] },
      { icon: '/student.png',    label: 'Students',    href: '/list/students',  visible: ['ADMIN', 'TEACHER'] },
      { icon: '/parent.png',     label: 'Parents',     href: '/list/parents',   visible: ['ADMIN', 'TEACHER'] },
      { icon: '/subject.png',    label: 'Subjects',    href: '/list/subjects',  visible: ['ADMIN'] },
      { icon: '/class.png',      label: 'Classes',     href: '/list/classes',   visible: ['ADMIN', 'TEACHER'] },
      { icon: '/lesson.png',     label: 'Lessons',     href: '/list/lessons',   visible: ['ADMIN', 'TEACHER'] },
      { icon: '/exam.png',       label: 'Exams',       href: '/list/exams',     visible: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
      { icon: '/assignment.png', label: 'Assignments', href: '/list/assignments', visible: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
      { icon: '/result.png',     label: 'Results',     href: '/list/results',   visible: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
      { icon: '/attendance.png', label: 'Attendance',  href: '/list/attendance', visible: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
      { icon: '/calendar.png',   label: 'Events',      href: '/list/events',    visible: [] },
      { icon: '/message.png',    label: 'Messages',    href: '/list/announcements',  visible: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
      { icon: '/announcement.png', label: 'Announcements', href: '/list/announcements', visible: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    ],
  },
  {
    title: 'OTHER',
    items: [
      { icon: '/profile.png',  label: 'Profile',  href: '/profile',  visible: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
      { icon: '/setting.png',  label: 'Settings', href: '/settings', visible: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
      { icon: '/logout.png',   label: 'Logout',   href: '/sign-in',   visible: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    ],
  },
];

/* ------------ component ------------ */
const Menu = () => {
  const { user } = useAuth();

  if (!user) return null;          // still verifying token
  const role: Role = user.role;    // strongly-typed

  return (
      <div className="mt-4 text-sm">
        {menuItems.map(section => (
            <div key={section.title} className="flex flex-col gap-2">
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>

              {section.items
                  .filter(item => item.visible.includes(role))
                  .map(item => (
                      <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                      >
                        <Image src={item.icon} alt="" width={20} height={20} />
                        <span className="hidden lg:block">{item.label}</span>
                      </Link>
                  ))}
            </div>
        ))}
      </div>
  );
};

export default Menu;
