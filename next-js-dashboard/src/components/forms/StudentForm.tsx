"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import InputField from "../InputField";

/* ───────── Validation schema ───────── */

export const studentSchema = z.object({
  fullName:     z.string().min(1, "Full name is required!"),
  surname:      z.string().min(1, "Surname is required!"),
  email:        z.string().email("Invalid email address!"),
  phone:        z.string().min(1, "Phone is required!"),
  address:      z.string().min(1, "Address is required!"),
  bloodType:    z.string().min(1, "Blood Type is required!"),
  birthday:     z.string().min(1, "Birthday is required!"),
  sex:          z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  img:          z.string().url("Invalid image URL!").optional(),
  matricule:    z.string().min(1, "Matricule is required!"),
  placeOfBirth: z.string().min(1, "Place of birth is required!"),
});

export type StudentInputs = z.infer<typeof studentSchema>;

type Props = {
  type: "create" | "update";
  data?: Partial<StudentInputs>;
  onSave: (data: StudentInputs) => void;
  loading?: boolean;
  error?: string | null;
};

const StudentForm: React.FC<Props> = ({
                                        type,
                                        data,
                                        onSave,
                                        loading = false,
                                        error = null,
                                      }) => {
  const [preview, setPreview] = useState<string | null>(data?.img || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<StudentInputs>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName:     data?.fullName     ?? "",
      surname:      data?.surname      ?? "",
      email:        data?.email        ?? "",
      phone:        data?.phone        ?? "",
      address:      data?.address      ?? "",
      bloodType:    data?.bloodType    ?? "",
      birthday:     data?.birthday?.split("T")[0] ?? "",
      sex:          data?.sex          ?? "MALE",
      img:          data?.img          ?? "",
      matricule:    data?.matricule    ?? "",
      placeOfBirth: data?.placeOfBirth ?? "",
    },
  });

  /* live preview + validate img */
  const watchedImg = watch("img");
  useEffect(() => {
    setPreview(watchedImg?.trim() ? watchedImg : null);
    if (watchedImg?.trim()) trigger("img");
  }, [watchedImg, trigger]);

  /* ───────── Render ───────── */
  return (
      <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSave)}>
        {error && (
            <p className="text-red-500 text-sm -mt-2">{error}</p>
        )}

        <h1 className="text-xl font-semibold">
          {type === "create" ? "Create a new student" : "Update student"}
        </h1>

        <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>

        <div className="flex flex-wrap gap-4 justify-between">
          <InputField label="Full Name"     name="fullName"     register={register} error={errors.fullName} />
          <InputField label="Surname"       name="surname"      register={register} error={errors.surname} />
          <InputField label="Matricule"     name="matricule"    register={register} error={errors.matricule} />
          <InputField label="Place of Birth"name="placeOfBirth" register={register} error={errors.placeOfBirth} />
          <InputField label="Email"         name="email"        register={register} error={errors.email} />
          <InputField label="Phone"         name="phone"        register={register} error={errors.phone} />
          <InputField label="Address"       name="address"      register={register} error={errors.address} />
          <InputField label="Blood Type"    name="bloodType"    register={register} error={errors.bloodType} />
          <InputField label="Birthday"      name="birthday"     register={register} error={errors.birthday} type="date" />

          {/* Sex select */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Sex</label>
            <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                {...register("sex")}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            {errors.sex && <p className="text-xs text-red-400">{errors.sex.message}</p>}
          </div>

          {/* Image preview + URL */}
          <div className="flex flex-col gap-4 w-full md:w-1/4">
            <div className="flex items-center justify-center">
              {preview ? (
                  <Image
                      src={preview}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="rounded-full object-cover w-24 h-24"
                      onError={() => setPreview(null)}
                  />
              ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-full w-24 h-24 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Image URL</label>
              <input
                  className={`ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm ${
                      errors.img ? "ring-red-500" : ""
                  }`}
                  placeholder="https://example.com/photo.jpg"
                  {...register("img")}
              />
              {errors.img && <p className="text-xs text-red-400">{errors.img.message}</p>}
            </div>
          </div>
        </div>

        <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white p-2 rounded-md
                   disabled:bg-blue-300 disabled:cursor-not-allowed
                   hover:bg-blue-600 transition-colors"
        >
          {loading
              ? type === "create"
                  ? "Creating…"
                  : "Updating…"
              : type === "create"
                  ? "Create Student"
                  : "Update Student"}
        </button>
      </form>
  );
};

export default StudentForm;
