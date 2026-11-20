export type EmploymentType =
  | "permanent"
  | "probation"
  | "contract"
  | "internship"
  | "trainee"
  | "full_time"
  | "part_time"
  | string;

export type EmployeeStatus =
  | "active"
  | "inactive"
  | "terminated"
  | "on_leave"
  | "resigned"
  | string;

export type EmployeeCategory = "staff" | "worker" | string;

export interface HrSettings {
  timezone?: string;
  weekly_off_days?: number[];
  alternate_saturday_off_weeks?: number[];
  default_shift_start?: string;
  default_shift_end?: string;
  standard_daily_hours?: number;
  full_day_min_hours?: number;
  half_day_min_hours?: number;
  late_grace_minutes?: number;
  missed_punch_policy?: "half_day" | "absent" | string;
  ot_enabled?: boolean;
  ot_threshold_minutes?: number;
  ot_round_minutes?: number;
  ot_multiplier?: number;
  offday_work_policy?: "overtime" | "comp_off" | string;
  leave_year_start_month?: number;
  leave_auto_approve_max_days?: number;
  probation_months?: number;
  default_notice_days?: number;
  payroll_auto_generate?: boolean;
  payroll_generate_day?: number;
  payroll_days_basis?: "calendar" | "fixed_30" | string;
  payroll_enforce_maker_checker?: boolean;
  timesheet_auto_post?: boolean;
  automation_enabled?: boolean;
  daily_job_time?: string;
  attendance_recompute_days?: number;
}

export interface WorkLocation {
  location_id?: number;
  id?: number;
  location_name: string;
  location_type: "office" | "site" | "warehouse" | "other" | string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radius_meters?: number;
  project_id?: number | null;
  site_id?: number | null;
  is_active?: boolean;
}

export interface SalaryComponent {
  component_id?: number;
  id?: number;
  code: string;
  name: string;
  component_type: "earning" | "deduction" | string;
  is_basic?: boolean;
  include_in_pf_wage?: boolean;
  include_in_esi_wage?: boolean;
  is_taxable?: boolean;
  sort_order?: number;
  is_active?: boolean;
}

export interface SalaryStructureLine {
  component_id: number;
  calc_type: "percent_of_gross" | "percent_of_basic" | "balance" | "fixed" | string;
  value: number;
}

export interface SalaryStructure {
  structure_id?: number;
  id?: number;
  name: string;
  description?: string;
  lines: SalaryStructureLine[];
}

export interface StatutoryRule {
  rule_id?: number;
  id?: number;
  code: string;
  name: string;
  party: "employee" | "employer" | string;
  base: string;
  method: "percent" | "fixed" | string;
  rate: number;
  base_cap?: number;
  applies_flag?: string;
  rounding?: "nearest" | "up" | "down" | string;
  is_active?: boolean;
  sort_order?: number;
}

export interface LeaveType {
  leave_type_id?: number;
  id?: number;
  code: string;
  name: string;
  is_paid?: boolean;
  tracks_balance?: boolean;
  annual_quota?: number;
  accrual_method?: "monthly" | "yearly" | string;
  prorate_first_year?: boolean;
  min_service_days?: number;
  carry_forward?: boolean;
  carry_forward_max?: number;
  max_balance?: number;
  encashable?: boolean;
  half_day_allowed?: boolean;
  max_consecutive_days?: number;
  count_weekoffs?: boolean;
  allow_negative?: boolean;
  is_comp_off?: boolean;
  sort_order?: number;
  is_active?: boolean;
}

export interface Employee {
  employeeId?: number;
  employee_id?: number;
  id?: number;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  email: string;
  phone: string;
  gender?: "male" | "female" | "other" | string;
  date_of_birth?: string;
  dateOfBirth?: string;
  employee_category?: EmployeeCategory;
  employment_type?: EmploymentType;
  employmentType?: EmploymentType;
  joining_date?: string;
  joiningDate?: string;
  department_id?: number | null;
  departmentId?: number | null;
  department_name?: string;
  designation_id?: number | null;
  designationId?: number | null;
  designation_name?: string;
  branch_id?: number | null;
  branchId?: number | null;
  branch_name?: string;
  shift_id?: number | null;
  shiftId?: number | null;
  shift_name?: string;
  work_location_id?: number | null;
  workLocation?: string;
  manager_user_id?: number | null;
  managerUserId?: number | null;
  address_line1?: string;
  addressLine1?: string;
  city_id?: number | null;
  cityId?: number | null;
  state_id?: number | null;
  stateId?: number | null;
  country_id?: number | null;
  countryId?: number | null;
  pincode?: string;
  emergency_contact_name?: string;
  emergencyContactName?: string;
  emergency_contact_phone?: string;
  emergencyContactPhone?: string;
  emergency_contact_relation?: string;
  status: EmployeeStatus;
  // Private employee fields
  bank_name?: string;
  bankName?: string;
  bank_account_no?: string;
  bankAccountNo?: string;
  ifsc_code?: string;
  ifscCode?: string;
  pan_no?: string;
  aadhaar_no?: string;
  uan_no?: string;
  esic_no?: string;
  pf_applicable?: boolean;
  esi_applicable?: boolean;
  pt_applicable?: boolean;
}

export interface EmployeeSalary {
  effective_from: string;
  pay_basis: "monthly" | "daily" | "hourly" | string;
  gross_monthly: number;
  structure_id: number;
  monthly_tds?: number;
  reason?: string;
}

export interface EmployeeDocument {
  documentId?: number;
  document_id?: number;
  id?: number;
  employeeId?: number;
  employee_id?: number;
  documentType?: string;
  document_type?: string;
  document_number?: string;
  documentName?: string;
  file_name?: string;
  storage_key?: string;
  fileUrl?: string;
  issued_on?: string;
  expires_on?: string;
  is_verified?: boolean;
  uploadedAt?: string;
}

export interface HrmsTask {
  taskId?: number;
  task_id?: number;
  id?: number;
  employee_id?: number;
  employeeId?: number;
  employee_name?: string;
  kind?: "onboarding" | "offboarding" | "general" | string;
  title: string;
  taskName?: string;
  description?: string;
  due_date?: string;
  dueDate?: string;
  assigned_to?: number;
  status: "pending" | "done" | "completed" | "skipped" | string;
}
export type OnboardingTask = HrmsTask;

export interface ProjectAssignment {
  assignmentId?: number;
  assignment_id?: number;
  id?: number;
  employee_id: number;
  employeeId?: number;
  employee_name?: string;
  project_id: number;
  projectId?: number;
  project_name?: string;
  site_id?: number | null;
  role_title?: string;
  role?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string | null;
  endDate?: string | null;
  allocation_percent?: number;
  status?: "active" | "closed" | string;
}

export interface AttendanceRecord {
  attendanceId?: number;
  attendance_id?: number;
  id?: number;
  employeeId?: number;
  employee_id?: number;
  employeeName?: string;
  employee_name?: string;
  date: string;
  checkIn?: string;
  check_in?: string;
  checkOut?: string;
  check_out?: string;
  worked_hours?: number;
  status: "present" | "absent" | "late" | "half_day" | "leave" | string;
  remarks?: string;
  notes?: string;
}

export interface AttendanceSummary {
  present_days?: number;
  leave_days?: number;
  absent_days?: number;
  late_marks?: number;
  manual_days?: number;
  worked_hours?: number;
  overtime_hours?: number;
}

export interface OvertimeRecord {
  overtime_id?: number;
  overtimeRequestId?: number;
  id?: number;
  employee_id?: number;
  employeeId?: number;
  employee_name?: string;
  date: string;
  hours: number;
  rate_multiplier?: number;
  reason?: string;
  status: "pending" | "approved" | "rejected" | string;
  decision?: string;
  remarks?: string;
}
export type OvertimeRequest = OvertimeRecord;

export interface LeaveRequest {
  leaveRequestId?: number;
  leave_id?: number;
  id?: number;
  employee_id?: number;
  employeeId?: number;
  employee_name?: string;
  leave_type_id?: number;
  leaveType?: string;
  leave_type_name?: string;
  start_date?: string;
  fromDate?: string;
  end_date?: string;
  toDate?: string;
  days?: number;
  is_half_day?: boolean;
  half_day_part?: "first_half" | "second_half" | string;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | string;
  remarks?: string;
}

export interface LeaveBalance {
  leaveBalanceId?: number;
  id?: number;
  employeeId?: number;
  employee_id?: number;
  leave_type_id?: number;
  leave_type_name?: string;
  year: number;
  annualLeave?: number;
  sickLeave?: number;
  casualLeave?: number;
  unpaidLeave?: number;
  opening?: number;
  accrued?: number;
  used?: number;
  balance?: number;
}

export interface DeductionRule {
  ruleId?: number;
  rule_id?: number;
  id?: number;
  ruleName?: string;
  name?: string;
  deductionType?: "percentage" | "fixed" | string;
  amount?: number;
  percentage?: number;
  status: "active" | "inactive" | string;
}

export interface ProjectTimesheet {
  timesheetId?: number;
  timesheet_id?: number;
  id?: number;
  employeeId?: number;
  employee_id?: number;
  employee_name?: string;
  projectId?: number;
  project_id?: number;
  project_name?: string;
  date: string;
  hoursWorked?: number;
  worked_hours?: number;
  status: "draft" | "pending" | "approved" | "rejected" | string;
  remarks?: string;
}

export interface PayrollRun {
  payrollId?: number;
  payroll_id?: number;
  id?: number;
  month: number;
  year: number;
  totalGross?: number;
  total_gross?: number;
  totalDeductions?: number;
  total_deductions?: number;
  totalNet?: number;
  total_net?: number;
  employee_count?: number;
  status: "draft" | "approved" | "paid" | string;
  approved_at?: string;
  paid_at?: string;
}

export interface Payslip {
  itemId?: number;
  item_id?: number;
  id?: number;
  payroll_id?: number;
  employee_id?: number;
  employee_name?: string;
  gross_earnings?: number;
  total_deductions?: number;
  net_pay?: number;
  payment_status?: "pending" | "paid" | "reversed" | string;
  earnings_lines?: Array<{ label: string; amount: number }>;
  deduction_lines?: Array<{ label: string; amount: number }>;
}

export interface PayrollAdjustment {
  adjustment_id?: number;
  id?: number;
  employee_id: number;
  period_year: number;
  period_month: number;
  adjustment_type: "earning" | "deduction" | string;
  code: string;
  label: string;
  amount: number;
}

export interface EmployeeLoan {
  loan_id?: number;
  id?: number;
  employee_id: number;
  loan_type: "advance" | "loan" | string;
  principal: number;
  installment_amount: number;
  start_year: number;
  start_month: number;
  remaining_balance?: number;
  status?: "active" | "closed" | string;
  reason?: string;
}

export interface ExitRequest {
  exit_id?: number;
  id?: number;
  employee_id: number;
  employee_name?: string;
  exit_type:
    | "resignation"
    | "termination"
    | "retirement"
    | "end_of_contract"
    | "absconding"
    | "other"
    | string;
  request_date: string;
  last_working_date: string;
  notice_days?: number;
  reason?: string;
  status: "pending" | "approved" | "cancelled" | "finalized" | string;
  remarks?: string;
}

export interface ShiftRoster {
  rosterId?: number;
  id?: number;
  employeeId: number;
  shiftId: number;
  shiftName?: string;
  startDate: string;
  endDate: string;
}

export interface HrmsAnalytics {
  active_employees?: number;
  total_departments?: number;
  present_today?: number;
  on_leave_today?: number;
  pending_leave_requests?: number;
  pending_overtime_requests?: number;
  monthly_payroll_cost?: number;
}
