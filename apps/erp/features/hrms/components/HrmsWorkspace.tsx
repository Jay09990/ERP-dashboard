"use client";

import { permissions } from "@/config/permissions";
import { hrmsApi } from "@/features/hrms/api";
import type {
  AttendanceRecord,
  Employee,
  HrSettings,
  LeaveRequest,
  PayrollRun,
  WorkLocation,
} from "@/features/hrms/schema";
import { sessionHasPermission } from "@/lib/auth/permissions";
import { useSessionStore } from "@/stores/session-store";
import {
  Button,
  DataTable,
  FilterBar,
  StatCard,
  StatusPill,
} from "@altrex/ui";
import {
  CalendarRange,
  Clock,
  Coins,
  FileCheck,
  LayoutDashboard,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export type HrmsTab =
  | "overview"
  | "employees"
  | "attendance"
  | "leaves"
  | "payroll"
  | "work-locations"
  | "settings";

interface HrmsWorkspaceProps {
  initialTab?: HrmsTab;
}

function formatINR(val?: number | null) {
  if (val == null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function titleCase(text?: string) {
  if (!text) return "—";
  return text
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function HrmsWorkspace({ initialTab = "overview" }: HrmsWorkspaceProps) {
  const session = useSessionStore((state) => state.session);
  const hasPerm = useCallback(
    (perm: string) =>
      !session ||
      sessionHasPermission(session.permissions, perm, session.isSuperAdmin),
    [session],
  );

  const [activeTab, setActiveTab] = useState<HrmsTab>(initialTab);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState("all");

  // Dialog states
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);

  // Queries
  const employeesQuery = hrmsApi.useEmployees();
  const attendanceQuery = hrmsApi.useAttendance();
  const attendanceSummaryQuery = hrmsApi.useAttendanceSummary();
  const leaveRequestsQuery = hrmsApi.useLeaveRequests();
  const leaveBalancesQuery = hrmsApi.useLeaveBalances();
  const payrollRunsQuery = hrmsApi.usePayrollRuns();
  const workLocationsQuery = hrmsApi.useWorkLocations();
  const hrSettingsQuery = hrmsApi.useHrSettings();
  const analyticsQuery = hrmsApi.useAnalytics();

  // Mutations
  const createEmployeeMutation = hrmsApi.useCreateEmployee();
  const updateEmployeeMutation = hrmsApi.useUpdateEmployee();
  const deleteEmployeeMutation = hrmsApi.useDeleteEmployee();
  const markAttendanceMutation = hrmsApi.useMarkAttendance();
  const reprocessAttendanceMutation = hrmsApi.useReprocessAttendance();
  const createLeaveMutation = hrmsApi.useCreateLeaveRequest();
  const reviewLeaveMutation = hrmsApi.useReviewLeaveRequest();
  const cancelLeaveMutation = hrmsApi.useCancelLeaveRequest();
  const createPayrollRunMutation = hrmsApi.useCreatePayrollRun();
  const approvePayrollMutation = hrmsApi.useApprovePayroll();
  const createLocationMutation = hrmsApi.useCreateWorkLocation();
  const updateSettingsMutation = hrmsApi.useUpdateHrSettings();

  // Data extraction
  const rawEmployees = employeesQuery.data;
  const employees: Employee[] = useMemo(() => {
    if (Array.isArray(rawEmployees)) return rawEmployees;
    if (rawEmployees && typeof rawEmployees === "object") {
      const rec = rawEmployees as Record<string, unknown>;
      if (Array.isArray(rec.employees)) return rec.employees;
      if (Array.isArray(rec.data)) return rec.data;
    }
    return [];
  }, [rawEmployees]);

  const rawAttendance = attendanceQuery.data;
  const attendanceList: AttendanceRecord[] = useMemo(() => {
    if (Array.isArray(rawAttendance)) return rawAttendance;
    if (rawAttendance && typeof rawAttendance === "object") {
      const rec = rawAttendance as Record<string, unknown>;
      if (Array.isArray(rec.attendance)) return rec.attendance;
      if (Array.isArray(rec.data)) return rec.data;
    }
    return [];
  }, [rawAttendance]);

  const rawLeaves = leaveRequestsQuery.data;
  const leaveRequests: LeaveRequest[] = useMemo(() => {
    if (Array.isArray(rawLeaves)) return rawLeaves;
    if (rawLeaves && typeof rawLeaves === "object") {
      const rec = rawLeaves as Record<string, unknown>;
      if (Array.isArray(rec.leaveRequests)) return rec.leaveRequests;
      if (Array.isArray(rec.data)) return rec.data;
    }
    return [];
  }, [rawLeaves]);

  const rawPayroll = payrollRunsQuery.data;
  const payrollRuns: PayrollRun[] = useMemo(() => {
    if (Array.isArray(rawPayroll)) return rawPayroll;
    if (rawPayroll && typeof rawPayroll === "object") {
      const rec = rawPayroll as Record<string, unknown>;
      if (Array.isArray(rec.payrollRuns)) return rec.payrollRuns;
      if (Array.isArray(rec.data)) return rec.data;
    }
    return [];
  }, [rawPayroll]);

  const rawLocations = workLocationsQuery.data;
  const workLocations: WorkLocation[] = useMemo(() => {
    if (Array.isArray(rawLocations)) return rawLocations;
    if (rawLocations && typeof rawLocations === "object") {
      const rec = rawLocations as Record<string, unknown>;
      if (Array.isArray(rec.workLocations)) return rec.workLocations;
      if (Array.isArray(rec.data)) return rec.data;
    }
    return [];
  }, [rawLocations]);

  // Form states for modals
  const [empForm, setEmpForm] = useState<Partial<Employee>>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "male",
    employee_category: "staff",
    employment_type: "permanent",
    status: "active",
    joining_date: new Date().toISOString().slice(0, 10),
  });

  const [attForm, setAttForm] = useState({
    employee_id: 1,
    date: new Date().toISOString().slice(0, 10),
    status: "present",
    worked_hours: 8,
    remarks: "",
  });

  const [leaveForm, setLeaveForm] = useState({
    leave_type_id: 1,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
    reason: "",
    is_half_day: false,
  });

  const [payrollForm, setPayrollForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const [locForm, setLocForm] = useState<Partial<WorkLocation>>({
    location_name: "",
    location_type: "office",
    address: "",
    radius_meters: 200,
    is_active: true,
  });

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const name = `${emp.first_name ?? emp.firstName ?? ""} ${emp.last_name ?? emp.lastName ?? ""}`.toLowerCase();
      const email = (emp.email ?? "").toLowerCase();
      const phone = emp.phone ?? "";
      const matchesSearch =
        name.includes(employeeSearch.toLowerCase()) ||
        email.includes(employeeSearch.toLowerCase()) ||
        phone.includes(employeeSearch);
      const matchesStatus =
        employeeStatusFilter === "all" ||
        emp.status?.toLowerCase() === employeeStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [employees, employeeSearch, employeeStatusFilter]);

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployee) {
      const id = selectedEmployee.employee_id ?? selectedEmployee.employeeId ?? selectedEmployee.id;
      if (id) {
        await updateEmployeeMutation.mutateAsync({ id, body: empForm });
      }
    } else {
      await createEmployeeMutation.mutateAsync(empForm);
    }
    setIsEmployeeDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    await markAttendanceMutation.mutateAsync(attForm);
    setIsAttendanceDialogOpen(false);
  };

  const handleSaveLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLeaveMutation.mutateAsync(leaveForm);
    setIsLeaveDialogOpen(false);
  };

  const handleSavePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPayrollRunMutation.mutateAsync(payrollForm);
    setIsPayrollDialogOpen(false);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLocationMutation.mutateAsync(locForm);
    setIsLocationDialogOpen(false);
  };

  return (
    <div className="altrex-workspace-container" style={{ padding: "24px" }}>
      {/* Header */}
      <header
        className="altrex-page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
            Human Resource Management (HRMS)
          </h1>
          <p style={{ color: "var(--muted-foreground)", margin: "4px 0 0" }}>
            Manage workforce directory, daily attendance, leaves, payroll processing, and HR policies.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {activeTab === "employees" && (
            <Button
              onClick={() => {
                setSelectedEmployee(null);
                setEmpForm({
                  first_name: "",
                  last_name: "",
                  email: "",
                  phone: "",
                  gender: "male",
                  employee_category: "staff",
                  employment_type: "permanent",
                  status: "active",
                  joining_date: new Date().toISOString().slice(0, 10),
                });
                setIsEmployeeDialogOpen(true);
              }}
            >
              <Plus size={16} style={{ marginRight: 6 }} /> Add Employee
            </Button>
          )}
          {activeTab === "attendance" && (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  reprocessAttendanceMutation.mutate({
                    from: new Date().toISOString().slice(0, 7) + "-01",
                    to: new Date().toISOString().slice(0, 10),
                  })
                }
              >
                <RefreshCw size={16} style={{ marginRight: 6 }} /> Reprocess
              </Button>
              <Button onClick={() => setIsAttendanceDialogOpen(true)}>
                <Clock size={16} style={{ marginRight: 6 }} /> Mark Attendance
              </Button>
            </>
          )}
          {activeTab === "leaves" && (
            <Button onClick={() => setIsLeaveDialogOpen(true)}>
              <CalendarRange size={16} style={{ marginRight: 6 }} /> Apply Leave
            </Button>
          )}
          {activeTab === "payroll" && (
            <Button onClick={() => setIsPayrollDialogOpen(true)}>
              <Coins size={16} style={{ marginRight: 6 }} /> Generate Payroll Run
            </Button>
          )}
          {activeTab === "work-locations" && (
            <Button onClick={() => setIsLocationDialogOpen(true)}>
              <MapPin size={16} style={{ marginRight: 6 }} /> Add Work Location
            </Button>
          )}
        </div>
      </header>

      {/* KPI Stat Cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          label="Total Employees"
          value={String(employees.length)}
          detail={`${employees.filter((e) => e.status === "active").length} active`}
        />
        <StatCard
          label="Present Today"
          value={String(
            attendanceList.filter((a) => a.status === "present").length,
          )}
          detail="Daily check-in logs"
        />
        <StatCard
          label="Pending Leaves"
          value={String(
            leaveRequests.filter((l) => l.status === "pending").length,
          )}
          detail="Awaiting HR approval"
        />
        <StatCard
          label="Payroll Runs"
          value={String(payrollRuns.length)}
          detail={
            payrollRuns[0]
              ? `Latest: ${formatINR(payrollRuns[0].total_net ?? payrollRuns[0].totalNet)}`
              : "No payroll runs"
          }
        />
      </section>

      {/* Module Navigation Tabs */}
      <nav
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "20px",
          overflowX: "auto",
        }}
      >
        {[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          { id: "employees", label: "Employees", icon: Users },
          { id: "attendance", label: "Attendance", icon: Clock },
          { id: "leaves", label: "Leaves", icon: CalendarRange },
          { id: "payroll", label: "Payroll", icon: Coins },
          { id: "work-locations", label: "Work Locations", icon: MapPin },
          { id: "settings", label: "HR Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as HrmsTab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                border: "none",
                background: "transparent",
                borderBottom: isActive
                  ? "2px solid var(--primary, #2563eb)"
                  : "2px solid transparent",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--primary, #2563eb)" : "var(--muted-foreground)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Recent Employees */}
          <section
            className="altrex-card"
            style={{
              padding: "20px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                Recent Employees
              </h3>
              <Button variant="outline" onClick={() => setActiveTab("employees")}>
                View All
              </Button>
            </div>
            <div className="altrex-table-wrap">
              <table className="altrex-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.slice(0, 5).map((emp, i) => (
                    <tr key={emp.employee_id ?? emp.id ?? i}>
                      <td>
                        <strong>
                          {emp.first_name ?? emp.firstName}{" "}
                          {emp.last_name ?? emp.lastName}
                        </strong>
                        <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                          {emp.email}
                        </div>
                      </td>
                      <td>{emp.department_name ?? emp.departmentId ?? "Engineering"}</td>
                      <td>
                        <StatusPill status={emp.status} />
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "16px" }}>
                        No employees recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pending Leave Requests */}
          <section
            className="altrex-card"
            style={{
              padding: "20px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                Pending Leaves
              </h3>
              <Button variant="outline" onClick={() => setActiveTab("leaves")}>
                Manage Leaves
              </Button>
            </div>
            <div className="altrex-table-wrap">
              <table className="altrex-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.slice(0, 5).map((req, i) => (
                    <tr key={req.leave_id ?? req.id ?? i}>
                      <td>{req.employee_name ?? `Employee #${req.employee_id}`}</td>
                      <td>
                        {req.start_date ?? req.fromDate} to{" "}
                        {req.end_date ?? req.toDate}
                      </td>
                      <td>{req.reason ?? "—"}</td>
                      <td>
                        <StatusPill status={req.status} />
                      </td>
                    </tr>
                  ))}
                  {leaveRequests.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "16px" }}>
                        No pending leaves.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB: EMPLOYEES */}
      {activeTab === "employees" && (
        <section
          className="altrex-card"
          style={{
            padding: "20px",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        >
          <FilterBar>
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flex: 1,
                  background: "var(--background)",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              >
                <Search size={16} color="var(--muted-foreground)" />
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>
              <select
                className="altrex-input"
                style={{ width: "180px" }}
                value={employeeStatusFilter}
                onChange={(e) => setEmployeeStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
                <option value="resigned">Resigned</option>
              </select>
            </div>
          </FilterBar>

          <div className="altrex-table-wrap" style={{ marginTop: "16px" }}>
            <table className="altrex-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Contact</th>
                  <th>Job Title / Role</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, i) => {
                  const id = emp.employee_id ?? emp.employeeId ?? emp.id ?? i;
                  return (
                    <tr key={id}>
                      <td>
                        <strong>
                          {emp.first_name ?? emp.firstName}{" "}
                          {emp.last_name ?? emp.lastName}
                        </strong>
                        <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                          Joining: {emp.joining_date ?? emp.joiningDate ?? "—"}
                        </div>
                      </td>
                      <td>
                        <div>{emp.email}</div>
                        <small style={{ color: "var(--muted-foreground)" }}>
                          {emp.phone}
                        </small>
                      </td>
                      <td>
                        <div>{emp.designation_name ?? emp.designationId ?? "Staff"}</div>
                        <small style={{ color: "var(--muted-foreground)" }}>
                          {emp.department_name ?? emp.departmentId ?? "Operations"}
                        </small>
                      </td>
                      <td>{emp.workLocation ?? "Head Office"}</td>
                      <td>{titleCase(emp.employee_category ?? "staff")}</td>
                      <td>
                        <StatusPill status={emp.status} />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setEmpForm({ ...emp });
                              setIsEmployeeDialogOpen(true);
                            }}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete ${emp.first_name ?? emp.firstName}?`,
                                )
                              ) {
                                deleteEmployeeMutation.mutate(id);
                              }
                            }}
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                      No employees match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB: ATTENDANCE */}
      {activeTab === "attendance" && (
        <section
          className="altrex-card"
          style={{
            padding: "20px",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                padding: "12px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                background: "var(--card)",
              }}
            >
              <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                Present Days
              </div>
              <strong style={{ fontSize: "20px" }}>22</strong>
            </div>
            <div
              style={{
                padding: "12px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                background: "var(--card)",
              }}
            >
              <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                Worked Hours
              </div>
              <strong style={{ fontSize: "20px" }}>176 hrs</strong>
            </div>
            <div
              style={{
                padding: "12px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                background: "var(--card)",
              }}
            >
              <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                Late Marks
              </div>
              <strong style={{ fontSize: "20px" }}>2</strong>
            </div>
            <div
              style={{
                padding: "12px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                background: "var(--card)",
              }}
            >
              <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                Overtime Hours
              </div>
              <strong style={{ fontSize: "20px" }}>8 hrs</strong>
            </div>
          </div>

          <div className="altrex-table-wrap">
            <table className="altrex-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Worked Hours</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.map((att, i) => (
                  <tr key={att.attendance_id ?? att.id ?? i}>
                    <td>{att.employee_name ?? `Employee #${att.employee_id ?? att.employeeId}`}</td>
                    <td>{att.date}</td>
                    <td>{att.check_in ?? att.checkIn ?? "—"}</td>
                    <td>{att.check_out ?? att.checkOut ?? "—"}</td>
                    <td>{att.worked_hours ?? 8} hrs</td>
                    <td>
                      <StatusPill status={att.status} />
                    </td>
                    <td>{att.remarks ?? att.notes ?? "—"}</td>
                  </tr>
                ))}
                {attendanceList.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                      No attendance logs recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB: LEAVES */}
      {activeTab === "leaves" && (
        <section
          className="altrex-card"
          style={{
            padding: "20px",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px" }}>
            Leave Requests
          </h3>
          <div className="altrex-table-wrap">
            <table className="altrex-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((req, i) => {
                  const id = req.leave_id ?? req.leaveRequestId ?? req.id ?? i;
                  return (
                    <tr key={id}>
                      <td>{req.employee_name ?? `Employee #${req.employee_id}`}</td>
                      <td>{req.leave_type_name ?? req.leaveType ?? "Casual Leave"}</td>
                      <td>{req.start_date ?? req.fromDate}</td>
                      <td>{req.end_date ?? req.toDate}</td>
                      <td>{req.days ?? 1}</td>
                      <td>{req.reason ?? "—"}</td>
                      <td>
                        <StatusPill status={req.status} />
                      </td>
                      <td>
                        {req.status === "pending" && (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <Button
                              onClick={() =>
                                reviewLeaveMutation.mutate({
                                  id,
                                  decision: "approved",
                                  remarks: "Approved by HR",
                                })
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                reviewLeaveMutation.mutate({
                                  id,
                                  decision: "rejected",
                                  remarks: "Rejected by HR",
                                })
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {leaveRequests.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>
                      No leave requests recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB: PAYROLL */}
      {activeTab === "payroll" && (
        <section
          className="altrex-card"
          style={{
            padding: "20px",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px" }}>
            Monthly Payroll Runs
          </h3>
          <div className="altrex-table-wrap">
            <table className="altrex-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Gross Wages</th>
                  <th>Total Deductions</th>
                  <th>Net Disbursed</th>
                  <th>Employees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollRuns.map((run, i) => {
                  const id = run.payroll_id ?? run.payrollId ?? run.id ?? i;
                  return (
                    <tr key={id}>
                      <td>
                        <strong>
                          {new Date(run.year, run.month - 1).toLocaleString("default", {
                            month: "long",
                          })}{" "}
                          {run.year}
                        </strong>
                      </td>
                      <td>{formatINR(run.total_gross ?? run.totalGross)}</td>
                      <td>{formatINR(run.total_deductions ?? run.totalDeductions)}</td>
                      <td>
                        <strong>{formatINR(run.total_net ?? run.totalNet)}</strong>
                      </td>
                      <td>{run.employee_count ?? 2}</td>
                      <td>
                        <StatusPill status={run.status} />
                      </td>
                      <td>
                        {run.status === "draft" && (
                          <Button
                            onClick={() => approvePayrollMutation.mutate(id)}
                          >
                            Approve Run
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {payrollRuns.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                      No payroll runs generated.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB: WORK LOCATIONS */}
      {activeTab === "work-locations" && (
        <section
          className="altrex-card"
          style={{
            padding: "20px",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        >
          <div className="altrex-table-wrap">
            <table className="altrex-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Location Name</th>
                  <th>Type</th>
                  <th>Address</th>
                  <th>Geo Fence (Radius)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {workLocations.map((loc, i) => (
                  <tr key={loc.location_id ?? loc.id ?? i}>
                    <td>
                      <strong>{loc.location_name}</strong>
                    </td>
                    <td>{titleCase(loc.location_type)}</td>
                    <td>{loc.address ?? "—"}</td>
                    <td>{loc.radius_meters ?? 200} meters</td>
                    <td>
                      <StatusPill status={loc.is_active ? "active" : "inactive"} />
                    </td>
                  </tr>
                ))}
                {workLocations.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "24px" }}>
                      No work locations added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB: SETTINGS */}
      {activeTab === "settings" && (
        <section
          className="altrex-card"
          style={{
            padding: "24px",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            maxWidth: "800px",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
            HR Company Settings & Policies
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Settings updated successfully.");
            }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
          >
            <label className="altrex-field">
              <span>Timezone</span>
              <input
                className="altrex-input"
                defaultValue="Asia/Kolkata"
              />
            </label>
            <label className="altrex-field">
              <span>Default Shift Start</span>
              <input className="altrex-input" type="time" defaultValue="09:30" />
            </label>
            <label className="altrex-field">
              <span>Default Shift End</span>
              <input className="altrex-input" type="time" defaultValue="18:30" />
            </label>
            <label className="altrex-field">
              <span>Standard Daily Hours</span>
              <input className="altrex-input" type="number" defaultValue="8" />
            </label>
            <label className="altrex-field">
              <span>Late Grace Minutes</span>
              <input className="altrex-input" type="number" defaultValue="15" />
            </label>
            <label className="altrex-field">
              <span>Probation Period (Months)</span>
              <input className="altrex-input" type="number" defaultValue="6" />
            </label>
            <label className="altrex-field">
              <span>Notice Period (Days)</span>
              <input className="altrex-input" type="number" defaultValue="30" />
            </label>
            <label className="altrex-field">
              <span>Overtime Multiplier</span>
              <input className="altrex-input" type="number" step="0.1" defaultValue="1.5" />
            </label>
            <div style={{ gridColumn: "1 / -1", marginTop: "12px" }}>
              <Button type="submit">Save HR Settings</Button>
            </div>
          </form>
        </section>
      )}

      {/* DIALOG: ADD/EDIT EMPLOYEE */}
      {isEmployeeDialogOpen && (
        <div
          className="altrex-dialog-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="altrex-dialog"
            style={{
              background: "var(--background)",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
              {selectedEmployee ? "Edit Employee" : "Add New Employee"}
            </h3>
            <form onSubmit={handleSaveEmployee}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <label className="altrex-field">
                  <span>First Name *</span>
                  <input
                    className="altrex-input"
                    required
                    value={empForm.first_name ?? empForm.firstName ?? ""}
                    onChange={(e) =>
                      setEmpForm({ ...empForm, first_name: e.target.value })
                    }
                  />
                </label>
                <label className="altrex-field">
                  <span>Last Name *</span>
                  <input
                    className="altrex-input"
                    required
                    value={empForm.last_name ?? empForm.lastName ?? ""}
                    onChange={(e) =>
                      setEmpForm({ ...empForm, last_name: e.target.value })
                    }
                  />
                </label>
                <label className="altrex-field">
                  <span>Email *</span>
                  <input
                    className="altrex-input"
                    type="email"
                    required
                    value={empForm.email ?? ""}
                    onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                  />
                </label>
                <label className="altrex-field">
                  <span>Phone *</span>
                  <input
                    className="altrex-input"
                    required
                    value={empForm.phone ?? ""}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                  />
                </label>
                <label className="altrex-field">
                  <span>Category</span>
                  <select
                    className="altrex-input"
                    value={empForm.employee_category ?? "staff"}
                    onChange={(e) =>
                      setEmpForm({
                        ...empForm,
                        employee_category: e.target.value,
                      })
                    }
                  >
                    <option value="staff">Staff</option>
                    <option value="worker">Worker / Labour</option>
                  </select>
                </label>
                <label className="altrex-field">
                  <span>Employment Type</span>
                  <select
                    className="altrex-input"
                    value={empForm.employment_type ?? empForm.employmentType ?? "permanent"}
                    onChange={(e) =>
                      setEmpForm({
                        ...empForm,
                        employment_type: e.target.value,
                      })
                    }
                  >
                    <option value="permanent">Permanent</option>
                    <option value="probation">Probation</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </label>
                <label className="altrex-field">
                  <span>Joining Date</span>
                  <input
                    className="altrex-input"
                    type="date"
                    value={empForm.joining_date ?? empForm.joiningDate ?? ""}
                    onChange={(e) =>
                      setEmpForm({ ...empForm, joining_date: e.target.value })
                    }
                  />
                </label>
                <label className="altrex-field">
                  <span>Status</span>
                  <select
                    className="altrex-input"
                    value={empForm.status ?? "active"}
                    onChange={(e) => setEmpForm({ ...empForm, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                    <option value="resigned">Resigned</option>
                  </select>
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "20px",
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEmployeeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedEmployee ? "Update" : "Save Employee"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: MARK ATTENDANCE */}
      {isAttendanceDialogOpen && (
        <div
          className="altrex-dialog-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="altrex-dialog"
            style={{
              background: "var(--background)",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "480px",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
              Mark Employee Attendance
            </h3>
            <form onSubmit={handleSaveAttendance}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label className="altrex-field">
                  <span>Employee</span>
                  <select
                    className="altrex-input"
                    value={attForm.employee_id}
                    onChange={(e) =>
                      setAttForm({ ...attForm, employee_id: Number(e.target.value) })
                    }
                  >
                    {employees.map((e) => (
                      <option
                        key={e.employee_id ?? e.id}
                        value={e.employee_id ?? e.id}
                      >
                        {e.first_name ?? e.firstName} {e.last_name ?? e.lastName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="altrex-field">
                  <span>Date</span>
                  <input
                    className="altrex-input"
                    type="date"
                    value={attForm.date}
                    onChange={(e) => setAttForm({ ...attForm, date: e.target.value })}
                  />
                </label>
                <label className="altrex-field">
                  <span>Status</span>
                  <select
                    className="altrex-input"
                    value={attForm.status}
                    onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="half_day">Half Day</option>
                    <option value="leave">On Leave</option>
                  </select>
                </label>
                <label className="altrex-field">
                  <span>Worked Hours</span>
                  <input
                    className="altrex-input"
                    type="number"
                    value={attForm.worked_hours}
                    onChange={(e) =>
                      setAttForm({
                        ...attForm,
                        worked_hours: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="altrex-field">
                  <span>Remarks</span>
                  <input
                    className="altrex-input"
                    value={attForm.remarks}
                    onChange={(e) =>
                      setAttForm({ ...attForm, remarks: e.target.value })
                    }
                  />
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "20px",
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAttendanceDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Attendance</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: APPLY LEAVE */}
      {isLeaveDialogOpen && (
        <div
          className="altrex-dialog-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="altrex-dialog"
            style={{
              background: "var(--background)",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "480px",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
              Apply for Leave
            </h3>
            <form onSubmit={handleSaveLeave}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label className="altrex-field">
                  <span>Leave Type</span>
                  <select
                    className="altrex-input"
                    value={leaveForm.leave_type_id}
                    onChange={(e) =>
                      setLeaveForm({
                        ...leaveForm,
                        leave_type_id: Number(e.target.value),
                      })
                    }
                  >
                    <option value={1}>Casual Leave (CL)</option>
                    <option value={2}>Sick Leave (SL)</option>
                    <option value={3}>Paid Leave (PL)</option>
                  </select>
                </label>
                <label className="altrex-field">
                  <span>Start Date</span>
                  <input
                    className="altrex-input"
                    type="date"
                    required
                    value={leaveForm.start_date}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, start_date: e.target.value })
                    }
                  />
                </label>
                <label className="altrex-field">
                  <span>End Date</span>
                  <input
                    className="altrex-input"
                    type="date"
                    required
                    value={leaveForm.end_date}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, end_date: e.target.value })
                    }
                  />
                </label>
                <label className="altrex-field">
                  <span>Reason</span>
                  <textarea
                    className="altrex-input"
                    rows={3}
                    required
                    value={leaveForm.reason}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, reason: e.target.value })
                    }
                  />
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "20px",
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLeaveDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: GENERATE PAYROLL */}
      {isPayrollDialogOpen && (
        <div
          className="altrex-dialog-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="altrex-dialog"
            style={{
              background: "var(--background)",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "400px",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
              Generate Monthly Payroll
            </h3>
            <form onSubmit={handleSavePayroll}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label className="altrex-field">
                  <span>Year</span>
                  <input
                    className="altrex-input"
                    type="number"
                    value={payrollForm.year}
                    onChange={(e) =>
                      setPayrollForm({
                        ...payrollForm,
                        year: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="altrex-field">
                  <span>Month</span>
                  <select
                    className="altrex-input"
                    value={payrollForm.month}
                    onChange={(e) =>
                      setPayrollForm({
                        ...payrollForm,
                        month: Number(e.target.value),
                      })
                    }
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {new Date(2026, m - 1).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "20px",
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPayrollDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Run Payroll</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: ADD WORK LOCATION */}
      {isLocationDialogOpen && (
        <div
          className="altrex-dialog-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="altrex-dialog"
            style={{
              background: "var(--background)",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "480px",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
              Add Work Location
            </h3>
            <form onSubmit={handleSaveLocation}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label className="altrex-field">
                  <span>Location Name *</span>
                  <input
                    className="altrex-input"
                    required
                    value={locForm.location_name ?? ""}
                    onChange={(e) =>
                      setLocForm({ ...locForm, location_name: e.target.value })
                    }
                  />
                </label>
                <label className="altrex-field">
                  <span>Location Type</span>
                  <select
                    className="altrex-input"
                    value={locForm.location_type ?? "office"}
                    onChange={(e) =>
                      setLocForm({ ...locForm, location_type: e.target.value })
                    }
                  >
                    <option value="office">Office</option>
                    <option value="site">Project Site</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="altrex-field">
                  <span>Address</span>
                  <input
                    className="altrex-input"
                    value={locForm.address ?? ""}
                    onChange={(e) =>
                      setLocForm({ ...locForm, address: e.target.value })
                    }
                  />
                </label>
                <label className="altrex-field">
                  <span>Geo-fence Radius (Meters)</span>
                  <input
                    className="altrex-input"
                    type="number"
                    value={locForm.radius_meters ?? 200}
                    onChange={(e) =>
                      setLocForm({
                        ...locForm,
                        radius_meters: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "20px",
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLocationDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Location</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
