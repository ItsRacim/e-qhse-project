"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  PencilLine,
  Printer,
  QrCode,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Badge from "@/components/Badge";
import {
  employeeRoleVariant,
  employeeStatusVariant,
} from "@/lib/badges";
import { useLanguage } from "@/lib/i18n/language-context";

type Employee = {
  id: string;
  name: string;
  position: string;
  department: string;
  role: string;
  status: string;
  qrCodeData: string;
  pinCode: string;
  certifications: string[];
  reportsCount: number;
  actionsCount: number;
};

const roles = ["WORKER", "SUPERVISOR", "INSPECTOR"] as const;
const statuses = ["ACTIVE", "ON_LEAVE", "INACTIVE"] as const;

type EditForm = {
  name: string;
  role: string;
  status: string;
  department: string;
  jobTitle: string;
  pinCode: string;
  certifications: string;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function EmployeesClient({
  employees,
}: {
  employees: Employee[];
}) {
  const router = useRouter();
  const { t, tEnum } = useLanguage();

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<string>("WORKER");
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [certificationsInput, setCertificationsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [badgeEmployee, setBadgeEmployee] = useState<Employee | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    role: "WORKER",
    status: "ACTIVE",
    department: "",
    jobTitle: "",
    pinCode: "",
    certifications: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function openEdit(employee: Employee) {
    setEditError(null);
    setEditTarget(employee);
    setEditForm({
      name: employee.name,
      role: employee.role,
      status: employee.status,
      department: employee.department,
      jobTitle: employee.position,
      pinCode: employee.pinCode,
      certifications: employee.certifications.join(", "),
    });
  }

  useEffect(() => {
    let cancelled = false;
    if (!badgeEmployee) {
      setQrUrl(null);
      return;
    }
    import("@/lib/qr").then(({ generateQrDataUrl }) =>
      generateQrDataUrl(badgeEmployee.qrCodeData).then((url) => {
        if (!cancelled) setQrUrl(url);
      })
    );
    return () => {
      cancelled = true;
    };
  }, [badgeEmployee]);

  async function handleAddSubmit() {
    setFormError(null);
    if (!name.trim()) {
      setFormError(t("employees.nameRequired"));
      return;
    }
    if (!/^\d{4}$/.test(pinCode.trim())) {
      setFormError(t("employees.pinLengthError"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          department,
          jobTitle,
          pinCode: pinCode.trim(),
          certifications: certificationsInput
            .split(",")
            .map((cert) => cert.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(
          res.status === 409
            ? t("employees.pinTaken")
            : data.error ?? t("employees.createFailed")
        );
        return;
      }
      setSuccess(t("employees.created"));
      setAddOpen(false);
      setName("");
      setRole("WORKER");
      setDepartment("");
      setJobTitle("");
      setPinCode("");
      setCertificationsInput("");
      router.refresh();
    } catch {
      setFormError(t("employees.createFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/employees/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setDeleteError(data?.error ?? t("employees.deleteFailed"));
        return;
      }
      setSuccess(t("employees.deleted"));
      setDeleteTarget(null);
      router.refresh();
    } catch {
      setDeleteError(t("employees.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  async function handleEditSubmit() {
    if (!editTarget) return;
    setEditError(null);
    if (!editForm.name.trim()) {
      setEditError(t("employees.nameRequired"));
      return;
    }
    if (!/^\d{4}$/.test(editForm.pinCode.trim())) {
      setEditError(t("employees.pinLengthError"));
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/employees/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          role: editForm.role,
          status: editForm.status,
          department: editForm.department,
          jobTitle: editForm.jobTitle,
          pinCode: editForm.pinCode.trim(),
          certifications: editForm.certifications
            .split(",")
            .map((cert) => cert.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(
          res.status === 409
            ? t("employees.pinTaken")
            : data.error ?? t("employees.createFailed")
        );
        return;
      }
      setSuccess(t("employees.employeeUpdated"));
      setEditTarget(null);
      router.refresh();
    } catch {
      setEditError(t("employees.createFailed"));
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <>
      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {t("employees.title")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t("employees.description")}
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setAddOpen(true);
          }}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
        >
          <UserPlus className="h-4 w-4" />
          {t("employees.addEmployee")}
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <Users className="h-8 w-8 text-muted" />
          <p className="mt-2 text-sm text-muted">{t("employees.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-sm font-semibold text-amber-600 dark:text-amber-400">
                    {initials(employee.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{employee.name}</h3>
                    <p className="truncate text-sm text-muted">
                      {employee.position} · {employee.department}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant={employeeRoleVariant[employee.role]}>
                    {tEnum("employeeRole", employee.role)}
                  </Badge>
                  <Badge variant={employeeStatusVariant[employee.status]}>
                    {tEnum("employeeStatus", employee.status)}
                  </Badge>
                </div>
              </div>

              <code className="mt-4 block rounded-lg bg-slate-500/10 px-3 py-2 font-mono text-xs text-muted">
                {employee.qrCodeData}
              </code>

              {employee.certifications.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {employee.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="rounded-md border border-border px-2 py-0.5 text-xs text-muted"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-6 border-t border-border pt-4 text-sm text-muted">
                <span>
                  {t("employees.reportsCount", {
                    count: employee.reportsCount,
                  })}
                </span>
                <span>
                  {t("employees.actionsCount", {
                    count: employee.actionsCount,
                  })}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setBadgeEmployee(employee)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:border-orange-500"
                >
                  <QrCode className="h-4 w-4" />
                  {t("employees.viewQrBadge")}
                </button>
                <button
                  onClick={() => openEdit(employee)}
                  aria-label={t("employees.editEmployee")}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-orange-500 hover:text-foreground"
                >
                  <PencilLine className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteTarget(employee);
                  }}
                  aria-label={t("employees.deleteEmployee")}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-rose-500 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">{t("employees.addTitle")}</h3>
              <button
                onClick={() => setAddOpen(false)}
                aria-label={t("common.close")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-slate-500/10 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  {t("employees.nameLabel")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("employees.nameLabel")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    {t("employees.roleLabel")}
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {tEnum("employeeRole", r)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    {t("employees.pinCode")}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pinCode}
                    onChange={(e) =>
                      setPinCode(
                        e.target.value.replace(/\D/g, "").slice(0, 4)
                      )
                    }
                    placeholder={t("employees.pinPlaceholder")}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    {t("employees.departmentLabel")}
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    {t("employees.jobTitleLabel")}
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  {t("employees.certificationsLabel")}
                </label>
                <input
                  type="text"
                  value={certificationsInput}
                  onChange={(e) => setCertificationsInput(e.target.value)}
                  placeholder={t("employees.certificationsPlaceholder")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {formError && (
                <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-600 dark:text-rose-400">
                  {formError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleAddSubmit}
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      {t("common.save")}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setAddOpen(false)}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">
                {t("employees.editEmployee")}
              </h3>
              <button
                onClick={() => setEditTarget(null)}
                aria-label={t("common.close")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-slate-500/10 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  {t("employees.nameLabel")}
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={t("employees.nameLabel")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    {t("employees.roleLabel")}
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {tEnum("employeeRole", r)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    {t("common.status")}
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {tEnum("employeeStatus", s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    {t("employees.pinCode")}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editForm.pinCode}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        pinCode: e.target.value.replace(/\D/g, "").slice(0, 4),
                      }))
                    }
                    placeholder={t("employees.pinPlaceholder")}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    {t("employees.departmentLabel")}
                  </label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  {t("employees.jobTitleLabel")}
                </label>
                <input
                  type="text"
                  value={editForm.jobTitle}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      jobTitle: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  {t("employees.certificationsLabel")}
                </label>
                <input
                  type="text"
                  value={editForm.certifications}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      certifications: e.target.value,
                    }))
                  }
                  placeholder={t("employees.certificationsPlaceholder")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {editError && (
                <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-600 dark:text-rose-400">
                  {editError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleEditSubmit}
                  disabled={savingEdit}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                >
                  {savingEdit ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <PencilLine className="h-4 w-4" />
                      {t("employees.saveChanges")}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEditTarget(null)}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {badgeEmployee && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[90vh] w-full max-w-sm flex-col rounded-2xl border border-border bg-surface shadow-xl">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 print:hidden">
              <h3 className="text-base font-semibold">
                {t("employees.badgeTitle")}
              </h3>
              <button
                onClick={() => setBadgeEmployee(null)}
                aria-label={t("common.close")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-slate-500/10 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <div className="badge-card mx-auto w-full max-w-xs rounded-xl border-2 border-slate-800 bg-white p-4 text-slate-900">
                <div className="flex items-center justify-between gap-2 border-b-2 border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-orange-500 text-white">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-wide">E-QHSE</p>
                      <p className="text-[10px] text-slate-500">
                        {t("employees.badgeTitle")}
                      </p>
                    </div>
                  </div>
                  <p className="text-right font-mono text-[10px] text-slate-500">
                    {badgeEmployee.qrCodeData}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-200 text-base font-bold text-slate-600">
                    {initials(badgeEmployee.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold">
                      {badgeEmployee.name}
                    </p>
                    <p className="truncate text-xs text-slate-600">
                      {badgeEmployee.position} · {badgeEmployee.department}
                    </p>
                    <span className="mt-1 inline-flex rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      {tEnum("employeeRole", badgeEmployee.role)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-col items-center rounded-lg border border-slate-200 p-3">
                  {qrUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrUrl}
                      alt={t("employees.badgeCode")}
                      className="h-28 w-28"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                  )}
                  <p className="mt-1 font-mono text-xs font-semibold">
                    {badgeEmployee.qrCodeData}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {t("employees.badgeCode")}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <div className="flex items-center gap-2 text-xs">
                    <KeyRound className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-semibold text-slate-700">
                        {t("employees.pinCode")}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {t("employees.offlinePin")}
                      </p>
                    </div>
                  </div>
                  <code className="font-mono text-lg font-bold tracking-[0.3em]">
                    {badgeEmployee.pinCode}
                  </code>
                </div>

                <p className="mt-3 text-center text-[10px] text-slate-400">
                  {t("app.tagline")}
                </p>
              </div>
            </div>

            <div className="flex gap-2 border-t border-border px-5 py-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
              >
                <Printer className="h-4 w-4" />
                {t("employees.printBadge")}
              </button>
              <button
                onClick={() => setBadgeEmployee(null)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                {t("employees.deleteEmployee")}
              </h3>
              <button
                onClick={() => setDeleteTarget(null)}
                aria-label={t("common.close")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-slate-500/10 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-foreground/80">
              {t("employees.confirmDelete")}
            </p>
            <p className="mt-1 text-xs text-muted">{t("employees.deleteHint")}</p>
            {deleteError && (
              <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-600 dark:text-rose-400">
                {deleteError}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    {t("employees.deleteEmployee")}
                  </>
                )}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}