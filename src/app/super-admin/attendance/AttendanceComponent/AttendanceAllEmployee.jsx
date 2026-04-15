import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { CheckCircle, Clock, Users, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";

const departments = [
  "All Departments",
  "Human Resources",
  "Engineering",
  "Sales",
  "Marketing",
  "Finance",
  "Operations",
];

const AttendanceAllEmployee = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [sortConfig, setSortConfig] = useState({
    key: "attendanceDate",
    direction: "desc",
  });

  // Status counts state
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    present: 0,
    onTime: 0,
    late: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
  });

  // Status options with colors
  const statusOptions = [
    { value: "all", label: "All", color: "#6b7280" },
    { value: "present", label: "Present", color: "#10b981" },
    { value: "onTime", label: "On Time", color: "#059669" },
    { value: "late", label: "Late", color: "#f59e0b" },
    { value: "absent", label: "Absent", color: "#ef4444" },
    { value: "halfDay", label: "Half Day", color: "#3b82f6" },
    { value: "leave", label: "Leave", color: "#8b5cf6" },
  ];

  const statusColors = {
    Present: "#10b981",
    Absent: "#ef4444",
    Late: "#f59e0b",
    "On Time": "#10b981",
    "On-time": "#10b981",
    "Half Day": "#3b82f6",
    "Half-day": "#3b82f6",
    Leave: "#8b5cf6",
    "Not Marked": "#6b7280",
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "--:--";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Get working hours
  const getWorkingHours = (hours) => {
    if (!hours) return "0h";
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  // Fetch status counts from the new summary endpoint
  const fetchStatusCounts = useCallback(async () => {
    setStatusLoading(true);
    try {
      const params = {
        date: selectedDate,
        department:
          selectedDepartment !== "All Departments"
            ? selectedDepartment
            : undefined,
      };

      // Remove undefined parameters
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key],
      );

      const response = await axios.get(
        "http://localhost:50001/attendance-summary",
        {
          params,
          timeout: 10000,
        },
      );

      console.log("Status Counts Response:", response.data);

      if (response.data.success && response.data.data) {
        setStatusCounts(response.data.data);
      } else {
        console.error("Summary API returned unsuccessful:", response.data);
      }
    } catch (err) {
      console.error("Error fetching status counts:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      // Fallback: Use the old method
      try {
        const params = {
          date: selectedDate,
          department:
            selectedDepartment !== "All Departments"
              ? selectedDepartment
              : undefined,
          limit: 1000,
          page: 1,
        };

        Object.keys(params).forEach(
          (key) => params[key] === undefined && delete params[key],
        );

        const response = await axios.get("http://localhost:50001/attendance", {
          params,
        });

        if (response.data.success && response.data.data) {
          const allData = response.data.data;
          const counts = {
            all: allData.length,
            present: allData.filter((d) =>
              [
                "Present",
                "On Time",
                "On-time",
                "Late",
                "Half Day",
                "Half-day",
              ].includes(d.attendance[0]?.status),
            ).length,
            onTime: allData.filter((d) =>
              ["On Time", "On-time"].includes(d.attendance[0]?.status),
            ).length,
            late: allData.filter((d) => d.attendance[0]?.status === "Late")
              .length,
            absent: allData.filter((d) => d.attendance[0]?.status === "Absent")
              .length,
            halfDay: allData.filter((d) =>
              ["Half Day", "Half-day"].includes(d.attendance[0]?.status),
            ).length,
            leave: allData.filter((d) => d.attendance[0]?.status === "Leave")
              .length,
          };

          setStatusCounts(counts);
        }
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr);
      }
    } finally {
      setStatusLoading(false);
    }
  }, [selectedDate, selectedDepartment]);

  // Fetch filtered attendance data
  const fetchAttendanceData = useCallback(
    async (shouldResetPage = false) => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page: shouldResetPage ? 1 : pagination.page,
          limit: pagination.limit,
          date: selectedDate,
          department:
            selectedDepartment !== "All Departments"
              ? selectedDepartment
              : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
        };

        // Remove undefined parameters
        Object.keys(params).forEach(
          (key) => params[key] === undefined && delete params[key],
        );

        const response = await axios.get("http://localhost:50001/attendance", {
          params,
        });

        if (response.data.success) {
          let filteredData = response.data.data;

          // Filter by search term on frontend
          if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filteredData = filteredData.filter(
              (item) =>
                item.user.fullName?.toLowerCase().includes(term) ||
                item.user.email?.toLowerCase().includes(term) ||
                item.employeeId?.toLowerCase().includes(term) ||
                item.user.employeeId?.toLowerCase().includes(term),
            );
          }

          // Sort data
          const sortedData = [...filteredData].sort((a, b) => {
            if (sortConfig.key === "name") {
              const nameA = a.user.fullName?.toLowerCase() || "";
              const nameB = b.user.fullName?.toLowerCase() || "";
              return sortConfig.direction === "asc"
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
            }

            if (sortConfig.key === "attendanceDate") {
              const dateA = a.attendance[0]?.attendanceDate || new Date(0);
              const dateB = b.attendance[0]?.attendanceDate || new Date(0);
              return sortConfig.direction === "asc"
                ? new Date(dateA) - new Date(dateB)
                : new Date(dateB) - new Date(dateA);
            }

            if (sortConfig.key === "status") {
              const statusA = a.attendance[0]?.status || "";
              const statusB = b.attendance[0]?.status || "";
              return sortConfig.direction === "asc"
                ? statusA.localeCompare(statusB)
                : statusB.localeCompare(statusA);
            }

            if (sortConfig.key === "employeeId") {
              const idA = a.employeeId || "";
              const idB = b.employeeId || "";
              return sortConfig.direction === "asc"
                ? idA.localeCompare(idB)
                : idB.localeCompare(idA);
            }

            return 0;
          });

          setAttendanceData(sortedData);
          setPagination(response.data.pagination);
        } else {
          setError("Failed to fetch attendance data");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Error fetching attendance data",
        );
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    },
    [
      searchTerm,
      selectedDepartment,
      selectedStatus,
      selectedDate,
      pagination.page,
      pagination.limit,
      sortConfig,
    ],
  );

  // Fetch status counts when date or department changes
  useEffect(() => {
    fetchStatusCounts();
  }, [selectedDate, selectedDepartment, fetchStatusCounts]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendanceData(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch filtered data when filters change
  useEffect(() => {
    fetchAttendanceData(true);
  }, [selectedDepartment, selectedStatus, selectedDate]);

  // Fetch filtered data when page changes
  useEffect(() => {
    if (pagination.page > 1) {
      fetchAttendanceData(false);
    }
  }, [pagination.page]);

  const handleSort = (key) => {
    const newDirection =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction: newDirection });

    // Sort local data
    const sortedData = [...attendanceData].sort((a, b) => {
      let aValue, bValue;

      if (key === "name") {
        aValue = a.user.fullName?.toLowerCase() || "";
        bValue = b.user.fullName?.toLowerCase() || "";
      } else if (key === "attendanceDate") {
        aValue = a.attendance[0]?.attendanceDate || new Date(0);
        bValue = b.attendance[0]?.attendanceDate || new Date(0);
        return newDirection === "asc"
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      } else if (key === "status") {
        aValue = a.attendance[0]?.status || "";
        bValue = b.attendance[0]?.status || "";
      } else if (key === "employeeId") {
        aValue = a.employeeId || "";
        bValue = b.employeeId || "";
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return newDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    setAttendanceData(sortedData);
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    fetchStatusCounts();
    fetchAttendanceData(true);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  // Sort indicator
  const SortIndicator = ({ column }) =>
    sortConfig.key === column ? (
      <span className="sort-indicator">
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    ) : null;

  const statusIcons = {
    all: Users,
    present: CheckCircle,
    absent: XCircle,
    leave: Clock,
  };

  return (
    <div className="">
      {/* Header */}
      <div className="header">
       
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Employee Attendance</h2>

        <p >View and manage employee attendance records</p>
      </div>
      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 lg:grid-cols-7 gap-4">
        {statusOptions.map((status) => {
          const count = statusCounts[status.value] || 0;
          const isActive = selectedStatus === status.value;
          const Icon = statusIcons[status.value];

          return (
            <Card
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className={`cursor-pointer transition-all hover:shadow-lg mb-5
          ${isActive ? "ring-2 ring-blue-500" : ""}
          ${statusLoading ? "opacity-70 pointer-events-none" : ""}
        `}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Left Content */}
                  <div>
                    <p className="text-sm text-gray-600">{status.label}</p>

                    <p
                      className="text-2xl font-semibold"
                      style={{ color: status.color }}
                    >
                      {statusLoading ? "..." : count}
                    </p>
                  </div>

                  {/* Icon */}
                  {Icon && (
                    <Icon className="w-8 h-8" style={{ color: status.color }} />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters Section */}
      <div className="filters-card">
        <div className="filters-grid">
          {/* Search Input */}
          <div className="filter-group">
            <label htmlFor="search">Search by Name, Email or ID</label>
            <div className="search-input">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                />
              </svg>
              <input
                id="search"
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-field"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="filter-group">
            <label htmlFor="department">Department</label>
            <div className="select-wrapper">
              <svg
                className="filter-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path
                  fill="currentColor"
                  d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"
                />
              </svg>
              <select
                id="department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="department-select"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div className="filter-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </div>

          {/* Refresh Button */}
          <div className="filter-group">
            <label>&nbsp;</label>
            <button
              onClick={handleRefresh}
              disabled={loading || statusLoading}
              className="refresh-btn"
            >
              <svg
                className="refresh-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path
                  fill="currentColor"
                  d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-alert">
          <svg
            className="error-icon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
          >
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && !attendanceData.length && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading attendance data...</p>
        </div>
      )}

      {/* Attendance Table */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-info">
            Showing {attendanceData.length} of {pagination.total} records
            {selectedStatus !== "all" && (
              <span className="status-filter-indicator">
                • Filtered by:{" "}
                {statusOptions.find((s) => s.value === selectedStatus)?.label} (
                {pagination.total} records)
              </span>
            )}
          </div>
        </div>
        <div className="table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("employeeId")}>
                  Employee ID <SortIndicator column="employeeId" />
                </th>
                <th onClick={() => handleSort("name")}>
                  Name <SortIndicator column="name" />
                </th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
                <th onClick={() => handleSort("attendanceDate")}>
                  Date <SortIndicator column="attendanceDate" />
                </th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Working Hours</th>
                <th onClick={() => handleSort("status")}>
                  Status <SortIndicator column="status" />
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data">
                    {loading
                      ? "Loading..."
                      : `No ${selectedStatus !== "all" ? statusOptions.find((s) => s.value === selectedStatus)?.label : ""} attendance records found for ${formatDate(selectedDate)}`}
                  </td>
                </tr>
              ) : (
                attendanceData.map((employee) => {
                  const latestAttendance = employee.attendance[0] || {};
                  const statusColor =
                    statusColors[latestAttendance.status] || "#6b7280";

                  return (
                    <tr key={employee.employeeId}>
                      <td>
                        <div className="employee-id">{employee.employeeId}</div>
                      </td>
                      <td>
                        <div className="employee-name">
                          <div className="avatar-placeholder">
                            {employee.user.fullName?.charAt(0) || "U"}
                          </div>
                          {employee.user.fullName || "N/A"}
                        </div>
                      </td>
                      <td>
                        <div className="employee-email">
                          {employee.user.email || "N/A"}
                        </div>
                      </td>
                      <td>
                        <span className="department-badge">
                          {employee.user.department || "N/A"}
                        </span>
                      </td>
                      <td>
                        <div className="employee-role">
                          {employee.user.role || "N/A"}
                        </div>
                      </td>
                      <td>
                        <div className="attendance-date">
                          {formatDate(latestAttendance.attendanceDate)}
                        </div>
                      </td>
                      <td>
                        <div className="time-in">
                          {formatTime(latestAttendance.clockInDate)}
                        </div>
                      </td>
                      <td>
                        <div className="time-out">
                          {formatTime(latestAttendance.clockOutDate)}
                        </div>
                      </td>
                      <td>
                        <div className="working-hours">
                          {getWorkingHours(latestAttendance.workingHours)}
                          {latestAttendance.workingHours > 8 && (
                            <span className="overtime-indicator"> OT</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: statusColor }}
                        >
                          {latestAttendance.status || "Not Marked"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {attendanceData.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
            className="pagination-btn"
          >
            Previous
          </button>

          <div className="page-info">
            Page {pagination.page} of {pagination.pages}
            <span className="total-info">
              {" "}
              ({pagination.total} total records)
            </span>
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages || loading}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Loading indicator for existing data */}
      {loading && attendanceData.length > 0 && (
        <div className="loading-indicator">
          <div className="small-spinner"></div>
          Updating...
        </div>
      )}

      <style jsx>{`
        .attendance-container {
         
          background: #f9fafb;
          min-height: 100vh;
        }

        .header {
          margin-bottom: 24px;
        }

        .header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .subtitle {
          color: #6b7280;
          margin: 8px 0 0;
          font-size: 14px;
        }

        .filters-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .filter-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .search-input {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-field {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .search-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .select-wrapper {
          position: relative;
        }

        .filter-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .department-select,
        .date-input {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .status-tabs-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .status-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .status-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e5e7eb;
        }

        .status-tab:hover:not(.active):not(:disabled) {
          background: #f9fafb;
        }

        .status-tab.active {
          color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .status-tab:disabled {
          cursor: not-allowed;
        }

        .status-label {
          white-space: nowrap;
        }

        .status-count {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          min-width: 24px;
          text-align: center;
        }

        .summary-info {
          display: flex;
          gap: 24px;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
          font-size: 14px;
          flex-wrap: wrap;
        }

        .summary-item {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .summary-item span {
          color: #64748b;
        }

        .summary-item strong {
          font-size: 16px;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          margin-bottom: 24px;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .table-header {
          padding: 16px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-info {
          font-size: 14px;
          color: #6b7280;
        }

        .status-filter-indicator {
          margin-left: 12px;
          color: #3b82f6;
          font-weight: 500;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .attendance-table {
          width: 100%;
          border-collapse: collapse;
        }

        .attendance-table th {
          padding: 16px 24px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
        }

        .attendance-table th:hover {
          background: #f3f4f6;
        }

        .sort-indicator {
          margin-left: 4px;
        }

        .attendance-table td {
          padding: 16px 24px;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        .attendance-table tr:hover {
          background: #f9fafb;
        }

        .employee-name {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .department-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #e0f2fe;
          color: #0369a1;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .overtime-indicator {
          color: #f59e0b;
          font-weight: 600;
          margin-left: 4px;
        }

        .no-data {
          text-align: center;
          padding: 48px;
          color: #6b7280;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          color: #6b7280;
          margin: 16px 0;
        }

        .small-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 20px;
        }

        .pagination-btn {
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 14px;
          color: #374151;
        }

        .total-info {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default AttendanceAllEmployee;
