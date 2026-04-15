"use client";
import React, { useEffect, useState, useCallback } from "react";
import { 
  Search, ChevronLeft, ChevronRight, Loader2, Trash2, 
  History, CreditCard, Eye, Mail
} from "lucide-react";
import { usePayroll } from "@/app/hook/usePayroll";
import { Badge } from "@/components/ui/badge";

const PayrollRecord = () => {
  const {
    processedRecords,
    processedLoading,
    processedPagination,
    loadProcessedRecords,
    handleDeletePayrollRecord,
    handleUpdatePayrollStatus,
  } = usePayroll();

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // 1. Fetch data when filters or page change
  const fetchFilteredData = useCallback((page = 1) => {
    loadProcessedRecords({
      page,
      limit: 10,
      email: searchTerm,
      status: statusFilter,
      date: dateFilter
    });
  }, [searchTerm, statusFilter, dateFilter, loadProcessedRecords]);

  // 2. Initial Load & Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFilteredData(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, dateFilter, fetchFilteredData]);

  const formatCurrency = (amount) => {
    return `BDT ${Number(amount).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
  };

  const formatPeriod = (period) => {
    if (!period) return "N/A";
    const [year, month] = period.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6 bg-white p-5 rounded-xl">
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl flex flex-col md:flex-row lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-800">Payroll History</h2>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50  rounded-lg text-sm outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50  rounded-lg text-sm outline-none"
          >
            <option value="">All Status</option>
            <option value="Processed">Processed</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Main Content: Card List */}
      <div className="space-y-4">
        {processedLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-500 w-8 h-8" />
          </div>
        ) : processedRecords.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed rounded-xl text-slate-400 font-medium">
            No records found.
          </div>
        ) : (
          processedRecords.map((record) => (
            <div key={record._id} className="p-4 bg-white  rounded-lg shadow-sm border border-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{record.fullName}</h3>
                  <p className="text-sm text-gray-600">
                    {formatPeriod(record.config?.payrollPeriod)} • {record.department || "General"}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  {/* Status Dropdown (Functional) */}
                  <select 
                    value={record.status || "Processed"}
                    onChange={(e) => handleUpdatePayrollStatus(record._id, e.target.value)}
                    className="text-xs font-bold border-none bg-transparent cursor-pointer focus:ring-0 outline-none text-slate-500"
                  >
                    <option value="Processed">Processed</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                  </select>

                  <div className="text-right min-w-[120px]">
                    <p className="font-semibold text-slate-900">{formatCurrency(record.grossSalary)}</p>
                    <p className="text-sm text-gray-600">Net Salary</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={record.status === 'Paid' ? 'default' : 'secondary'}
                      className={record.status === 'Paid' ? 'bg-emerald-500' : ''}
                    >
                      {record.status || 'Processed'}
                    </Badge>
                    
                    <button 
                      onClick={() => handleDeletePayrollRecord(record._id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Page {processedPagination.currentPage} of {processedPagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button
            disabled={processedPagination.currentPage === 1 || processedLoading}
            onClick={() => fetchFilteredData(processedPagination.currentPage - 1)}
            className="p-2 border rounded-lg bg-white disabled:opacity-30 hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            disabled={processedPagination.currentPage === processedPagination.totalPages || processedLoading}
            onClick={() => fetchFilteredData(processedPagination.currentPage + 1)}
            className="p-2 border rounded-lg bg-white disabled:opacity-30 hover:bg-slate-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollRecord;