import React, { useEffect, useState } from "react";
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
  Mail
} from 'lucide-react';

const AttendanceToday = ({ UserAllDetails }) => {
  const [employeeAttendance, setEmployeeAttendance] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const employeeId = UserAllDetails?.employeeId;
  const API = "http://localhost:50001";

  // Format date and time functions
  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  // Load today's attendance
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
          const todayRecord = data.data.attendance?.find(
            (record) => isToday(record.attendanceDate)
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
          const todayRecord = data.data.attendance?.find(
            (record) => isToday(record.attendanceDate)
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
    
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [employeeId]);

  // Clock In Handler
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
      const todayRecord = data.data.attendance?.find(
        (record) => isToday(record.attendanceDate)
      );
      setTodayAttendance(todayRecord);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Break Handler
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

  // Clock Out Handler
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
      const todayRecord = data.data.attendance?.find(
        (record) => isToday(record.attendanceDate)
      );
      setTodayAttendance(todayRecord);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate current working hours
  const calculateCurrentWorkingHours = () => {
    if (!todayAttendance || todayAttendance.clockOutDate) return todayAttendance?.workingHours || 0;
    
    const now = currentTime;
    const clockIn = new Date(todayAttendance.clockInDate);
    let totalMinutes = (now - clockIn) / (1000 * 60);

    if (todayAttendance.breaks) {
      todayAttendance.breaks.forEach((b) => {
        if (b.startDate && b.endDate) {
          totalMinutes -= (new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60);
        } else if (b.startDate && !b.endDate) {
          totalMinutes -= (now - new Date(b.startDate)) / (1000 * 60);
        }
      });
    }

    return (totalMinutes / 60).toFixed(2);
  };

  // Check if break is running
  const breakRunning = todayAttendance?.breaks?.some(
    (breakItem) => breakItem.startDate && !breakItem.endDate
  );

  // Check if clocked in today
  const hasClockedInToday = todayAttendance && !todayAttendance.clockOutDate;

  // Determine attendance status for UI
  const getAttendanceStatus = () => {
    if (!todayAttendance) return 'out';
    if (breakRunning) return 'break';
    if (todayAttendance.clockOutDate) return 'completed';
    return 'in';
  };

  const attendanceStatus = getAttendanceStatus();

  return (
<div className="w-full">
  {/* Error Message */}
  {error && (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-sm">
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{error}</span>
    </div>
  )}

  {/* Header */}
  
  <div className="flex md:flex-col lg:flex-row justify-between items-start md:items-center mb-8">
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Today's Attendance</h2>
      <p className="text-gray-600 mt-2 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        {formatDate(currentTime)}
      </p>
    </div>
    <div className="mt-4 md:mt-0">
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 rounded-xl border border-blue-100 shadow-sm">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-blue-600 font-medium">CURRENT TIME</p>
          <p className="text-xl font-bold text-gray-900">
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  </div>

  <div className="flex flex-col lg:flex-row gap-6 w-full">
    {/* Main Attendance Card */}
    <div className="lg:w-2/3">
      <Card className="bg-gradient-to-br from-blue-50 via-white to-blue-50 border-blue-200  transition-all duration-300  h-full">
        <CardContent className="p-6 md:p-8 text-center">
          <div className="flex flex-col md:flex-row lg:flex-row items-center justify-between mb-6">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="w-10 h-10 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-blue-900">Attendance Status</h3>
                <p className="text-gray-600 text-sm">Track your work hours and breaks</p>
              </div>
            </div>
            
            {/* Status Badge - Enhanced */}
            <div className="flex justify-center">
              {attendanceStatus === 'out' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 shadow-sm">
                  <div className="p-1.5 bg-yellow-100 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span className="font-semibold text-yellow-800">Not Clocked In</span>
                </div>
              )}
              {attendanceStatus === 'in' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm">
                  <div className="p-1.5 bg-green-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-semibold text-green-800">Clocked In</span>
                </div>
              )}
              {attendanceStatus === 'break' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 shadow-sm">
                  <div className="p-1.5 bg-orange-100 rounded-full">
                    <Coffee className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-semibold text-orange-800">On Break</span>
                </div>
              )}
              {attendanceStatus === 'completed' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 shadow-sm">
                  <div className="p-1.5 bg-blue-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-blue-800">Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Details - Enhanced Grid */}
          {todayAttendance && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-6 bg-white/80 rounded-2xl border border-blue-100 shadow-sm">
              <div className="text-center p-4 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-colors">
                <p className="text-xs font-medium text-blue-600 mb-1">CLOCK IN</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDateTime(todayAttendance.clockInDate)}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-colors">
                <p className="text-xs font-medium text-blue-600 mb-1">CLOCK OUT</p>
                <p className="text-lg font-bold text-gray-900">
                  {todayAttendance.clockOutDate ? formatDateTime(todayAttendance.clockOutDate) : "—"}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-colors">
                <p className="text-xs font-medium text-blue-600 mb-1">WORKING HOURS</p>
                <p className="text-lg font-bold text-gray-900">
                  {hasClockedInToday ? calculateCurrentWorkingHours() : todayAttendance.workingHours || "0.00"}
                  <span className="text-sm text-gray-600 ml-1">hrs</span>
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-colors">
                <p className="text-xs font-medium text-blue-600 mb-1">BREAKS TAKEN</p>
                <p className="text-lg font-bold text-gray-900">
                  {todayAttendance.breaks?.length || 0}
                  <span className="text-sm text-gray-600 ml-1">today</span>
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons - Enhanced */}
          <div className="space-y-3 max-w-md mx-auto">
            {attendanceStatus === 'out' && (
              <Button 
                onClick={handleClockIn} 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white   transform hover:-translate-y-0.5 transition-all duration-200 py-6 text-lg font-semibold rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Processing Clock In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-3" />
                    Clock In Now
                  </>
                )}
              </Button>
            )}
            
            {attendanceStatus === 'in' && (
              <div className="space-y-3">
                <Button 
                  onClick={handleClockOut} 
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white   transform hover:-translate-y-0.5 transition-all duration-200 py-6 text-lg font-semibold rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Processing Clock Out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-5 h-5 mr-3" />
                      Clock Out
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => handleBreak("start")} 
                  variant="outline" 
                  className="w-full border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800 shadow-sm hover:shadow-md py-5 text-base font-medium rounded-xl group"
                  disabled={loading || breakRunning}
                >
                  <div className="flex items-center justify-center">
                    <Coffee className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                    Take a Break
                  </div>
                </Button>
              </div>
            )}
            
            {attendanceStatus === 'break' && (
              <Button 
                onClick={() => handleBreak("end")} 
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white   transform hover:-translate-y-0.5 transition-all duration-200 py-6 text-lg font-semibold rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Ending Break...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5 mr-3" />
                    End Break & Resume Work
                  </>
                )}
              </Button>
            )}
            
            {attendanceStatus === 'completed' && (
              <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm">
                <div className="inline-flex p-4 bg-green-100 rounded-2xl mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-green-800 mb-2">Attendance Completed</h4>
                <p className="text-green-700 mb-4">Great work today! Your attendance has been recorded.</p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-green-200">
                  <span className="text-green-600 font-medium">Total Hours:</span>
                  <span className="text-2xl font-bold text-gray-900">{todayAttendance.workingHours || "0.00"}</span>
                  <span className="text-green-600 font-medium">hrs</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Right Sidebar - Breaks & User Info */}
    <div className="lg:w-1/3 space-y-6">
      {/* Breaks List */}
      {todayAttendance?.breaks?.length > 0 && (
        <Card className="border-gray-200   transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Coffee className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Today's Breaks</h4>
                  <p className="text-sm text-gray-600">Break history and duration</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {todayAttendance.breaks?.length || 0}
              </span>
            </div>
            
            <div className="space-y-3">
              {todayAttendance.breaks.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 transition-colors duration-200 group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${b.endDate ? 'bg-green-100' : 'bg-orange-100'}`}>
                      {b.endDate ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="animate-pulse">
                          <Coffee className="w-4 h-4 text-orange-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block">Break {i + 1}</span>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{formatDateTime(b.startDate)}</span>
                        <span className="text-gray-400">→</span>
                        <span>{b.endDate ? formatDateTime(b.endDate) : "Now"}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
                    b.endDate 
                      ? 'bg-green-100/50 text-green-700 border border-green-200' 
                      : 'bg-orange-100/50 text-orange-700 border border-orange-200 animate-pulse'
                  }`}>
                    {b.endDate ? 'Completed' : 'Active'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Info */}
      <Card className="border-gray-200   transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Employee Profile</h4>
              <p className="text-sm text-gray-600">Your information and role</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-600">NAME</p>
                <p className="font-semibold text-gray-900">{UserAllDetails?.fullName || "—"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <p className="text-xs font-medium text-gray-500 mb-1">EMPLOYEE ID</p>
                <p className="font-semibold text-gray-900">{employeeId || "—"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <p className="text-xs font-medium text-gray-500 mb-1">ROLE</p>
                <p className="font-semibold text-gray-900">{UserAllDetails?.role || "—"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors col-span-2">
                <p className="text-xs font-medium text-gray-500 mb-1">DEPARTMENT</p>
                <p className="font-semibold text-gray-900">{UserAllDetails?.department || "—"}</p>
              </div>
            </div>
            
            {UserAllDetails?.email && (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">EMAIL</p>
                  <p className="font-medium text-gray-900 truncate">{UserAllDetails.email}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
  );
};

export default AttendanceToday;