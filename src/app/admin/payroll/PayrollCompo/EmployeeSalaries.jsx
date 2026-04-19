"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  Users,
  Loader2,
  Edit3,
  Eye,
  Edit,
} from "lucide-react";
import { usePayroll } from "@/app/hook/usePayroll";
import EditEmployeeSalaryDialog from "./EditEmployeeSalaryDialog";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Assuming toast is used for the view details

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
    return `BDT ${Number(amount || 0).toLocaleString("en-BD", {
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
          {/* Employee Salaries Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Basic Salary
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gross Salary
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {empLoading && employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-sm text-gray-500">Loading salaries...</p>
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium">No employee salaries found</p>
                        <p className="text-sm text-gray-500 mt-1">Start by assigning salary structures to employees</p>
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium uppercase">
                                {emp.fullName?.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{emp.fullName}</div>
                              <div className="text-sm text-gray-500">{emp.designation || "N/A"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{emp.department || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Grade {emp.matchedPayroll?.grade || "N/A"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(emp.basicSalary || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(emp.grossSalary || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge 
                            className={
                              emp.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {emp.status || 'active'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                toast.info(
                                  <div className="space-y-2">
                                    <p className="font-semibold">{emp.fullName} - Salary Details</p>
                                    <div className="text-sm space-y-1">
                                      <p>Basic: {formatCurrency(emp.basicSalary)}</p>
                                      <p>House Rent: {formatCurrency(emp.houseRent)}</p>
                                      <p>Medical: {formatCurrency(emp.medicalAllowance)}</p>
                                      <hr className="my-1" />
                                      <p className="font-semibold">Gross: {formatCurrency(emp.grossSalary)}</p>
                                    </div>
                                  </div>,
                                  { duration: 5000 }
                                );
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditClick(emp)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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