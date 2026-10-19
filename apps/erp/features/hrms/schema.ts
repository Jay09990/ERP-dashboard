export type EmploymentType = "full_time" | "part_time" | "contract" | "internship" | string;
export type EmployeeStatus = "active" | "inactive" | "terminated" | "on_leave" | string;

export interface Employee {
  employeeId?: number;
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: "male" | "female" | "other" | string;
  dateOfBirth?: string;
  joiningDate?: string;
  employmentType?: EmploymentType;
  status: EmployeeStatus;
  departmentId?: number | null;
  designationId?: number | null;
  branchId?: number | null;
  shiftId?: number | null;
  managerUserId?: number | null;
  workLocation?: string;
  addressLine1?: string;
  cityId?: number | null;
  stateId?: number | null;
  countryId?: number | null;
  pincode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bankName?: string;
  bankAccountNo?: string;
  ifscCode?: string;
  taxId?: string;
}

export interface AttendanceRecord {
  attendanceId?: number;
  id?: number;
  employeeId: number;
  employeeName?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "present" | "absent" | "late" | "half_day" | "leave" | string;
  notes?: string;
}

export interface LeaveBalance {
  leaveBalanceId?: number;
  id?: number;
  employeeId: number;
  year: number;
  annualLeave?: number;
  sickLeave?: number;
  casualLeave?: number;
  unpaidLeave?: number;
}

export interface LeaveRequest {
  leaveRequestId?: number;
  leaveId?: number;
  id?: number;
  employeeId: number;
  employeeName?: string;
  leaveType: "annual" | "sick" | "casual" | "unpaid" | string;
  fromDate: string;
  toDate: string;
  days: number;
  reason?: string;
  status: "pending" | "approved" | "rejected" | string;
}

export interface OvertimeRequest {
  overtimeRequestId?: number;
  requestId?: number;
  id?: number;
  employeeId: number;
  employeeName?: string;
  date: string;
  hours: number;
  rateMultiplier?: number;
  reason?: string;
  status: "pending" | "approved" | "rejected" | string;
}

export interface DeductionRule {
  ruleId?: number;
  id?: number;
  ruleName: string;
  deductionType: "percentage" | "fixed" | string;
  amount?: number;
  percentage?: number;
  status: "active" | "inactive" | string;
}

export interface PayrollRun {
  payrollId?: number;
  id?: number;
  month: number;
  year: number;
  totalGross?: number;
  totalDeductions?: number;
  totalNet?: number;
  status: "draft" | "approved" | "paid" | string;
}

export interface EmployeeDocument {
  documentId?: number;
  id?: number;
  employeeId: number;
  documentType: string;
  documentName: string;
  fileUrl: string;
  uploadedAt?: string;
}

export interface OnboardingTask {
  taskId?: number;
  id?: number;
  employeeId: number;
  taskName: string;
  dueDate?: string;
  status: "pending" | "completed" | string;
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

export interface ProjectAssignment {
  assignmentId?: number;
  id?: number;
  employeeId: number;
  projectId: number;
  role?: string;
  startDate?: string;
  endDate?: string;
  status: "active" | "closed" | string;
}

export interface ProjectTimesheet {
  timesheetId?: number;
  id?: number;
  employeeId: number;
  projectId: number;
  date: string;
  hoursWorked: number;
  status: "pending" | "approved" | "rejected" | string;
  remarks?: string;
}
