"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import api from "@/lib/axios";

/* ─────────────────── Types ─────────────────── */

type Table =
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

type Mode = "create" | "update" | "delete";

interface Props {
  table: Table;
  type: Mode;
  data?: any;    // row data for "update"
  id?: number;   // row id   for "update" & "delete"
  onSuccess?: () => void;
}

/* ─────────────────── Lazy-loaded forms ─────────────────── */

const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <p className="p-4">Loading…</p>,
});
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <p className="p-4">Loading…</p>,
});

/* ─────────────────── Component ─────────────────── */

const FormModal: React.FC<Props> = ({
                                      table,
                                      type,
                                      data,
                                      id,
                                      onSuccess,
                                    }) => {
  const [open,    setOpen]  = useState(false);
  const [loading, setLoad]  = useState(false);
  const [error,   setError] = useState<string | null>(null);

  /* ---------- POST / PUT helper ---------- */
  async function saveRow(payload: any) {
    setLoad(true);
    setError(null);

    try {
      if (type === "create") {
        await api.post(`/${table}s`, payload);
      } else {
        if (!id) throw new Error("Missing id for update");
        await api.put(`/${table}s/${id}`, payload);
      }
      onSuccess?.();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoad(false);
    }
  }

  /* ---------- DELETE helper ---------- */
  async function deleteRow(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    setLoad(true);
    setError(null);

    try {
      await api.delete(`/${table}s/${id}`);
      onSuccess?.();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoad(false);
    }
  }

  /* ---------- Choose form content ---------- */
  function renderForm() {
    if (type === "delete") {
      return (
          <form onSubmit={deleteRow} className="p-4 flex flex-col gap-4">
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="bg-red-700 text-white py-2 px-4 rounded-md self-center disabled:bg-red-400"
            >
              {loading ? "Deleting…" : "Delete"}
            </button>
          </form>
      );
    }

    /* create / update */
    const common = { type, data, onSave: saveRow, loading, error };

    switch (table) {
      case "student":
        return <StudentForm {...common} />;
      case "teacher":
        return <TeacherForm {...common} />;
        /* add more forms when you implement them */
      default:
        return <p className="p-4">Form for “{table}” not implemented.</p>;
    }
  }

  /* ---------- Trigger-button styling ---------- */
  const triggerSize  = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const triggerColor =
      type === "create"
          ? "bg-lamaYellow"
          : type === "update"
              ? "bg-lamaSky"
              : "bg-lamaPurple";

  /* ---------- Render ---------- */
  return (
      <>
        <button
            onClick={() => setOpen(true)}
            className={`${triggerSize} flex items-center justify-center rounded-full ${triggerColor}`}
        >
          <Image src={`/${type}.png`} alt="" width={16} height={16} />
        </button>

        {open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
                {renderForm()}

                <button
                    disabled={loading}
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4"
                >
                  <Image src="/close.png" alt="Close" width={14} height={14} />
                </button>
              </div>
            </div>
        )}
      </>
  );
};

export default FormModal;
