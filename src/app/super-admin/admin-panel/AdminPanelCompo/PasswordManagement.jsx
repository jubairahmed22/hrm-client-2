"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Users, Search, Loader, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useMyTeam } from "@/app/hook/useMyTeam";
import PasswordRowCard from "./PasswordRowCard";

const PasswordManagement = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { departments } = useMyTeam();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Extract values directly from URL
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const department = searchParams.get("department") || "All";
  const status = searchParams.get("status") || "all";

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: String(page),
        ...(search ? { search } : {}),
        ...(department !== "All" ? { department } : {}),
        ...(status !== "all" ? { status } : {}),
      });

      const res = await fetch(`http://localhost:50001/api/get-employee-options-password?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, department, status]);

  // Fetch only when URL parameters change
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Helper function to update URL safely without losing 'tab'
  const updateUrl = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-white border-b rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Users className="text-blue-600" /> Password Directory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search..."
              defaultValue={search}
              onKeyDown={(e) => e.key === "Enter" && updateUrl({ search: e.target.value, page: "1" })}
              className="md:w-1/2"
            />
            <Select value={department} onValueChange={(v) => updateUrl({ department: v, page: "1" })}>
              <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Departments</SelectItem>
                {departments?.map(d => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader className="animate-spin" /></div>
          ) : (
            <div className="space-y-4">
              {employees.map(emp => <PasswordRowCard key={emp._id} employee={emp} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button disabled={page === 1} onClick={() => updateUrl({ page: String(page - 1) })} variant="outline"><ChevronLeft /></Button>
              <span className="flex items-center px-4 font-bold text-sm">Page {page} of {totalPages}</span>
              <Button disabled={page === totalPages} onClick={() => updateUrl({ page: String(page + 1) })} variant="outline"><ChevronRight /></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordManagement;