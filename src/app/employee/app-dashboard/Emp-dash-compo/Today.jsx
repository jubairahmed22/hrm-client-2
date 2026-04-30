"use client";

import React, { useState } from 'react';
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
  Bell 
} from 'lucide-react';

// Assuming you are using Shadcn UI components. 
// If not, these can be replaced with standard div/button tags.
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Today = () => {
    // --- MOCK DATA & STATE ---
    const [attendanceStatus, setAttendanceStatus] = useState('in'); // 'in', 'out', or 'break'
    
    const personalData = {
        employee: {
            attendance: {
                clock_in_time: "09:30 AM",
                total_hours: "5.5"
            },
            leave: {
                annual_balance: 14,
                pending_requests: 2
            },
            salary: {
                net_salary: 65000
            },
            performance: {
                current_rating: 4.8,
                goals_completed: 7,
                goals_total: 10,
                next_review: "May 15, 2026"
            }
        }
    };

    // --- HANDLERS ---
    const handleClockIn = () => setAttendanceStatus('in');
    const handleClockOut = () => setAttendanceStatus('out');
    const handleStartBreak = () => setAttendanceStatus('break');
    const handleEndBreak = () => setAttendanceStatus('in');
    const formatCurrency = (amount) => `৳${amount.toLocaleString()}`;

    return (
        <div className="space-y-6 p-1 w-full">
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Attendance Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                        <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="font-semibold text-blue-900 mb-2">Attendance</h3>
                        <div className="space-y-2">
                            {attendanceStatus === 'out' && (
                                <Button onClick={handleClockIn} className="w-full bg-green-600 hover:bg-green-700">
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Clock In
                                </Button>
                            )}
                            {attendanceStatus === 'in' && (
                                <>
                                    <Button onClick={handleClockOut} className="w-full bg-red-600 hover:bg-red-700">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Clock Out
                                    </Button>
                                    <Button onClick={handleStartBreak} variant="outline" className="w-full bg-white/50 border-blue-200">
                                        <Coffee className="w-4 h-4 mr-2" />
                                        Start Break
                                    </Button>
                                </>
                            )}
                            {attendanceStatus === 'break' && (
                                <Button onClick={handleEndBreak} className="w-full bg-orange-600 hover:bg-orange-700">
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    End Break
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Leave Balance Card */}
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                        <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="font-semibold text-green-900 mb-2">Leave Balance</h3>
                        <div className="text-2xl font-bold text-green-800 mb-1">
                            {personalData.employee.leave.annual_balance}
                        </div>
                        <p className="text-sm text-green-700">Annual days left</p>
                        <Button 
                            className="w-full mt-3 bg-green-600 hover:bg-green-700"
                            onClick={() => console.log('Apply Leave Clicked')}
                        >
                            Apply Leave
                        </Button>
                    </CardContent>
                </Card>

                {/* Net Salary Card */}
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
                            onClick={() => console.log('View Payslip')}
                        >
                            View Payslip
                        </Button>
                    </CardContent>
                </Card>

                {/* Performance Card */}
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
                            onClick={() => console.log('View Goals')}
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
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {attendanceStatus === 'in' ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : attendanceStatus === 'break' ? (
                                        <Coffee className="w-5 h-5 text-orange-600" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-gray-400" />
                                    )}
                                    <div>
                                        <div className="font-medium text-slate-900">
                                            {attendanceStatus === 'in' ? 'Working' : 
                                             attendanceStatus === 'break' ? 'On Break' : 'Not Clocked In'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {personalData.employee.attendance.clock_in_time || 'No clock-in time'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-slate-900">{personalData.employee.attendance.total_hours}h</div>
                                    <div className="text-sm text-gray-500">Today</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <div className="font-medium text-blue-900">Leave Requests</div>
                                        <div className="text-sm text-blue-700">Pending approval</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-blue-600">
                                        {personalData.employee.leave.pending_requests}
                                    </div>
                                    <div className="text-sm text-blue-500">Pending</div>
                                </div>
                            </div>

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

                {/* Quick Updates */}
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
                                        <p className="text-sm text-green-700">December salary has been processed and credited</p>
                                        <p className="text-xs text-green-600 mt-1 uppercase font-semibold tracking-wider text-[10px]">2 hours ago</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-blue-900">Leave Approved</h4>
                                        <p className="text-sm text-blue-700">Your vacation leave for Jan 10-12 has been approved</p>
                                        <p className="text-xs text-blue-600 mt-1 uppercase font-semibold tracking-wider text-[10px]">1 day ago</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Target className="w-5 h-5 text-purple-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-purple-900">Performance Review</h4>
                                        <p className="text-sm text-purple-700">Q4 review scheduled for {personalData.employee.performance.next_review}</p>
                                        <p className="text-xs text-purple-600 mt-1 uppercase font-semibold tracking-wider text-[10px]">3 days ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Today;