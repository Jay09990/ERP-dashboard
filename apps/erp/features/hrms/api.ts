import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AttendanceRecord,
  DeductionRule,
  Employee,
  EmployeeDocument,
  LeaveBalance,
  LeaveRequest,
  OnboardingTask,
  OvertimeRequest,
  PayrollRun,
  ProjectAssignment,
  ProjectTimesheet,
  ShiftRoster,
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
  // Employee CRUD
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

  // Attendance
  useAttendance: (filters?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "attendance", filters],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.attendance, filters),
      enabled,
    }),
  useAttendanceAlerts: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "attendance-alerts", params],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.attendanceAlerts, params),
      enabled,
    }),
  useCreateAttendance: () =>
    useHrmsMutation((body: Partial<AttendanceRecord>) =>
      apiClient.post(endpoints.hrms.attendance, body),
    ),

  // Leave Balances & Requests
  useLeaveBalances: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "leave-balances", params],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.leaveBalances, params),
      enabled,
    }),
  useUpdateLeaveBalance: () =>
    useHrmsMutation(
      ({ employeeId, body }: { employeeId: Id; body: Partial<LeaveBalance> }) =>
        apiClient.put(endpoints.hrms.leaveBalance(employeeId), body),
    ),
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
      ({ id, status, remarks }: { id: Id; status: string; remarks?: string }) =>
        apiClient.put(endpoints.hrms.leaveRequest(id), { status, remarks }),
    ),

  // Overtime
  useOvertimeRequests: (filters?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "overtime-requests", filters],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.overtimeRequests, filters),
      enabled,
    }),
  useCreateOvertimeRequest: () =>
    useHrmsMutation((body: Partial<OvertimeRequest>) =>
      apiClient.post(endpoints.hrms.overtimeRequests, body),
    ),
  useReviewOvertimeRequest: () =>
    useHrmsMutation(
      ({ id, status }: { id: Id; status: string }) =>
        apiClient.put(endpoints.hrms.overtimeRequestReview(id), { status }),
    ),

  // Deduction Rules
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

  // Payroll
  usePayrollRuns: (enabled = true) =>
    useQuery({
      queryKey: ["hrms", "payroll"],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.payroll),
      enabled,
    }),
  useCreatePayrollRun: () =>
    useHrmsMutation((body: Partial<PayrollRun>) =>
      apiClient.post(endpoints.hrms.payroll, body),
    ),
  useApprovePayroll: () =>
    useHrmsMutation((id: Id) =>
      apiClient.put(endpoints.hrms.payrollApprove(id), {}),
    ),
  usePayslip: (payrollId: Id, employeeId: Id, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "payslip", payrollId, employeeId],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.payslip(payrollId, employeeId)),
      enabled,
    }),

  // Employee Documents
  useEmployeeDocuments: (employeeId: Id, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "employee-documents", employeeId],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.employeeDocuments(employeeId)),
      enabled,
    }),
  useCreateEmployeeDocument: () =>
    useHrmsMutation(
      ({ employeeId, body }: { employeeId: Id; body: Partial<EmployeeDocument> }) =>
        apiClient.post(endpoints.hrms.employeeDocuments(employeeId), body),
    ),
  useDeleteEmployeeDocument: () =>
    useHrmsMutation((documentId: Id) =>
      apiClient.delete(endpoints.hrms.document(documentId)),
    ),

  // Onboarding Tasks
  useOnboardingTasks: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "onboarding-tasks", params],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.hrms.onboardingTasks, params),
      enabled,
    }),
  useCreateOnboardingTask: () =>
    useHrmsMutation((body: Partial<OnboardingTask>) =>
      apiClient.post(endpoints.hrms.onboardingTasks, body),
    ),
  useUpdateOnboardingTask: () =>
    useHrmsMutation(
      ({ id, body }: { id: Id; body: Partial<OnboardingTask> }) =>
        apiClient.put(endpoints.hrms.onboardingTask(id), body),
    ),

  // Shift Rosters
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

  // Project Assignments & Timesheets
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

  // Analytics
  useAnalytics: (params?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["hrms", "analytics", params],
      queryFn: () => apiClient.get<unknown>(endpoints.hrms.analytics, params),
      enabled,
    }),
};
