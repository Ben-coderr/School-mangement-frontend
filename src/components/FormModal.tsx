"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import api from "@/lib/axios";

type TableType =
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";

type FormType = "create" | "update" | "delete";

type FormModalProps = {
  table: TableType;
  type: FormType;
  data?: any;
  id?: number;
  onSuccess?: () => void;
};

const forms: {
  [key in TableType]: (type: "create" | "update", data?: any) => JSX.Element;
} = {
  teacher: (type, data) => <TeacherForm type={type} data={data} />,
  student: (type, data) => <StudentForm type={type} data={data} />,
  parent: () => <div>Parent Form</div>,
  subject: () => <div>Subject Form</div>,
  class: () => <div>Class Form</div>,
  lesson: () => <div>Lesson Form</div>,
  exam: () => <div>Exam Form</div>,
  assignment: () => <div>Assignment Form</div>,
  result: () => <div>Result Form</div>,
  attendance: () => <div>Attendance Form</div>,
  event: () => <div>Event Form</div>,
  announcement: () => <div>Announcement Form</div>,
};

const FormModal = ({ table, type, data, id, onSuccess }: FormModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      await api.delete(`/${table}s/${id}`);
      onSuccess?.();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const FormContent = () => {
    if (type === "delete") {
      return (
          <form onSubmit={handleDelete} className="p-4 flex flex-col gap-4">
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center disabled:bg-red-400"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </form>
      );
    }

    if (type === "create" || type === "update") {
      return forms[table](type, data);
    }

    return <div>Form not found!</div>;
  };

  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
      type === "create"
          ? "bg-lamaYellow"
          : type === "update"
              ? "bg-lamaSky"
              : "bg-lamaPurple";

  return (
      <>
        <button
            className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
            onClick={() => setOpen(true)}
        >
          <Image src={`/${type}.png`} alt="" width={16} height={16} />
        </button>

        {open && (
            <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
                <FormContent />
                <button
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                >
                  <Image src="/close.png" alt="Close" width={14} height={14} />
                </button>
              </div>
            </div>
        )}
      </>
  );
};

// Lazy-loaded components
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});

const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});

export default FormModal;