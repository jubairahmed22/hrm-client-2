"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  LogIn,
  LogOut,
  Coffee,
  PlayCircle,
  Calendar,
  DollarSign,
  Target,
  Award,
  Activity,
  CheckCircle,
  Bell,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

import ApplyLeaveDialog from "./ApplyLeaveDialog";
import { useDashboardStats } from "@/app/hook/useDashboardState";

const Today = () => {
  // ── Auth + employee context ──────────────────────────────────────────────
  const { UserAllDetails } = useAuth();
  const employeeId = UserAllDetails?.employeeId;
  const userEmail = UserAllDetails?.email;
  const API = "http://localhost:50001";

  // ── Live dashboard stats ──────────────────────────────────────────────────
  const {
    userStats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useDashboardStats(userEmail);

  // ── Real attendance state ─────────────────────────────────────────────────
  const [employeeAttendance, setEmployeeAttendance] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ── Leave dialog state ───────────────────────────────────────────────────
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  // ── Mock data — for cards whose APIs aren't ready yet ────────────────────
  const personalData = {
    employee: {
      salary: { net_salary: 65000 },
      performance: {
        current_rating: 4.8,
        goals_completed: 7,
        goals_total: 10,
        next_review: "May 15, 2026",
      },
    },
  };

  // ── ✅ FIXED PATH: leaveTypesBreakdown lives directly on userStats ────────
  // Just like the working LeaveTypeCardsGrid example does it.
  const leaveBreakdown = userStats?.leaveTypesBreakdown || [];

  // Find the Annual Leave entry
  const annualLeave = leaveBreakdown.find(
    (l) => l?.name?.toLowerCase() === "annual leave"
  );

  const annualTotal = annualLeave?.totalAnnualDays ?? 0;
  const annualRemaining = annualLeave?.myRemaining ?? 0;
  const annualUsed = annualLeave?.myLeaveReq ?? 0;

  // 🔍 DEBUG — uncomment if values are still empty so you can see what arrived
  // useEffect(() => {
  //   console.log("userStats:", userStats);
  //   console.log("leaveBreakdown:", leaveBreakdown);
  //   console.log("annualLeave:", annualLeave);
  // }, [userStats]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  const formatCurrency = (amount) => `৳${amount.toLocaleString()}`;

  // ── Load today's attendance ──────────────────────────────────────────────
  const loadTodayAttendance = async () => {
    if (!employeeId) return;

    try {
      const res = await fetch(`${API}/attendance/today/${employeeId}`);
      const data = await res.json();

      if (data.success) {
        if (data.data && data.data.attendance) {
          setEmployeeAttendance(data.data);
          setTodayAttendance(data.data.attendance);
        } else if (data.data) {
          setEmployeeAttendance(data.data);
          const todayRecord = data.data.attendance?.find((record) =>
            isToday(record.attendanceDate)
          );
          setTodayAttendance(todayRecord || null);
        } else {
          setEmployeeAttendance(null);
          setTodayAttendance(null);
        }
      } else {
        setEmployeeAttendance(null);
        setTodayAttendance(null);
      }
    } catch (err) {
      console.error("Error loading attendance:", err);
      try {
        const res = await fetch(`${API}/attendance/${employeeId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setEmployeeAttendance(data.data);
          const todayRecord = data.data.attendance?.find((record) =>
            isToday(record.attendanceDate)
          );
          setTodayAttendance(todayRecord || null);
        }
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);
      }
    }
  };

  useEffect(() => {
    loadTodayAttendance();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, [employeeId]);

  // ── Clock In ──────────────────────────────────────────────────────────────
  const handleClockIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/attendance/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: UserAllDetails }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setEmployeeAttendance(data.data);
      const todayRecord = data.data.attendance?.find((record) =>
        isToday(record.attendanceDate)
      );
      setTodayAttendance(todayRecord);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Break ─────────────────────────────────────────────────────────────────
  const handleBreak = async (action) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/attendance/break`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, action }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setEmployeeAttendance(data.data);
      const todayRecord = data.data.attendance?.find(
        (record) => isToday(record.attendanceDate) && !record.clockOutDate
      );
      setTodayAttendance(todayRecord);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Clock Out ─────────────────────────────────────────────────────────────
  const handleClockOut = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/attendance/clockout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setEmployeeAttendance(data.data);
      const todayRecord = data.data.attendance?.find((record) =>
        isToday(record.attendanceDate)
      );
      setTodayAttendance(todayRecord);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Live working hours ────────────────────────────────────────────────────
  const calculateCurrentWorkingHours = () => {
    if (!todayAttendance || todayAttendance.clockOutDate)
      return todayAttendance?.workingHours || 0;

    const now = currentTime;
    const clockIn = new Date(todayAttendance.clockInDate);
    let totalMinutes = (now - clockIn) / (1000 * 60);

    if (todayAttendance.breaks) {
      todayAttendance.breaks.forEach((b) => {
        if (b.startDate && b.endDate) {
          totalMinutes -=
            (new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60);
        } else if (b.startDate && !b.endDate) {
          totalMinutes -= (now - new Date(b.startDate)) / (1000 * 60);
        }
      });
    }
    return (totalMinutes / 60).toFixed(2);
  };

  // ── Status helpers ────────────────────────────────────────────────────────
  const breakRunning = todayAttendance?.breaks?.some(
    (b) => b.startDate && !b.endDate
  );

  const hasClockedInToday = todayAttendance && !todayAttendance.clockOutDate;

  const getAttendanceStatus = () => {
    if (!todayAttendance) return "out";
    if (breakRunning) return "break";
    if (todayAttendance.clockOutDate) return "completed";
    return "in";
  };

  const attendanceStatus = getAttendanceStatus();

  const liveWorkingHours = hasClockedInToday
    ? calculateCurrentWorkingHours()
    : todayAttendance?.workingHours || "0.00";

  const liveClockInTime = todayAttendance?.clockInDate
    ? formatDateTime(todayAttendance.clockInDate)
    : null;

  // ── Refresh stats after a leave is submitted ──────────────────────────────
  const handleLeaveDialogClose = () => {
    setIsLeaveDialogOpen(false);
    refreshStats();
  };

  return (
    <div className="space-y-6 p-1 w-full">

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Attendance Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-blue-900 mb-2">Attendance</h3>

            {liveClockInTime && (
              <p className="text-xs text-blue-700 mb-3">
                Since {liveClockInTime} • {liveWorkingHours}h
              </p>
            )}

            <div className="space-y-2">
              {attendanceStatus === "out" && (
                <Button
                  onClick={handleClockIn}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-2" />
                  )}
                  Clock In
                </Button>
              )}
              {attendanceStatus === "in" && (
                <>
                  <Button
                    onClick={handleClockOut}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4 mr-2" />
                    )}
                    Clock Out
                  </Button>
                  <Button
                    onClick={() => handleBreak("start")}
                    variant="outline"
                    disabled={loading || breakRunning}
                    className="w-full bg-white/50 border-blue-200"
                  >
                    <Coffee className="w-4 h-4 mr-2" />
                    Start Break
                  </Button>
                </>
              )}
              {attendanceStatus === "break" && (
                <Button
                  onClick={() => handleBreak("end")}
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <PlayCircle className="w-4 h-4 mr-2" />
                  )}
                  End Break
                </Button>
              )}
              {attendanceStatus === "completed" && (
                <div className="w-full p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Day Completed
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    {todayAttendance?.workingHours || "0.00"}h worked
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ✅ Annual Leave Card — LIVE DATA */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-green-900 mb-2">Annual Leave</h3>

            {statsLoading ? (
              <div className="flex justify-center items-center h-[60px]">
                <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-800 mb-1">
                  {annualRemaining}
                  {annualTotal > 0 && (
                    <span className="text-base text-green-600 font-medium">
                      {" "}/ {annualTotal}
                    </span>
                  )}
                </div>
                <p className="text-sm text-green-700">
                  {annualTotal > 0
                    ? `${annualRemaining} of ${annualTotal} days remaining`
                    : "Days remaining"}
                </p>
              </>
            )}

            <Button
              className="w-full mt-3 bg-green-600 hover:bg-green-700"
              onClick={() => setIsLeaveDialogOpen(true)}
            >
              Apply Leave
            </Button>
          </CardContent>
        </Card>

        {/* Net Salary Card — MOCK */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-purple-900 mb-2">Net Salary</h3>
            <div className="text-2xl font-bold text-purple-800 mb-1">
              {formatCurrency(personalData.employee.salary.net_salary)}
            </div>
            <p className="text-sm text-purple-700">Current month</p>
            <Button
              variant="outline"
              className="w-full mt-3 bg-white/50 border-purple-200"
              onClick={() => console.log("View Payslip")}
            >
              View Payslip
            </Button>
          </CardContent>
        </Card>

        {/* Performance Card — MOCK */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold text-orange-900 mb-2">Performance</h3>
            <div className="flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-yellow-500 mr-1" />
              <span className="text-2xl font-bold text-orange-800">
                {personalData.employee.performance.current_rating}/5.0
              </span>
            </div>
            <p className="text-sm text-orange-700">Current rating</p>
            <Button
              variant="outline"
              className="w-full mt-3 bg-white/50 border-orange-200"
              onClick={() => console.log("View Goals")}
            >
              View Goals
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-700" />
              Today's Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">

              {/* REAL attendance row */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {attendanceStatus === "in" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : attendanceStatus === "break" ? (
                    <Coffee className="w-5 h-5 text-orange-600" />
                  ) : attendanceStatus === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium text-slate-900">
                      {attendanceStatus === "in"
                        ? "Working"
                        : attendanceStatus === "break"
                        ? "On Break"
                        : attendanceStatus === "completed"
                        ? "Completed"
                        : "Not Clocked In"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {liveClockInTime || "No clock-in time"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">
                    {liveWorkingHours}h
                  </div>
                  <div className="text-sm text-gray-500">Today</div>
                </div>
              </div>

              {/* ✅ LIVE Annual Leave row */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">Annual Leave</div>
                    <div className="text-sm text-blue-700">
                      {annualUsed} day{annualUsed !== 1 ? "s" : ""} used this year
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    {statsLoading
                      ? "..."
                      : annualTotal > 0
                      ? `${annualRemaining}/${annualTotal}`
                      : annualRemaining}
                  </div>
                  <div className="text-sm text-blue-500">Remaining</div>
                </div>
              </div>

              {/* MOCK goals row */}
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-purple-900">Goals Progress</div>
                    <div className="text-sm text-purple-700">This quarter</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-purple-600">
                    {personalData.employee.performance.goals_completed}/
                    {personalData.employee.performance.goals_total}
                  </div>
                  <div className="text-sm text-purple-500">Completed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Updates — MOCK */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-700" />
              Quick Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Salary Processed</h4>
                    <p className="text-sm text-green-700">
                      December salary has been processed and credited
                    </p>
                    <p className="text-xs text-green-600 mt-1 uppercase font-semibold tracking-wider text-[10px]">
                      2 hours ago
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Leave Approved</h4>
                    <p className="text-sm text-blue-700">
                      Your vacation leave for Jan 10-12 has been approved
                    </p>
                    <p className="text-xs text-blue-600 mt-1 uppercase font-semibold tracking-wider text-[10px]">
                      1 day ago
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">Performance Review</h4>
                    <p className="text-sm text-purple-700">
                      Q4 review scheduled for {personalData.employee.performance.next_review}
                    </p>
                    <p className="text-xs text-purple-600 mt-1 uppercase font-semibold tracking-wider text-[10px]">
                      3 days ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Apply Leave Dialog */}
      <ApplyLeaveDialog
        isOpen={isLeaveDialogOpen}
        onClose={handleLeaveDialogClose}
      />
    </div>
  );
};

export default Today;