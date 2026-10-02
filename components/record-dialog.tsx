"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal, SecondaryButton } from "@/components/shell";

export type RecordField = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "time" | "tel" | "select";
  options?: string[];
  required?: boolean;
};

export function RecordDialog({
  open,
  title,
  fields,
  initialValues,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  fields: RecordField[];
  initialValues: Record<string, string>;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState(initialValues);
  const serializedInitialValues = JSON.stringify(initialValues);

  useEffect(() => {
    if (open) setValues(JSON.parse(serializedInitialValues) as Record<string, string>);
  }, [open, serializedInitialValues]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{field.label}</span>
              {field.type === "select" ? (
                <select
                  required={field.required !== false}
                  value={values[field.name] ?? ""}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                >
                  {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input
                  required={field.required !== false}
                  type={field.type ?? "text"}
                  min={field.type === "number" ? "0" : undefined}
                  value={values[field.name] ?? ""}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                />
              )}
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-dark)]">{title.startsWith("Edit") ? "Save changes" : "Create record"}</button>
        </div>
      </form>
    </Modal>
  );
}