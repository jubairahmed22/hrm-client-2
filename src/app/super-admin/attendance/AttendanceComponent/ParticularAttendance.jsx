import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';

import { Clock, Calendar, Users, MapPin, CheckCircle, User, FilterIcon } from 'lucide-react';
// ---------------------------
// Small reusable components
// ---------------------------
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  extraClass = "", 
  isActive = false, 
  onClick 
}) => (
  <Card 
    className={`cursor-pointer transition-all hover:shadow-lg ${isActive ? 'ring-2 ring-blue-500' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-semibold ${extraClass}`}>{value}</p>
        </div>
        {Icon && <Icon className="w-8 h-8 text-red-600" />}
      </div>
    </CardContent>
  </Card>
);

const AttendanceRow = ({ record }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "On-time":
        return "bg-green-100 text-green-700";
      case "Late":
        return "bg-red-100 text-red-700";
      case "Absent":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4">{formatDate(record.attendanceDate)}</td>
      <td className="py-3 px-4">
        {new Date(record.attendanceDate).toLocaleDateString("en-US", {
          weekday: "short",
        })}
      </td>
      <td className="py-3 px-4">{formatTime(record.clockInDate)}</td>
      <td className="py-3 px-4">
        {record.clockOutDate ? formatTime(record.clockOutDate) : "N/A"}
      </td>
      <td className="py-3 px-4">
        {record.workingHours ? `${record.workingHours.toFixed(2)}h` : "N/A"}
      </td>
      <td className="py-3 px-4">
        {record.breaks?.length ? `${record.breaks.length} break(s)` : "No breaks"}
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
            record.status
          )}`}
        >
          {record.status}
        </span>
      </td>
    </tr>
  );
};

// ---------------------------
// Main Component
// ---------------------------
const ParticularAttendance = ({ employeeId }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [limit, setLimit] = useState(30);
  const [activeTab, setActiveTab] = useState("all");
  
  // Calculate absent days (working days without attendance record, excluding Sundays)
  // Calculate absent days (working days without attendance record, excluding Sundays)
  const calculateAbsentDays = (attendanceRecords, startDate, endDate) => {
    if (!attendanceRecords || !attendanceRecords.length) return [];
    
    const absentDays = [];
    const attendedDates = new Set(
      attendanceRecords.map(record => 
        new Date(record.attendanceDate).toDateString()
      )
    );
    
    // SOLVED: Changed from 'const' to 'let' to allow reassignment/swapping
    let currentDate = startDate ? new Date(startDate) : new Date(attendanceRecords[attendanceRecords.length - 1].attendanceDate);
    let endDateObj = endDate ? new Date(endDate) : new Date(attendanceRecords[0].attendanceDate);
    
    // Now this destructuring swap works because the variables are 'let'
    if (currentDate > endDateObj) {
      [currentDate, endDateObj] = [endDateObj, currentDate];
    }
    
    // Use a fresh instance for the loop to avoid side effects
    let loopDate = new Date(currentDate);

    while (loopDate <= endDateObj) {
      // Skip Sundays (day 0)
      if (loopDate.getDay() !== 0) {
        const dateStr = loopDate.toDateString();
        if (!attendedDates.has(dateStr)) {
          absentDays.push({
            attendanceDate: new Date(loopDate),
            status: "Absent",
            clockInDate: null,
            clockOutDate: null,
            workingHours: 0,
            day: loopDate.toLocaleDateString("en-US", { weekday: "long" })
          });
        }
      }
      // Increment the date
      loopDate.setDate(loopDate.getDate() + 1);
    }
    
    return absentDays;
  };

  // ---------------------------
  // Fetch Attendance Data
  // ---------------------------
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `https://code360.pro/attendance/${employeeId}?limit=${limit}`;
      if (dateRange.startDate && dateRange.endDate) {
        url += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        const data = response.data.data;
        setOriginalData(data);
        
        // Calculate absent days
        const startDate = dateRange.startDate || (data.attendance.length > 0 ? data.attendance[data.attendance.length - 1].attendanceDate : null);
        const endDate = dateRange.endDate || (data.attendance.length > 0 ? data.attendance[0].attendanceDate : null);
        
        const absentDays = calculateAbsentDays(data.attendance, startDate, endDate);
        
        // Combine attendance with absent days
        const allRecords = [...data.attendance, ...absentDays]
          .sort((a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate));
        
        setAttendanceData({
          ...data,
          attendance: allRecords
        });
      } else {
        setError(response.data.message || "Failed to fetch data");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) fetchAttendanceData();
  }, [employeeId]);

  // ---------------------------
  // Filters
  // ---------------------------
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = () => {
    if (dateRange.startDate && dateRange.endDate && new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      setError("Start date cannot be after end date");
      return;
    }
    fetchAttendanceData();
  };

  const handleClearFilter = () => {
    setDateRange({ startDate: "", endDate: "" });
    setLimit(30);
    setActiveTab("all");
    fetchAttendanceData();
  };

  // ---------------------------
  // Statistics & Filtered Data
  // ---------------------------
  const calculateStats = () => {
    if (!attendanceData?.attendance?.length) return null;
    
    const stats = { 
      totalRecords: 0, 
      onTimeCount: 0, 
      lateCount: 0, 
      absentCount: 0,
      totalWorkingHours: 0, 
      averageWorkingHours: 0,
      presentCount: 0
    };
    
    attendanceData.attendance.forEach((r) => {
      if (r.status === "On-time") {
        stats.onTimeCount++;
        stats.presentCount++;
        stats.totalWorkingHours += r.workingHours || 0;
      } else if (r.status === "Late") {
        stats.lateCount++;
        stats.presentCount++;
        stats.totalWorkingHours += r.workingHours || 0;
      } else if (r.status === "Absent") {
        stats.absentCount++;
      }
    });
    
    stats.totalRecords = attendanceData.attendance.length;
    stats.averageWorkingHours = stats.presentCount > 0 ? (stats.totalWorkingHours / stats.presentCount).toFixed(2) : 0;
    stats.totalWorkingHours = stats.totalWorkingHours.toFixed(2);
    
    return stats;
  };

  const stats = calculateStats();

  // Filter records based on active tab
  const getFilteredRecords = () => {
    if (!attendanceData?.attendance?.length) return [];
    
    switch(activeTab) {
      case "onTime":
        return attendanceData.attendance.filter(record => record.status === "On-time");
      case "late":
        return attendanceData.attendance.filter(record => record.status === "Late");
      case "absent":
        return attendanceData.attendance.filter(record => record.status === "Absent");
      default:
        return attendanceData.attendance;
    }
  };

  const filteredRecords = getFilteredRecords();

  // ---------------------------
  // Loading / Error / No Data
  // ---------------------------
  if (loading) return <p className="text-center text-gray-500">Loading attendance data...</p>;
  if (error) return (
    <div className="text-center text-red-600">
      <p>{error}</p>
      <button onClick={fetchAttendanceData} className="mt-2 px-4 py-1 bg-blue-500 text-white rounded">Retry</button>
    </div>
  );
  if (!attendanceData?.attendance?.length) return <p className="text-center text-gray-500">No attendance records found.</p>;

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col md:flex-row lg:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">My Attendance</h2>
           
          </div>
         
        </div>
      {/* Employee Info */}

      {/* Statistics Tabs */}
      {stats && (
       <div className="grid sm:grid-cols-1 grid-cols-5 gap-4">
  <StatCard 
    title="Total Records" 
    value={stats.totalRecords} 
    icon={Users}  // Using MapPin icon
    iconColor="text-blue-600"
    isActive={activeTab === "all"}
    onClick={() => setActiveTab("all")}
  />
  <StatCard 
    title="On Time" 
    value={stats.onTimeCount} 
    icon={CheckCircle}
    iconColor="text-green-600"
    isActive={activeTab === "onTime"}
    onClick={() => setActiveTab("onTime")}
  />
  <StatCard 
    title="Late Arrivals" 
    value={stats.lateCount} 
    icon={Clock}
    iconColor="text-red-600"
    isActive={activeTab === "late"}
    onClick={() => setActiveTab("late")}
  />
  <StatCard 
    title="Absent Days" 
    value={stats.absentCount} 
    icon={Calendar}
    iconColor="text-yellow-600"
    isActive={activeTab === "absent"}
    onClick={() => setActiveTab("absent")}
  />
  <StatCard 
    title="Avg Working Hours" 
    value={`${stats.averageWorkingHours} hrs`}
    icon={Clock}
    iconColor="text-purple-600"
  />
</div>
      )}

      {/* Filters */}
<div className="bg-white shadow-sm rounded-xl p-6 border border-blue-50">
  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
    <FilterIcon className="w-8 h-8 text-red-400"></FilterIcon> Filter Records
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">

    {/* Start Date */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        Start Date
      </label>
      <input
        type="date"
        name="startDate"
        value={dateRange.startDate}
        onChange={handleDateChange}
        className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>

    {/* End Date */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        End Date
      </label>
      <input
        type="date"
        name="endDate"
        value={dateRange.endDate}
        onChange={handleDateChange}
        className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>

    {/* Records Limit */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        Records Limit
      </label>
      <select
        value={limit}
        onChange={(e) => setLimit(parseInt(e.target.value))}
        className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value={10}>10</option>
        <option value={30}>30</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
        <option value={0}>All</option>
      </select>
    </div>

    {/* Buttons */}
    <div className="flex items-end gap-3">
      <button
        onClick={handleFilter}
        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
      >
        Apply
      </button>

      <button
        onClick={handleClearFilter}
        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm font-medium rounded-lg transition"
      >
        Clear
      </button>
    </div>

  </div>
</div>


      {/* Attendance Table */}
      {/* Attendance Table */}
<div className="bg-white shadow-md rounded-lg overflow-hidden">
  <div className="p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="w-8 h-8 text-red-400" />
        {activeTab === "all" && "All "}
        {activeTab === "onTime" && "On Time "}
        {activeTab === "late" && "Late "}
        {activeTab === "absent" && "Absent "}
        Attendance Records
      </h3>
      <div className="text-sm text-gray-500">
        Showing {filteredRecords.length} of {attendanceData.attendance.length} records
      </div>
    </div>
  </div>

  {filteredRecords.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      No {activeTab !== "all" ? activeTab : ""} records found for the selected filter
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-[97%] mx-auto">
        <thead>
          <tr className="border-b border-gray-100">
            {["Date", "Day", "Clock In", "Clock Out", "Working Hours", "Breaks", "Status"].map((th) => (
              <th key={th} className="text-left py-3 px-4 font-medium">
                {th}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((record, i) => (
            <AttendanceRow key={`${activeTab}-${i}`} record={record} />
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
    </div>
  );
};

export default ParticularAttendance;