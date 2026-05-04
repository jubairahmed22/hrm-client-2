"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  MapPin,
  Briefcase,
  Star,
  FileText,
  Video,
  Users,
  Search,
  ClipboardCheck,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecruitmentNextzen } from "@/app/hook/useRecruitmentNextzen";
import { useJobPostsNextzen } from "@/app/hook/useJobPostsNextzen";

// ── Pipeline stages config ────────────────────────────────────────────────
const STAGES = [
  {
    key: "Applied",
    label: "Applied",
    icon: Users,
    color: "bg-slate-50 text-slate-700",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    accent: "bg-slate-300",
  },
  {
    key: "Screening",
    label: "Screening",
    icon: Search,
    color: "bg-blue-50 text-blue-700",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    accent: "bg-blue-400",
  },
  {
    key: "Assessment",
    label: "Assessment",
    icon: ClipboardCheck,
    color: "bg-purple-50 text-purple-700",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    accent: "bg-purple-400",
  },
  {
    key: "Interview",
    label: "Interview",
    icon: Video,
    color: "bg-pink-50 text-pink-700",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    accent: "bg-pink-400",
  },
  {
    key: "Final Review",
    label: "Final Review",
    icon: FileText,
    color: "bg-orange-50 text-orange-700",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    accent: "bg-orange-400",
  },
  {
    key: "Offer",
    label: "Offer",
    icon: Send,
    color: "bg-cyan-50 text-cyan-700",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    accent: "bg-cyan-400",
  },
  {
    key: "Hired",
    label: "Hired",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-700",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    accent: "bg-emerald-500",
  },
];

const SOURCE_OPTIONS = [
  { value: "all", label: "All Sources" },
  { value: "Career Site", label: "Career Site" },
  { value: "Referral", label: "Referral" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Job Board", label: "Job Board" },
  { value: "Indeed", label: "Indeed" },
  { value: "Other", label: "Other" },
];

const Pipeline = () => {
  const { fetchByStatus } = useRecruitmentNextzen();
  const { fetchJobOptions } = useJobPostsNextzen();

  const [stageData, setStageData] = useState({}); // { Applied: { candidates, total }, ... }
  const [stageLoading, setStageLoading] = useState({});
  const [search, setSearch] = useState("");
  const [jobRoleFilter, setJobRoleFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [jobOptions, setJobOptions] = useState([]);

  // Total across all stages
  const totalCandidates = STAGES.reduce(
    (sum, s) => sum + (stageData[s.key]?.total || 0),
    0
  );

  // ── Fetch jobs for the dropdown ─────────────────────────────────────────
  useEffect(() => {
    fetchJobOptions().then((opts) => setJobOptions(opts || []));
  }, [fetchJobOptions]);

  // ── Load every stage's candidates ───────────────────────────────────────
  const loadAllStages = useCallback(async () => {
    const params = {
      page: 1,
      limit: 10,
      search,
      jobRoleName: jobRoleFilter,
      source: sourceFilter,
    };

    // Mark all stages as loading
    setStageLoading(
      STAGES.reduce((acc, s) => ({ ...acc, [s.key]: true }), {})
    );

    // Fetch all stages in parallel
    const results = await Promise.all(
      STAGES.map((stage) =>
        fetchByStatus(stage.key, params).then((res) => ({
          stage: stage.key,
          data: res,
        }))
      )
    );

    const next = {};
    results.forEach(({ stage, data }) => {
      next[stage] = data;
    });
    setStageData(next);
    setStageLoading(
      STAGES.reduce((acc, s) => ({ ...acc, [s.key]: false }), {})
    );
  }, [fetchByStatus, search, jobRoleFilter, sourceFilter]);

  useEffect(() => {
    loadAllStages();
  }, [loadAllStages]);

  // Auto-refresh on global event (after status change elsewhere)
  useEffect(() => {
    const handler = () => loadAllStages();
    window.addEventListener("refresh-kanban-board", handler);
    return () => window.removeEventListener("refresh-kanban-board", handler);
  }, [loadAllStages]);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <Card className="border-slate-100 shadow-sm rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, role, or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200"
              />
            </div>

            <Select value={jobRoleFilter} onValueChange={setJobRoleFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Job Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {jobOptions.map((opt) => (
                  <SelectItem key={opt._id} value={opt.title}>
                    {opt.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 mt-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {totalCandidates}
              </span>{" "}
              candidates
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const data = stageData[stage.key];
          const candidates = data?.candidates || [];
          const total = data?.total || 0;
          const isLoading = stageLoading[stage.key];

          return (
            <div key={stage.key} className="flex flex-col">

              {/* Column Header */}
              <Card className="border-slate-100 shadow-sm rounded-xl mb-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${stage.iconBg}`}>
                        <Icon className={`w-4 h-4 ${stage.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {stage.label}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {total} candidate{total !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {total}
                    </span>
                  </div>
                  {/* Accent bar */}
                  <div className="h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full ${stage.accent} rounded-full transition-all`}
                      style={{
                        width:
                          totalCandidates > 0
                            ? `${Math.min((total / totalCandidates) * 100, 100)}%`
                            : "0%",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Column Body — candidate cards */}
              <div className="flex-1 space-y-3 min-h-[100px]">
                {isLoading && candidates.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 italic">
                    No candidates
                  </div>
                ) : (
                  candidates.map((candidate) => (
                    <CandidateCard key={candidate._id} candidate={candidate} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Candidate Card Component ──────────────────────────────────────────────
const CandidateCard = ({ candidate }) => {
  // Compute a fake "match score" if not provided (real impl would come from backend)
  const score =
    candidate.matchScore ??
    Math.min(95, 70 + (candidate.experience || 0) * 3); // simple heuristic

  const scoreColor =
    score >= 90
      ? "text-emerald-600 bg-emerald-50"
      : score >= 80
      ? "text-blue-600 bg-blue-50"
      : score >= 70
      ? "text-amber-600 bg-amber-50"
      : "text-slate-500 bg-slate-50";

  const sourceColor =
    {
      LinkedIn: "bg-blue-50 text-blue-700",
      Referral: "bg-purple-50 text-purple-700",
      "Career Site": "bg-slate-50 text-slate-700",
      "Job Board": "bg-orange-50 text-orange-700",
      Indeed: "bg-cyan-50 text-cyan-700",
    }[candidate.source] || "bg-slate-50 text-slate-700";

  return (
    <Card className="border-slate-100 shadow-sm rounded-xl hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
      <CardContent className="p-4">

        {/* Header — name + match score */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-slate-900 truncate">
              {candidate.fullName || "Unknown"}
            </h4>
            <p className="text-xs text-slate-500 truncate">
              {candidate.jobRoleName || "—"}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${scoreColor} flex-shrink-0`}
          >
            <Star className="w-2.5 h-2.5" />
            {score}%
          </div>
        </div>

        {/* Location + experience */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
          {candidate.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {candidate.location.split(",")[0]}
            </span>
          )}
          {candidate.experience !== undefined && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <Briefcase className="w-3 h-3" />
              {candidate.experience}y
            </span>
          )}
        </div>

        {/* Status pills row */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-50 text-blue-700">
            in progress
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${sourceColor}`}
          >
            {candidate.source || "—"}
          </span>
        </div>

        {/* Note / latest action */}
        {candidate.lastUpdatedBy?.designation || candidate.education ? (
          <div className="bg-pink-50 border border-pink-100 rounded-lg p-2 mb-3">
            <p className="text-[11px] text-pink-700 leading-relaxed line-clamp-2">
              {candidate.lastUpdatedBy?.designation
                ? `Last reviewed by ${candidate.lastUpdatedBy.designation}`
                : `${candidate.education || ""} — ${candidate.experience || 0}y experience`}
            </p>
          </div>
        ) : null}

        {/* Footer — meta counts */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {candidate.testCount || 0} tests
            </span>
            <span className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              {candidate.interviewCount || 0} interviews
            </span>
          </div>
          {candidate.history?.length > 0 && (
            <span className="text-emerald-600 font-semibold">
              {score}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Pipeline;