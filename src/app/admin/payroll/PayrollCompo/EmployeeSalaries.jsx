"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  Users,
  Loader2,
  Edit3,
} from "lucide-react";
import { usePayroll } from "@/app/hook/usePayroll";
import EditEmployeeSalaryDialog from "./EditEmployeeSalaryDialog";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EmployeeSalaries = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const {
    employees,
    empLoading,
    empPagination,
    loadEmployeePayroll,
    searchTerm,
    setSearchTerm,
  } = usePayroll();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const currentPageFromUrl = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    loadEmployeePayroll({
      page: currentPageFromUrl,
      search: searchTerm,
    });
  }, [currentPageFromUrl, searchTerm, loadEmployeePayroll]);

  const formatCurrency = (amount) => {
    return `BDT ${Number(amount).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setIsEditOpen(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > empPagination.totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search salary structures..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="status-card">
        <CardHeader>
          <CardTitle>Employee Salaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {empLoading && employees.length === 0 ? (
              <div className="py-24 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-sm text-gray-500">Loading salaries...</p>
              </div>
            ) : employees.length > 0 ? (
              employees.map((emp) => (
                <div key={emp._id} className="p-4 border rounded-lg group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{emp.fullName}</h3>
                      <p className="text-sm text-gray-600">
                        {emp.designation || "Executive"} • {emp.department || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(emp.grossSalary)}</p>
                        <p className="text-sm text-gray-600">Grade {emp.matchedPayroll?.grade || "N/A"}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(emp)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center border-2 border-dashed rounded-lg">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No employee salaries found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {employees.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <span className="text-sm text-gray-500">
                Page {empPagination.currentPage} of {empPagination.totalPages || 1}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={empPagination.currentPage === 1 || empLoading}
                  onClick={() => handlePageChange(empPagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={empPagination.currentPage === empPagination.totalPages || empLoading}
                  onClick={() => handlePageChange(empPagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditEmployeeSalaryDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        employee={selectedEmployee}
        onSuccess={() =>
          loadEmployeePayroll({
            page: empPagination.currentPage,
            search: searchTerm,
          })
        }
      />
    </div>
  );
};

export default EmployeeSalaries;