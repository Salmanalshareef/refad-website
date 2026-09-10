import type { EducationLevel, EmploymentStatus, MaritalStatus } from "@/types/db";

export const maritalStatusLabels: Record<MaritalStatus, string> = {
  single: "أعزب",
  married: "متزوج",
  divorced: "مطلق",
  widowed: "أرمل",
};

export const educationLevelLabels: Record<EducationLevel, string> = {
  secondary: "ثانوي",
  bachelor: "بكالوريوس",
  master: "ماجستير",
  doctorate: "دكتوراه",
};

export const employmentStatusLabels: Record<EmploymentStatus, string> = {
  public_sector: "القطاع الحكومي",
  private_sector: "القطاع الخاص",
  nonprofit_sector: "القطاع غير الربحي",
  business_owner: "صاحب عمل",
  job_seeker: "باحث عن عمل",
  student: "طالب",
  retired: "متقاعد",
  homemaker: "ربة منزل",
};
