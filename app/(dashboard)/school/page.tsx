"use client";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";

const SchoolPage = () => {

    useRequireRole(ROLES.SCHOOL);

  return (
    <div>SchoolPage</div>
  )
}

export default SchoolPage