"use client";

import { useParams } from "next/navigation";

import { EmployeeProfile } from "@/components/employees/profile/employee-profile";

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  return <EmployeeProfile id={id} />;
}
