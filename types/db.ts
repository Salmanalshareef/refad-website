export type ProfileRole = "member" | "admin";
export type ReportType = "financial" | "performance" | "minutes";
export type SubscriptionStatus = "active" | "pending" | "expired" | "rejected";
export type SupportRequestStatus = "draft" | "pending" | "rejected" | "completed";
export type ContactMessageStatus = "new" | "read" | "archived";
export type Gender = "male" | "female";
export type NewsCategory = "family" | "fund";
export type TaskStatus = "todo" | "in_progress" | "done";
export type MemberRequestType = "news" | "family_member" | "other";
export type MemberRequestStatus = "pending" | "rejected" | "completed";
export type RegistrationRequestStatus = "pending" | "approved" | "rejected";
export type MaritalStatus = "single" | "married" | "divorced" | "widowed";
export type EducationLevel = "secondary" | "bachelor" | "master" | "doctorate";
export type EmploymentStatus =
  | "public_sector"
  | "private_sector"
  | "nonprofit_sector"
  | "business_owner"
  | "job_seeker"
  | "student"
  | "retired"
  | "homemaker";

export type User = {
  id: string;
  email: string | null;
  password_hash: string;
  created_at: string;
};

export type Profile = {
  id: string;
  member_number: number;
  full_name: string;
  phone: string;
  national_id: string | null;
  gender: Gender | null;
  birth_date: string | null;
  avatar_url: string | null;
  marital_status: MaritalStatus | null;
  education_level: EducationLevel | null;
  employment_status: EmploymentStatus | null;
  role: ProfileRole;
  family_member_id: string | null;
  created_at: string;
};

export type ProfileWithEmail = Profile & {
  email: string | null;
};

export type FamilyBranch = {
  id: string;
  name: string;
  parent_branch_id: string | null;
};

export type FamilyMember = {
  id: string;
  profile_id: string | null;
  full_name: string;
  national_id: string | null;
  gender: Gender;
  birth_date: string | null;
  death_date: string | null;
  is_living: boolean;
  father_id: string | null;
  mother_name: string | null;
  branch_id: string | null;
  photo_url: string | null;
};

export type FamilyMemberWithProfile = FamilyMember & {
  profile_birth_date: string | null;
};

export type BoardMember = {
  id: string;
  full_name: string;
  role_title: string;
  photo_url: string | null;
  order_index: number;
  bio: string | null;
};

export type InitiativeType = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  is_published: boolean;
  is_requestable: boolean;
};

export type InitiativeDateMode = "single" | "period";

export type Initiative = {
  id: string;
  initiative_type_id: string;
  title: string;
  description: string;
  requirements: string | null;
  date_mode: InitiativeDateMode;
  start_date: string | null;
  end_date: string | null;
  age_group: string | null;
  target_audience: string | null;
  icon: string | null;
  order_index: number;
  is_published: boolean;
  is_requestable: boolean;
};

export type Report = {
  id: string;
  type: ReportType;
  title: string;
  file_url: string;
  period_label: string | null;
  published_date: string;
};

export type Subscription = {
  id: string;
  subscription_number: number | null;
  profile_id: string;
  fiscal_year: number;
  amount: string;
  receipt_url: string | null;
  notes: string | null;
  status: SubscriptionStatus;
  admin_comment: string | null;
  requested_date: string;
  approved_date: string | null;
  end_date: string | null;
  created_at: string;
};

export type SubscriptionWithMember = Subscription & {
  member_name: string;
  member_number: number;
};

export type FundBankInfo = {
  id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  iban: string;
  updated_at: string;
};

export type SupportRequest = {
  id: string;
  request_number: number;
  profile_id: string;
  initiative_id: string | null;
  description: string | null;
  attachment_url: string | null;
  terms_accepted: boolean;
  status: SupportRequestStatus;
  admin_comment: string | null;
  created_at: string;
};

export type SupportRequestWithDetails = SupportRequest & {
  member_name: string;
  member_number: number;
  national_id: string | null;
  initiative_title: string | null;
  initiative_type_title: string | null;
  requirements: string | null;
};

export type ContactMessage = {
  id: string;
  full_name: string;
  mobile: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
};

export type NewsItem = {
  id: string;
  category: NewsCategory;
  title: string;
  body: string;
  image_url: string | null;
  is_published: boolean;
  published_date: string;
};

export type Video = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  is_published: boolean;
  published_date: string;
};

export type MagazineIssue = {
  id: string;
  title: string;
  issue_label: string | null;
  file_url: string;
  is_published: boolean;
  published_date: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
};

export type TaskWithAssignee = Task & {
  assignee_name: string | null;
};

export type MemberRequest = {
  id: string;
  profile_id: string;
  type: MemberRequestType;
  details: string | null;
  image_url: string | null;
  first_name: string | null;
  second_name: string | null;
  third_name: string | null;
  fourth_name: string | null;
  national_id: string | null;
  mother_name: string | null;
  status: MemberRequestStatus;
  admin_comment: string | null;
  created_at: string;
};

export type MemberRequestWithDetails = MemberRequest & {
  member_name: string;
  applicant_national_id: string | null;
};

export type RegistrationRequest = {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  email: string | null;
  gender: Gender | null;
  birth_date: string | null;
  status: RegistrationRequestStatus;
  admin_comment: string | null;
  created_at: string;
};
