"use client";
import React, { useEffect, useState } from "react";
import { 
  Search, ChevronLeft, ChevronRight, Loader2, CheckSquare, 
  Square, Loader, Calendar, Percent, Trash2, Users, Eye, Edit
} from "lucide-react";
import { usePayroll } from "@/app/hook/usePayroll";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const LOCAL_STORAGE_KEY = "payroll_auto_buffer";

const ProcessPayroll = () => {
  const {
    employees,
    empLoading,
    empPagination,
    loadEmployeePayroll,
    searchTerm,
    setSearchTerm,
    handleBulkProcessPayroll,
    processedLoading
  } = usePayroll();

  // --- 1. Global Settings ---
  const [globalSettings, setGlobalSettings] = useState({
    payrollPeriod: "2026-03",
    overtimeRate: 150,
    includeFestivalBonus: true,
    festivalBonusPercentage: 100,
    applyEpfDeductions: true,
    applyTaxDeductions: true
  });

  // --- 2. Selection & Individual Data States ---
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferPage, setBufferPage] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSelectedEmployees(parsed);
      } catch (e) {
        console.error("Storage error:", e);
      }
    }
    loadEmployeePayroll({ page: 1, limit: 10 });
  }, [loadEmployeePayroll]);

  const updateStorage = (data) => {
    setSelectedEmployees(data);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  // --- 3. Handlers ---
  const handleClearSelection = () => {
    if (window.confirm("Are you sure you want to clear all selected employees?")) {
      updateStorage([]);
    }
  };

  const startAutoSelectAll = async () => {
    if (selectedEmployees.length > 0) {
      handleClearSelection();
      return;
    }

    setIsBuffering(true);
    const totalPages = empPagination.totalPages;
    let masterBuffer = [];

    try {
      for (let p = 1; p <= totalPages; p++) {
        setBufferPage(p);
        const result = await loadEmployeePayroll({ page: p, limit: 10 });
        const pageData = result?.data || [];
        
        if (pageData.length > 0) {
          const newBatch = pageData.map(emp => ({
            ...emp,
            overtimeHours: 0,
            advanceDeduction: 0,
            otherDeductions: 0
          }));
          const newIds = new Set(newBatch.map(emp => emp._id));
          masterBuffer = [
            ...masterBuffer.filter(emp => !newIds.has(emp._id)), 
            ...newBatch
          ];
          updateStorage([...masterBuffer]);
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error("Selection process interrupted:", error);
    } finally {
      setIsBuffering(false);
      setBufferPage(0);
    }
  };

  const toggleSingleSelect = (emp) => {
    const isAlreadySelected = selectedEmployees.some(s => s._id === emp._id);
    let updated;
    if (isAlreadySelected) {
      updated = selectedEmployees.filter(i => i._id !== emp._id);
    } else {
      updated = [...selectedEmployees, { 
        ...emp, 
        overtimeHours: 0, 
        advanceDeduction: 0, 
        otherDeductions: 0 
      }];
    }
    updateStorage(updated);
  };

  const updateIndividualValue = (empId, field, value) => {
    const updated = selectedEmployees.map(emp => 
      emp._id === empId ? { ...emp, [field]: Number(value) } : emp
    );
    updateStorage(updated);
  };

  const handleProcessPayroll = async () => {
    if (selectedEmployees.length === 0) return;
    const finalPayrollData = selectedEmployees.map(({ _id, ...rest }) => ({
      ...rest,
      employeeRefId: _id,
      config: { ...globalSettings },
      status: "Processed",
      processedTimestamp: new Date().toISOString()
    }));

    try {
      const result = await handleBulkProcessPayroll(finalPayrollData);
      if (result.success) {
        window.alert(`Success! ${selectedEmployees.length} records processed.`);
        updateStorage([]);
      }
    } catch (err) {
      window.alert("Critical server error.");
    }
  };

  const formatCurrency = (amount) => {
    return `BDT ${Number(amount).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Global Form Settings */}
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Payroll Period
            </label>
            <input type="month" value={globalSettings.payrollPeriod} onChange={e => setGlobalSettings({...globalSettings, payrollPeriod: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded text-sm font-bold outline-none transition-all focus:border-blue-500/20" />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Percent className="w-3 h-3" /> Overtime Rate (%)
            </label>
            <input type="number" value={globalSettings.overtimeRate} onChange={e => setGlobalSettings({...globalSettings, overtimeRate: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded text-sm font-bold outline-none" />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded border border-slate-100">
             <span className="text-sm font-bold text-slate-700">Include Festival Bonus</span>
             <Switch checked={globalSettings.includeFestivalBonus} onCheckedChange={val => setGlobalSettings({...globalSettings, includeFestivalBonus: val})} />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-50">
           <div className="flex items-center gap-3">
              <Switch checked={globalSettings.applyEpfDeductions} onCheckedChange={val => setGlobalSettings({...globalSettings, applyEpfDeductions: val})} />
              <span className="text-sm font-bold text-slate-600">Apply EPF</span>
           </div>
           <div className="flex items-center gap-3">
              <Switch checked={globalSettings.applyTaxDeductions} onCheckedChange={val => setGlobalSettings({...globalSettings, applyTaxDeductions: val})} />
              <span className="text-sm font-bold text-slate-600">Apply Tax</span>
           </div>
        </div>
      </div>

      {/* 2. Global Actions Bar */}
      <div className="flex flex-col md:flex-row lg:flex-row justify-between items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm sticky top-2 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4 flex-1 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search employees..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded text-sm font-medium outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {selectedEmployees.length > 0 && (
            <Button onClick={handleClearSelection} variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded font-bold flex gap-2">
              <Trash2 className="w-4 h-4" /> Clear ({selectedEmployees.length})
            </Button>
          )}
        </div>
        <Button onClick={handleProcessPayroll} disabled={selectedEmployees.length === 0 || isBuffering || processedLoading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded px-10 py-7 font-black shadow-xl shadow-blue-100 active:scale-95 transition-all">
          {processedLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : `Process Payroll Now`}
        </Button>
      </div>

      {/* 3. The New Table Structure */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-4">
                <button onClick={startAutoSelectAll} className="outline-none">
                    {selectedEmployees.length > 0 ? <CheckSquare className="w-7 h-7 text-blue-600" /> : <Square className="w-7 h-7 text-slate-200" />}
                </button>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select All Employees</span>
            </div>
            {isBuffering && <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase"><Loader className="w-3 h-3 animate-spin"/> Scanning Page {bufferPage}...</div>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Basic Salary</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Gross Salary</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {empLoading && !isBuffering ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-500 w-10 h-10" />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">No employees found</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const selectedData = selectedEmployees.find(s => s._id === emp._id);
                  const isSelected = !!selectedData;

                  return (
                    <React.Fragment key={emp._id}>
                      <tr className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/20' : ''}`}>
                        <td className="px-6 py-4">
                          <button onClick={() => toggleSingleSelect(emp)} className="outline-none transition-transform active:scale-90">
                            {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-200" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs uppercase">
                                {emp.fullName ? emp.fullName.split(' ').map(n => n[0]).join('') : '?'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-black text-gray-900">{emp.fullName}</div>
                              <div className="text-[10px] font-bold text-gray-500 uppercase">{emp.designation}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {emp.department || 'General'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-black text-[10px]">
                            Grade {emp.matchedPayroll?.grade || 'N/A'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                          {formatCurrency(emp.basicSalary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-gray-900">
                          {formatCurrency(emp.grossSalary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge 
                            className={`font-black text-[10px] border-none ${
                              emp.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {emp.status || 'active'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleSingleSelect(emp)}
                              className={isSelected ? "text-blue-600" : "text-gray-400"}
                            >
                              {isSelected ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Sub-row for individual adjustments if selected */}
                      {isSelected && (
                        <tr className="bg-blue-50/10">
                          <td colSpan={8} className="px-10 py-6">
                            <div className="bg-white border border-blue-100 rounded p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm animate-in slide-in-from-top-2">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Overtime Hours</label>
                                <input type="number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-lg p-3 text-sm font-bold outline-none" value={selectedData.overtimeHours} onChange={(e) => updateIndividualValue(emp._id, 'overtimeHours', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Advance Deduction</label>
                                <input type="number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-lg p-3 text-sm font-bold outline-none" value={selectedData.advanceDeduction} onChange={(e) => updateIndividualValue(emp._id, 'advanceDeduction', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Other Deductions</label>
                                <input type="number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-lg p-3 text-sm font-bold outline-none" value={selectedData.otherDeductions} onChange={(e) => updateIndividualValue(emp._id, 'otherDeductions', e.target.value)} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 border-t flex justify-between items-center bg-slate-50/30">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Page {empPagination.currentPage} of {empPagination.totalPages}</span>
            <div className="flex gap-3">
                <button disabled={empPagination.currentPage === 1 || isBuffering} onClick={() => loadEmployeePayroll({ page: empPagination.currentPage - 1, limit: 10 })} className="p-3 border-2 border-slate-100 rounded bg-white shadow-sm disabled:opacity-20 hover:bg-slate-50 active:scale-95 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                <button disabled={empPagination.currentPage === empPagination.totalPages || isBuffering} onClick={() => loadEmployeePayroll({ page: empPagination.currentPage + 1, limit: 10 })} className="p-3 border-2 border-slate-100 rounded bg-white shadow-sm disabled:opacity-20 hover:bg-slate-50 active:scale-95 transition-all"><ChevronRight className="w-5 h-5" /></button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessPayroll;