"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Mail,
  Globe,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  XCircle,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeavePolicy } from "@/app/hook/useLeavePolicy";
import { useAuth } from "@/context/AuthContext";
import SubmitLeaveReqDialog from "./LeaveManagementCompo/SubmitLeaveReqDialog";
import LeaveManagementBanner from "./LeaveManagementCompo/LeaveManagementBanner";
import LeaveTypeCard from "./LeaveManagementCompo/LeaveTypeCard";
import RequestCard from "./LeaveManagementCompo/RequestCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LeaveManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { UserAllDetails } = useAuth();
  
  const {
    deptRequests,          // New department-wise state from hook
    deptPagination,        // New department-wise pagination
    myRequests,       
    leavePolicies,    
    requestLoading,
    fetchMyRequests,
    fetchAllRequestsByDepartment, // Use the new department fetcher
    updateRequestStatus,
    fetchAllLeavePolicies 
  } = useLeavePolicy();

  // Pagination & Filters
  const [myPage, setMyPage] = useState(1);
  const [deptPage, setDeptPage] = useState(1);
  const [mySearch, setMySearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("department-pipeline");

  // 1. Initial Load: Leave Policies
  useEffect(() => {
    fetchAllLeavePolicies();
  }, [fetchAllLeavePolicies]);

  // 2. Fetch "My Requests"
  useEffect(() => {
    if (UserAllDetails?.email) {
      fetchMyRequests(UserAllDetails.email, { page: myPage, limit: 10 });
    }
  }, [UserAllDetails?.email, myPage, fetchMyRequests]);

  // 3. Fetch "Department Requests"
  useEffect(() => {
    if (UserAllDetails?.department) {
      const status = activeStatusFilter === "all" ? "" : activeStatusFilter;
      const leaveType = activeTypeFilter === "all" ? "" : activeTypeFilter;
      
      fetchAllRequestsByDepartment(UserAllDetails.department, { 
        page: deptPage, 
        limit: 10, 
        status, 
        leaveType 
      });
    }
  }, [UserAllDetails?.department, deptPage, activeStatusFilter, activeTypeFilter, fetchAllRequestsByDepartment]);

  // 4. Memoized Search Filtering
  const filteredMyRequests = useMemo(() => {
    return (myRequests || []).filter(req => 
      req.leaveType.toLowerCase().includes(mySearch.toLowerCase()) ||
      req.fullName?.toLowerCase().includes(mySearch.toLowerCase())
    );
  }, [myRequests, mySearch]);

  const filteredDeptRequests = useMemo(() => {
    return (deptRequests || []).filter(req => 
      req.leaveType.toLowerCase().includes(deptSearch.toLowerCase()) ||
      req.fullName?.toLowerCase().includes(deptSearch.toLowerCase())
    );
  }, [deptRequests, deptSearch]);

  const handleStatusChange = async (id, status) => {
    try { 
      await updateRequestStatus(id, status); 
      // Refresh current view after status change
      if (UserAllDetails?.department) {
        fetchAllRequestsByDepartment(UserAllDetails.department, { page: deptPage, limit: 10 });
      }
    } catch (err) { 
      console.error("Status update failed:", err); 
    }
  };

  return (
    <div className="space-y-8 p-6 bg-[#F4F7FE] min-h-screen">
      <LeaveManagementBanner onClick={() => setIsModalOpen(true)} />
      <LeaveTypeCard />

      <Tabs defaultValue="department-pipeline" onValueChange={setCurrentTab} className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-4">
          <TabsTrigger value="department-pipeline" className="rounded-lg px-6">
            <Users className="w-4 h-4 mr-2" /> Department Requests
          </TabsTrigger>
          <TabsTrigger value="my-requests" className="rounded-lg px-6">
            <Mail className="w-4 h-4 mr-2" /> My Requests
          </TabsTrigger>
        </TabsList>

        {/* DEPARTMENT REQUESTS CONTENT */}
        <TabsContent value="department-pipeline" className="space-y-6 outline-none">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by name or type..."
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                className="bg-slate-50 border-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={activeTypeFilter} onValueChange={setActiveTypeFilter}>
                <SelectTrigger className="w-[180px] bg-slate-50 border-none">
                  <SelectValue placeholder="Policy Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Policies</SelectItem>
                  {leavePolicies?.map((policy) => (
                    <SelectItem key={policy._id} value={policy.name}>
                      {policy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
                <SelectTrigger className="w-[160px] bg-slate-50 border-none">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Team Overview
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none px-3 py-1">
                  {UserAllDetails?.department || "General"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-slate-50/30">
              <div className="space-y-4">
                {requestLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
                  </div>
                ) : filteredDeptRequests.length === 0 ? (
                  <div className="text-center py-16 bg-white border-2 border-dashed rounded-2xl border-slate-200">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Calendar className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-semibold text-lg">No requests in this department</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredDeptRequests.map((req) => (
                      <RequestCard 
                        key={req._id} 
                        item={req} 
                        isGlobal={true} 
                        handleStatusChange={handleStatusChange} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Department Pagination */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button 
              disabled={deptPage === 1} 
              onClick={() => setDeptPage(p => p - 1)} 
              variant="outline" 
              className="rounded-xl h-11 bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="bg-white border border-slate-200 h-11 px-6 flex items-center rounded-xl font-bold text-slate-700 text-sm shadow-sm">
              Page {deptPage} of {deptPagination.totalPages || 1}
            </div>
            <Button 
              disabled={!deptPagination.hasNextPage} 
              onClick={() => setDeptPage(p => p + 1)} 
              variant="outline" 
              className="rounded-xl h-11 bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        {/* MY REQUESTS CONTENT */}
        <TabsContent value="my-requests" className="space-y-6 outline-none">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center shadow-sm">
            <Input
              placeholder="Search my request history..."
              value={mySearch}
              onChange={(e) => setMySearch(e.target.value)}
              className="bg-slate-50 border-none h-11 max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {requestLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>
            ) : filteredMyRequests.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-20 text-center text-slate-400 shadow-sm">
                <XCircle className="w-16 h-16 mx-auto mb-4 opacity-10" /> 
                <p className="font-medium text-slate-500">You haven't submitted any requests yet.</p>
              </div>
            ) : (
              filteredMyRequests.map(req => (
                <RequestCard key={req._id} item={req} isGlobal={false} />
              ))
            )}
          </div>
          
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button disabled={myPage === 1} onClick={() => setMyPage(p => p - 1)} variant="outline" className="rounded-xl h-11 bg-white">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="bg-white border border-slate-200 h-11 px-6 flex items-center rounded-xl font-bold text-slate-700 text-sm shadow-sm">
              Page {myPage}
            </div>
            <Button 
              disabled={filteredMyRequests.length < 10} // Simple check if pagination object for MyRequests isn't separate
              onClick={() => setMyPage(p => p + 1)} 
              variant="outline" 
              className="rounded-xl h-11 bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <SubmitLeaveReqDialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default LeaveManagementPage;