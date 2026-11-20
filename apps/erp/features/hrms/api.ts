import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AttendanceRecord,
  DeductionRule,
  Employee,
  EmployeeDocument,
  EmployeeLoan,
  EmployeeSalary,
  ExitRequest,
  HrSettings,
  HrmsTask,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  OvertimeRecord,
  PayrollAdjustment,
  PayrollRun,
  ProjectAssignment,
  ProjectTimesheet,
  SalaryComponent,
  SalaryStructure,
  ShiftRoster,
  StatutoryRule,
  WorkLocation,
} from "./schema";

type Id = string | number;

function useHrmsMutation<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["hrms"] }),
        queryClient.invalidateQueries({ queryKey: ["employees"] }),
      ]);
    },
  });
}

export const hrmsApi = {
  // --- Employee Master ---
  useEmployees: (filters?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["employees", filters],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.employees, filters),
      enabled,
    }),
  useEmployee: (id: Id | null, enabled = true) =>
    useQuery({
      queryKey: ["employee", id],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.employee(id as Id)),
      enabled: id != null && enabled,
    }),
  useCreateEmployee: () =>
    useHrmsMutation((body: Partial<Employee>) =>
      apiClient.post(endpoints.hrms.employees, body),
    ),
  useUpdateEmployee: () =>
    useHrmsMutation(({ id, body }: { id: Id; body: Partial<Employee> }) =>
      apiClient.put(endpoints.hrms.employee(id), body),
    ),
  useDeleteEmployee: () =>
    useHrmsMutation((id: Id) => apiClient.delete(endpoints.hrms.employee(id))),

  // Employee Salary
  useEmployeeSalary: (employeeId: Id | null, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "employee-salary", employeeId],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.employeeSalary(employeeId as Id)),
      enabled: employeeId != null && enabled,
    }),
  useUpdateEmployeeSalary: () =>
    useHrmsMutation(
      ({ employeeId, body }: { employeeId: Id; body: Partial<EmployeeSalary> }) =>
        apiClient.post(endpoints.hrms.employeeSalary(employeeId), body),
    ),

  // Employee Documents
  useEmployeeDocuments: (employeeId: Id | null, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "employee-documents", employeeId],
      queryFn: () =>
        apiClient.get<unknown>(
          endpoints.hrms.employeeDocuments(employeeId as Id),
        ),
      enabled: employeeId != null && enabled,
    }),
  useCreateEmployeeDocument: () =>
    useHrmsMutation(
      ({
        employeeId,
        body,
      }: { employeeId: Id; body: Partial<EmployeeDocument> }) =>
        apiClient.post(endpoints.hrms.employeeDocuments(employeeId), body),
    ),
  useVerifyEmployeeDocument: () =>
    useHrmsMutation(({ documentId, is_verified }: { documentId: Id; is_verified: boolean }) =>
      apiClient.put(endpoints.hrms.verifyDocument(documentId), { is_verified }),
    ),
  useDeleteEmployeeDocument: () =>
    useHrmsMutation((documentId: Id) =>
      apiClient.delete(endpoints.hrms.document(documentId)),
    ),

  // --- Work Locations ---
  useWorkLocations: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "work-locations"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.workLocations),
      enabled,
    }),
  useCreateWorkLocation: () =>
    useHrmsMutation((body: Partial<WorkLocation>) =>
      apiClient.post(endpoints.hrms.workLocations, body),
    ),
  useUpdateWorkLocation: () =>
    useHrmsMutation(
      ({ id, body }: { id: Id; body: Partial<WorkLocation> }) =>
        apiClient.put(endpoints.hrms.workLocation(id), body),
    ),
  useDeleteWorkLocation: () =>
    useHrmsMutation((id: Id) =>
      apiClient.delete(endpoints.hrms.workLocation(id)),
    ),

  // --- HR Settings ---
  useHrSettings: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "settings"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.settings),
      enabled,
    }),
  useUpdateHrSettings: () =>
    useHrmsMutation((body: Partial<HrSettings>) =>
      apiClient.put(endpoints.hrms.settings, body),
    ),

  // --- Salary Components & Structures ---
  useSalaryComponents: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "salary-components"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.salaryComponents),
      enabled,
    }),
  useCreateSalaryComponent: () =>
    useHrmsMutation((body: Partial<SalaryComponent>) =>
      apiClient.post(endpoints.hrms.salaryComponents, body),
    ),
  useUpdateSalaryComponent: () =>
    useHrmsMutation((body: Partial<SalaryComponent>) =>
      apiClient.put(endpoints.hrms.salaryComponents, body),
    ),

  useSalaryStructures: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "salary-structures"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.salaryStructures),
      enabled,
    }),
  useCreateSalaryStructure: () =>
    useHrmsMutation((body: Partial<SalaryStructure>) =>
      apiClient.post(endpoints.hrms.salaryStructures, body),
    ),
  useUpdateSalaryStructure: () =>
    useHrmsMutation(
      ({ id, body }: { id: Id; body: Partial<SalaryStructure> }) =>
        apiClient.put(endpoints.hrms.salaryStructure(id), body),
    ),

  // Statutory Rules
  useStatutoryRules: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "statutory-rules"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.statutoryRules),
      enabled,
    }),
  useCreateStatutoryRule: () =>
    useHrmsMutation((body: Partial<StatutoryRule>) =>
      apiClient.post(endpoints.hrms.statutoryRules, body),
    ),
  useUpdateStatutoryRule: () =>
    useHrmsMutation(({ id, body }: { id: Id; body: Partial<StatutoryRule> }) =>
      apiClient.put(endpoints.hrms.statutoryRule(id), body),
    ),

  // Leave Types
  useLeaveTypes: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "leave-types"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.leaveTypes),
      enabled,
    }),
  useCreateLeaveType: () =>
    useHrmsMutation((body: Partial<LeaveType>) =>
      apiClient.post(endpoints.hrms.leaveTypes, body),
    ),
  useUpdateLeaveType: () =>
    useHrmsMutation(({ id, body }: { id: Id; body: Partial<LeaveType> }) =>
      apiClient.put(endpoints.hrms.leaveType(id), body),
    ),

  // --- Attendance Management ---
  useAttendance: (filters?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "attendance", filters],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.attendance, filters),
      enabled,
    }),
  useAttendanceSummary: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "attendance-summary", params],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.attendanceSummary, params),
      enabled,
    }),
  useAttendanceAlerts: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "attendance-alerts", params],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.attendanceAlerts, params),
      enabled,
    }),
  useMarkAttendance: () =>
    useHrmsMutation((body: Partial<AttendanceRecord>) =>
      apiClient.put(endpoints.hrms.attendanceMark, body),
    ),
  useCreateAttendance: () =>
    useHrmsMutation((body: Partial<AttendanceRecord>) =>
      apiClient.post(endpoints.hrms.attendance, body),
    ),
  useClearManualAttendance: () =>
    useHrmsMutation((body: { employee_id: Id; date: string }) =>
      apiClient.delete(endpoints.hrms.attendanceMark),
    ),
  useReprocessAttendance: () =>
    useHrmsMutation((body: { from: string; to: string; employee_ids?: Id[] }) =>
      apiClient.post(endpoints.hrms.attendanceReprocess, body),
    ),

  // --- Overtime Management ---
  useOvertime: (filters?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "overtime", filters],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.overtime, filters),
      enabled,
    }),
  useReviewOvertime: () =>
    useHrmsMutation(
      ({ id, decision, remarks }: { id: Id; decision: string; remarks?: string }) =>
        apiClient.put(endpoints.hrms.overtimeReview(id), { decision, remarks }),
    ),
  useOvertimeRequests: (filters?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "overtime-requests", filters],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.overtimeRequests, filters),
      enabled,
    }),
  useCreateOvertimeRequest: () =>
    useHrmsMutation((body: Partial<OvertimeRecord>) =>
      apiClient.post(endpoints.hrms.overtimeRequests, body),
    ),
  useReviewOvertimeRequest: () =>
    useHrmsMutation(
      ({ id, status }: { id: Id; status: string }) =>
        apiClient.put(endpoints.hrms.overtimeRequestReview(id), { status }),
    ),

  // --- Leave Requests & Balances ---
  useLeaveRequests: (filters?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "leave-requests", filters],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.leaveRequests, filters),
      enabled,
    }),
  useCreateLeaveRequest: () =>
    useHrmsMutation((body: Partial<LeaveRequest>) =>
      apiClient.post(endpoints.hrms.leaveRequests, body),
    ),
  useReviewLeaveRequest: () =>
    useHrmsMutation(
      ({ id, decision, remarks, status }: { id: Id; decision?: string; remarks?: string; status?: string }) =>
        apiClient.put(endpoints.hrms.leaveRequestDecision(id), {
          decision: decision ?? status,
          remarks,
        }),
    ),
  useCancelLeaveRequest: () =>
    useHrmsMutation((id: Id) =>
      apiClient.put(endpoints.hrms.leaveRequestCancel(id), {}),
    ),
  useLeaveBalances: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "leave-balances", params],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.leaveBalances, params),
      enabled,
    }),
  useLeaveLedger: (employeeId: Id | null, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "leave-ledger", employeeId],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.leaveLedger(employeeId as Id)),
      enabled: employeeId != null && enabled,
    }),
  useAdjustLeaveBalance: () =>
    useHrmsMutation((body: { employee_id: Id; leave_type_id: Id; year: number; days: number; remarks?: string }) =>
      apiClient.post(endpoints.hrms.leaveBalanceAdjust, body),
    ),
  useUpdateLeaveBalance: () =>
    useHrmsMutation(
      ({ employeeId, body }: { employeeId: Id; body: Partial<LeaveBalance> }) =>
        apiClient.put(endpoints.hrms.leaveBalance(employeeId), body),
    ),

  // --- Tasks (Onboarding, Offboarding, General) ---
  useTasks: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "tasks", params],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.tasks, params),
      enabled,
    }),
  useCreateTask: () =>
    useHrmsMutation((body: Partial<HrmsTask>) =>
      apiClient.post(endpoints.hrms.tasks, body),
    ),
  useUpdateTask: () =>
    useHrmsMutation(
      ({ id, body }: { id: Id; body: Partial<HrmsTask> }) =>
        apiClient.put(endpoints.hrms.task(id), body),
    ),
  useOnboardingTasks: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "onboarding-tasks", params],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.onboardingTasks, params),
      enabled,
    }),
  useCreateOnboardingTask: () =>
    useHrmsMutation((body: Partial<HrmsTask>) =>
      apiClient.post(endpoints.hrms.onboardingTasks, body),
    ),
  useUpdateOnboardingTask: () =>
    useHrmsMutation(
      ({ id, body }: { id: Id; body: Partial<HrmsTask> }) =>
        apiClient.put(endpoints.hrms.onboardingTask(id), body),
    ),

  // --- Project Assignments & Timesheets ---
  useAssignments: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "assignments", params],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.assignments, params),
      enabled,
    }),
  useCreateAssignment: () =>
    useHrmsMutation((body: Partial<ProjectAssignment>) =>
      apiClient.post(endpoints.hrms.assignments, body),
    ),
  useCloseAssignment: () =>
    useHrmsMutation(({ id, end_date }: { id: Id; end_date?: string }) =>
      apiClient.put(endpoints.hrms.assignmentClose(id), { end_date }),
    ),
  useProjectAssignments: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "project-assignments", params],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.projectAssignments, params),
      enabled,
    }),
  useCreateProjectAssignment: () =>
    useHrmsMutation((body: Partial<ProjectAssignment>) =>
      apiClient.post(endpoints.hrms.projectAssignments, body),
    ),
  useCloseProjectAssignment: () =>
    useHrmsMutation((id: Id) =>
      apiClient.put(endpoints.hrms.projectAssignmentClose(id), {}),
    ),

  useTimesheets: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "timesheets", params],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.timesheets, params),
      enabled,
    }),
  useReviewTimesheet: () =>
    useHrmsMutation(
      ({ id, decision, remarks }: { id: Id; decision: string; remarks?: string }) =>
        apiClient.put(endpoints.hrms.timesheetReview(id), { decision, remarks }),
    ),
  useProjectTimesheets: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "project-timesheets", params],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.projectTimesheets, params),
      enabled,
    }),
  useCreateProjectTimesheet: () =>
    useHrmsMutation((body: Partial<ProjectTimesheet>) =>
      apiClient.post(endpoints.hrms.projectTimesheets, body),
    ),
  useReviewProjectTimesheet: () =>
    useHrmsMutation(
      ({ id, status }: { id: Id; status: string }) =>
        apiClient.put(endpoints.hrms.projectTimesheetReview(id), { status }),
    ),

  useProjectLabourAttendance: (projectId: Id | null, params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "project-labour-attendance", projectId, params],
      queryFn: () =>
        apiClient.get<unknown>(
          endpoints.hrms.projectLabourAttendance(projectId as Id),
          params,
        ),
      enabled: projectId != null && enabled,
    }),
  useRecordProjectLabourAttendance: () =>
    useHrmsMutation(({ projectId, body }: { projectId: Id; body: unknown }) =>
      apiClient.post(endpoints.hrms.projectLabourAttendance(projectId), body),
    ),
  useProjectLabourCost: (projectId: Id | null, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "project-labour-cost", projectId],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.projectLabourCost(projectId as Id)),
      enabled: projectId != null && enabled,
    }),

  // --- Payroll Management ---
  usePayrollRuns: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "payroll"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.payroll),
      enabled,
    }),
  usePayrollDetail: (id: Id | null, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "payroll-detail", id],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.payrollDetail(id as Id)),
      enabled: id != null && enabled,
    }),
  useCreatePayrollRun: () =>
    useHrmsMutation((body: { year: number; month: number }) =>
      apiClient.post(endpoints.hrms.payroll, body),
    ),
  useApprovePayroll: () =>
    useHrmsMutation((id: Id) =>
      apiClient.put(endpoints.hrms.payrollApprove(id), {}),
    ),
  useDeletePayroll: () =>
    useHrmsMutation((id: Id) =>
      apiClient.put(endpoints.hrms.payrollDelete(id), {}),
    ),
  useBankAdvice: (id: Id | null, format?: string, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "bank-advice", id, format],
      queryFn: () =>
        apiClient.get<unknown>(
          endpoints.hrms.payrollBankAdvice(id as Id),
          format ? { format } : undefined,
        ),
      enabled: id != null && enabled,
    }),
  usePayAll: () =>
    useHrmsMutation(
      ({
        payrollId,
        body,
      }: {
        payrollId: Id;
        body: { mode: string; paid_on: string; reference_no?: string };
      }) => apiClient.post(endpoints.hrms.payrollPayAll(payrollId), body),
    ),
  usePayslip: (itemId: Id | null, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "payslip", itemId],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.payslip(itemId as Id)),
      enabled: itemId != null && enabled,
    }),
  useRecordPayslipPayment: () =>
    useHrmsMutation(
      ({
        itemId,
        body,
      }: {
        itemId: Id;
        body: { amount: number; paid_on: string; mode: string; reference_no?: string };
      }) => apiClient.post(endpoints.hrms.payslipPayment(itemId), body),
    ),
  useReversePayment: () =>
    useHrmsMutation(({ paymentId, reason }: { paymentId: Id; reason: string }) =>
      apiClient.post(endpoints.hrms.paymentReverse(paymentId), { reason }),
    ),

  // --- Adjustments & Loans ---
  usePayrollAdjustments: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "payroll-adjustments"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.payrollAdjustments),
      enabled,
    }),
  useCreatePayrollAdjustment: () =>
    useHrmsMutation((body: Partial<PayrollAdjustment>) =>
      apiClient.post(endpoints.hrms.payrollAdjustments, body),
    ),
  useLoans: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "loans"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.loans),
      enabled,
    }),
  useCreateLoan: () =>
    useHrmsMutation((body: Partial<EmployeeLoan>) =>
      apiClient.post(endpoints.hrms.loans, body),
    ),

  // --- Exits & Settlements ---
  useExits: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "exits"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.exits),
      enabled,
    }),
  useCreateExit: () =>
    useHrmsMutation((body: Partial<ExitRequest>) =>
      apiClient.post(endpoints.hrms.exits, body),
    ),
  useReviewExit: () =>
    useHrmsMutation(
      ({
        id,
        decision,
        remarks,
        last_working_date,
      }: {
        id: Id;
        decision: string;
        remarks?: string;
        last_working_date?: string;
      }) =>
        apiClient.put(endpoints.hrms.exitReview(id), {
          decision,
          remarks,
          last_working_date,
        }),
    ),
  useRecomputeSettlement: () =>
    useHrmsMutation((id: Id) =>
      apiClient.post(endpoints.hrms.exitSettlementRecompute(id), {}),
    ),
  useFinalizeSettlement: () =>
    useHrmsMutation((id: Id) =>
      apiClient.post(endpoints.hrms.exitSettlementFinalize(id), {}),
    ),
  useCancelExit: () =>
    useHrmsMutation((id: Id) =>
      apiClient.put(endpoints.hrms.exitCancel(id), {}),
    ),

  // --- Rosters & Deductions ---
  useRosters: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "rosters", params],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.rosters, params),
      enabled,
    }),
  useCreateRoster: () =>
    useHrmsMutation((body: Partial<ShiftRoster>) =>
      apiClient.post(endpoints.hrms.rosters, body),
    ),
  useDeductionRules: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "deduction-rules"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.deductionRules),
      enabled,
    }),
  useCreateDeductionRule: () =>
    useHrmsMutation((body: Partial<DeductionRule>) =>
      apiClient.post(endpoints.hrms.deductionRules, body),
    ),
  useUpdateDeductionRule: () =>
    useHrmsMutation(
      ({ id, body }: { id: Id; body: Partial<DeductionRule> }) =>
        apiClient.put(endpoints.hrms.deductionRule(id), body),
    ),

  // --- Self-Service ---
  useSelfProfile: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "me"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.me),
      enabled,
    }),
  useSelfAttendance: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "me-attendance", params],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.meAttendance, params),
      enabled,
    }),
  useSelfLeave: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "me-leave"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.meLeave),
      enabled,
    }),
  useSelfPayslips: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "me-payslips"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.mePayslips),
      enabled,
    }),
  useNotifications: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "notifications"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.notifications),
      enabled,
    }),
  useMarkNotificationsRead: () =>
    useHrmsMutation(() =>
      apiClient.put(endpoints.hrms.notificationsRead, {}),
    ),

  // --- Analytics & Automation ---
  useAnalytics: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "analytics", params],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.analytics, params),
      enabled,
    }),
  useAutomationRuns: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "automation-runs"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.automationRuns),
      enabled,
    }),
  useRunAutomation: () =>
    useHrmsMutation(() => apiClient.post(endpoints.hrms.automationRun, {})),
};
