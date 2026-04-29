"use client";
import React, { useState } from 'react';
import { useEmployees } from '@/app/hook/useEmployees';
import ReviewDialog from './ReviewDialog';
import { Search, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PerformanceAppraisals = () => {
    const {
        employees,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        totalPages,
        loading,
        completedTotal,
        loadEmployees
    } = useEmployees();
 
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState(null);
    
    // 1. Get logged-in user (Reviewer) details from AuthContext
    const { UserAllDetails } = useAuth();

    const handleOpenReview = (emp) => {
        // Data of the person being reviewed (Reviewee)
        const revieweeData = {
            id: emp._id,
            fullName: emp.fullName,
            email: emp.email,
            employeeId: emp.employeeId,
            designation: emp.designation,
            department: emp.department
        };

        // Data of the person logged in (Reviewer)
        const reviewerData = {
            fullName: UserAllDetails?.fullName,
            email: UserAllDetails?.email,
            employeeId: UserAllDetails?.employeeId,
            designation: UserAllDetails?.designation
        };

        console.log("--- Performance Appraisal Setup ---");
        console.log("Who is posting (Reviewer):", reviewerData);
        console.log("Who is being rated (Reviewee):", revieweeData);

        setSelectedEmp(emp);
        setIsReviewOpen(true);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Appraisals</h1>
                        <p className="text-slate-500 mt-1">Review and track employee growth metrics</p>
                    </div>
                    
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                             <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase">Completed Reviews</p>
                            <p className="text-xl font-bold text-slate-900">{completedTotal}</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, email or ID..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Employee Profile</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Department</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Designation</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Gross Salary</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-slate-500">Loading...</td>
                                    </tr>
                                ) : (
                                    employees.map((emp) => (
                                        <tr key={emp._id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                        {emp.fullName?.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-900">{emp.fullName}</span>
                                                        <span className="text-xs text-slate-500">ID: {emp.employeeId}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{emp.department}</td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                {emp.designation?.replace(/_/g, " ")}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">${emp.grossSalary}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                                                    emp.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleOpenReview(emp)}
                                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-transform active:scale-95"
                                                >
                                                    Rate Performance
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Review Dialog Component */}
            {selectedEmp && (
                <ReviewDialog
                    open={isReviewOpen}
                    onClose={() => setIsReviewOpen(false)}
                    selectedEmployee={selectedEmp}      // Reviewee
                    reviewerData={UserAllDetails}       // Reviewer
                    refreshEmployees={loadEmployees}
                />
            )}
        </div>
    );
};

export default PerformanceAppraisals;