import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CreatePermitForm from "@/components/CreatePermitForm";

export const metadata: Metadata = {
  title: "New Work Permit · E-QHSE",
};

const VALID_PERMIT_TYPES = [
  "HOT_WORK",
  "COLD_WORK",
  "CONFINED_SPACE",
  "HEIGHT_WORK",
  "ELECTRICAL_LOTO",
  "EXCAVATION",
  "LIFTING",
];

type NewPermitPageProps = {
  searchParams: { type?: string };
};

export default function NewPermitPage({ searchParams }: NewPermitPageProps) {
  const type = typeof searchParams?.type === "string" ? searchParams.type : "";
  if (!VALID_PERMIT_TYPES.includes(type)) {
    redirect("/work-permits");
  }

  return <CreatePermitForm initialType={type} />;
}