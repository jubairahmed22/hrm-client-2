"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Download,
  UserPlus,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Custom Components & Hooks
import EmployeeRowCard from "./EmployeeRowCard";
import { useMyTeam } from "@/app/hook/useMyTeam";

const UserManagementNew = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get departments dynamically from your existing hook
  const { departments } = useMyTeam();

  // State Management for Employees
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // Defaulting to list as per your preference
  
  // Filter States synced with URL
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [department, setDepartment] = useState(searchParams.get("department") || "All");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Logic for Employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        directory: "employee", 
        ...(search ? { search } : {}),
        ...(department && department !== "All" ? { department } : {}),
        ...(status && status !== "all" ? { status } : {}),
      });

      const res = await fetch(`http://localhost:50001/api/get-employee?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setEmployees(data.data);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, department, status]);

  // Sync URL and Trigger Fetch
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (department !== "All") params.set("department", department);
    if (status !== "all") params.set("status", status);
    params.set("page", String(page));
    
    // Update URL without refresh
    router.replace(`?${params.toString()}`, { scroll: false });
    fetchEmployees();
  }, [search, department, status, page, router, fetchEmployees]);

  return (
    <div className="space-y-6 min-h-screen bg-slate-50/50">
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b bg-white rounded-t-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-slate-800">
                <Users className="w-6 h-6 text-blue-600" />
                Employee Directory
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">Manage and view all members of your organization</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                variant="outline"
                className="rounded-xl font-bold"
              >
                {viewMode === "grid" ? "List View" : "Grid View"}
              </Button>

              <Button variant="outline" className="rounded-xl font-bold">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 font-bold">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by ID, Name, or Email..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
                className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="flex gap-3">
              {/* Dynamic Department Select */}
              <Select value={department} onValueChange={(val) => { setDepartment(val); setPage(1); }}>
                <SelectTrigger className="w-64 h-11 rounded-xl border-slate-200 font-bold">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All" className="font-bold">All Departments</SelectItem>
                  {departments && departments.map((dep) => (
                    <SelectItem key={dep._id} value={dep.name} className="font-medium">
                      {dep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Select */}
              <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                <SelectTrigger className="w-40 h-11 rounded-xl border-slate-200 font-bold">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="font-medium">All Status</SelectItem>
                  <SelectItem value="active" className="font-medium">Active</SelectItem>
                  <SelectItem value="inactive" className="font-medium">Inactive</SelectItem>
                  <SelectItem value="Locked" className="font-medium text-orange-600">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Employee List Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader className="w-10 h-10 animate-spin text-blue-600 mb-4" />
              <p className="text-slate-500 font-bold">Syncing Directory...</p>
            </div>
          ) : employees.length > 0 ? (
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }>
              {employees.map((emp) => (
                <EmployeeRowCard
                  key={emp._id}
                  employee={emp}
                  departments={departments} // Passing dynamic depts to the card for edit dialog
                  fetchEmployees={fetchEmployees}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No employees found</h3>
              <p className="text-slate-500">Try adjusting your search or category filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-xl h-10 w-10 p-0 border-slate-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                    <Button
                        key={i + 1}
                        variant={page === i + 1 ? "default" : "outline"}
                        onClick={() => setPage(i + 1)}
                        className={`h-10 w-10 rounded-xl font-bold transition-all ${
                          page === i + 1 ? "bg-slate-900 hover:bg-slate-800" : "border-slate-200 text-slate-600"
                        }`}
                    >
                        {i + 1}
                    </Button>
                ))}
              </div>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-xl h-10 w-10 p-0 border-slate-200"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementNew;