"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  Loader2, 
  MapPin, 
  Briefcase, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  RefreshCcw,
  SlidersHorizontal,
  Mail,
  Clock
} from "lucide-react";
import { useRecruitmentNextzen } from "@/app/hook/useRecruitment-jobs-nextzen";
import { useJobPostsNextzen } from "@/app/hook/useJobPostsNextzen";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STAGES = [
  { key: "Applied", label: "Applied" },
  { key: "Screening", label: "Screening" },
  { key: "Assessment", label: "Assessment" },
  { key: "Interview", label: "Interview" },
  { key: "Final Review", label: "Final Review" },
  { key: "Offer", label: "Offer" },
  { key: "Hired", label: "Hired" },
  { key: "Rejected", label: "Rejected" },
];

const SOURCE_OPTIONS = [
  { value: "Career Site", label: "Career Site" },
  { value: "Referral", label: "Referral" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Job Board", label: "Job Board" },
  { value: "Indeed", label: "Indeed" },
  { value: "Other", label: "Other" },
];

export default function ListedData() {
  const { fetchAllCandidates, candidates, pagination, loading, error } = useRecruitmentNextzen();
  const { fetchJobOptions } = useJobPostsNextzen();

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobRoleFilter, setJobRoleFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Lists and Meta-counts returned from aggregate
  const [jobOptions, setJobOptions] = useState([]);
  const [metaCounts, setMetaCounts] = useState({ statuses: {}, jobRoles: {}, sources: {} });

  // Load job options dropdown on mount
  useEffect(() => {
    fetchJobOptions().then((opts) => setJobOptions(opts || []));
  }, [fetchJobOptions]);

  // Load and refresh list when filters change
  const handleFetchData = useCallback(async () => {
    try {
      const response = await fetchAllCandidates({
        page: currentPage,
        search,
        status: statusFilter,
        jobRoleName: jobRoleFilter,
        source: sourceFilter,
      });

      // Safely extract aggregations from response if stored in backend response payload
      if (response?.metaCounts) {
        setMetaCounts(response.metaCounts);
      }
    } catch (err) {
      console.error("Error reading updated counts:", err);
    }
  }, [currentPage, search, statusFilter, jobRoleFilter, sourceFilter, fetchAllCandidates]);

  useEffect(() => {
    handleFetchData();
  }, [handleFetchData]);

  // Reset to page 1 whenever any key filters update
  const handleFilterChange = (type, value) => {
    setCurrentPage(1);
    if (type === "status") setStatusFilter(value);
    if (type === "jobRole") setJobRoleFilter(value);
    if (type === "source") setSourceFilter(value);
  };

  // Status badge dynamic styling resolver
  const getStatusBadgeClass = (status) => {
    const maps = {
      Applied: "bg-slate-50 text-slate-700 border-slate-200",
      Screening: "bg-blue-50 text-blue-700 border-blue-200",
      Assessment: "bg-purple-50 text-purple-700 border-purple-200",
      Interview: "bg-pink-50 text-pink-700 border-pink-200",
      "Final Review": "bg-orange-50 text-orange-700 border-orange-200",
      Offer: "bg-cyan-50 text-cyan-700 border-cyan-200",
      Hired: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Rejected: "bg-red-50 text-red-700 border-red-200",
    };
    return maps[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="w-full bg-[#f8f9fc] rounded-2xl p-6 border border-slate-100">
      
      {/* FILTER CONTROL PANEL */}
      <Card className="border-slate-100 shadow-sm rounded-xl mb-6 bg-white">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-800">Filter Applicants</h3>
            </div>
            {/* Total global Count badge */}
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
              Total Matches: {pagination.totalItems || 0}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 w-full bg-slate-50 border-slate-200/80 rounded-xl"
              />
            </div>

            {/* Status Dropdown Filter */}
            <Select value={statusFilter} onValueChange={(val) => handleFilterChange("status", val)}>
              <SelectTrigger className="bg-slate-50 border-slate-200/80 rounded-xl">
                <SelectValue placeholder="Pipeline Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>All Stages</span>
                  </div>
                </SelectItem>
                {STAGES.map((s) => {
                  const count = metaCounts.statuses[s.key] || 0;
                  return (
                    <SelectItem key={s.key} value={s.key}>
                      <div className="flex items-center justify-between gap-10 w-full">
                        <span>{s.label}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-mono font-bold">
                          {count}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Job Role Dropdown Filter */}
            <Select value={jobRoleFilter} onValueChange={(val) => handleFilterChange("jobRole", val)}>
              <SelectTrigger className="bg-slate-50 border-slate-200/80 rounded-xl">
                <SelectValue placeholder="Job Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {jobOptions.map((opt) => {
                  const count = metaCounts.jobRoles[opt.title] || 0;
                  return (
                    <SelectItem key={opt._id} value={opt.title}>
                      <div className="flex items-center justify-between gap-10 w-full">
                        <span className="truncate max-w-[120px]">{opt.title}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-mono font-bold">
                          {count}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Source Dropdown Filter */}
            <Select value={sourceFilter} onValueChange={(val) => handleFilterChange("source", val)}>
              <SelectTrigger className="bg-slate-50 border-slate-200/80 rounded-xl">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {SOURCE_OPTIONS.map((opt) => {
                  const count = metaCounts.sources[opt.value] || 0;
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center justify-between gap-10 w-full">
                        <span>{opt.label}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-mono font-bold">
                          {count}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* RENDER CANDIDATES LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-100 rounded-xl">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400 mt-2 font-medium">Fetching candidates...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-xl text-center p-4">
          <p className="text-sm font-semibold text-red-500">{error}</p>
          <button 
            onClick={handleFetchData} 
            className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-semibold border border-blue-200 px-3 py-1.5 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition"
          >
            <RefreshCcw className="w-3 h-3" /> Retry Connection
          </button>
        </div>
      ) : candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white">
          <span className="text-3xl mb-2">📂</span>
          <p className="text-sm font-bold text-slate-700">No applicants found</p>
          <p className="text-xs text-slate-400 mt-1">Try tweaking your search term or selection filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* List Display View Grid */}
          <div className="grid grid-cols-1 gap-3">
            {candidates.map((candidate) => {
              const score = candidate.matchScore ?? 75;
              const name = candidate.fullName || candidate.name || "Unknown Candidate";
              
              return (
                <div 
                  key={candidate._id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Left Side: Identity */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">{name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeClass(candidate.status)}`}>
                          {candidate.status || "Applied"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {candidate.jobRoleName || "Unassigned Position"}
                      </p>
                    </div>
                  </div>

                  {/* Mid Segment: Metadata details */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 my-3 md:my-0 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{candidate.email}</span>
                    </div>
                    {candidate.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{candidate.location.split(",")[0]}</span>
                      </div>
                    )}
                    {candidate.experience !== undefined && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>{candidate.experience} yrs</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(candidate.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Score indicator */}
                  <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-50 justify-between md:justify-end">
                    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {score}% Match
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controllers */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">
              Page <span className="font-semibold text-slate-700">{currentPage}</span> of{" "}
              <span className="font-semibold text-slate-700">{pagination.totalPages}</span>
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold text-slate-600 transition shadow-sm flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold text-slate-600 transition shadow-sm flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}