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
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecruitmentNextzen } from "@/app/hook/useRecruitment-jobs-nextzen";

// ── Pipeline stages ──────────────────────────────────────────────────────
const STAGES = [
  {
    key: "Applied",
    label: "Applied",
    icon: Users,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    accent: "bg-slate-300",
  },
  {
    key: "Screening",
    label: "Screening",
    icon: Search,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    accent: "bg-blue-400",
  },
  {
    key: "Assessment",
    label: "Assessment",
    icon: ClipboardCheck,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    accent: "bg-purple-400",
  },
  {
    key: "Interview",
    label: "Interview",
    icon: Video,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    accent: "bg-pink-400",
  },
  {
    key: "Final Review",
    label: "Final Review",
    icon: FileText,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    accent: "bg-orange-400",
  },
  {
    key: "Offer",
    label: "Offer",
    icon: Send,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    accent: "bg-cyan-400",
  },
  {
    key: "Hired",
    label: "Hired",
    icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    accent: "bg-emerald-500",
  },
];

const StatusLayout = ({ filters = {}, onTotalChange }) => {
  const { fetchByStatus, changeCandidateStatus } = useRecruitmentNextzen();

  const [stageData, setStageData] = useState({});
  const [stageLoading, setStageLoading] = useState({});

  // Drag state
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // ── Load all stages ──────────────────────────────────────────────────────
  const loadAllStages = useCallback(async () => {
    setStageLoading(STAGES.reduce((acc, s) => ({ ...acc, [s.key]: true }), {}));

    const results = await Promise.all(
      STAGES.map((stage) =>
        fetchByStatus(stage.key, {
          page: 1,
          limit: 20,
          search: filters.search || "",
          jobRoleName: filters.jobRoleName || "all",
          source: filters.source || "all",
        }).then((res) => ({ stage: stage.key, data: res }))
      )
    );

    const next = {};
    let total = 0;
    results.forEach(({ stage, data }) => {
      next[stage] = data;
      total += data.total || 0;
    });

    setStageData(next);
    setStageLoading(
      STAGES.reduce((acc, s) => ({ ...acc, [s.key]: false }), {})
    );

    if (onTotalChange) onTotalChange(total);
  }, [fetchByStatus, filters.search, filters.jobRoleName, filters.source, onTotalChange]);

  useEffect(() => {
    loadAllStages();
  }, [loadAllStages]);

  // Auto-refresh on global event
  useEffect(() => {
    const handler = () => loadAllStages();
    window.addEventListener("refresh-kanban-board", handler);
    return () => window.removeEventListener("refresh-kanban-board", handler);
  }, [loadAllStages]);

  // ── Drag and drop ────────────────────────────────────────────────────────
  const handleDragStart = (e, candidate, fromStage) => {
    setDraggedCandidate({ ...candidate, fromStage });
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox
    e.dataTransfer.setData("text/plain", candidate._id);
  };

  const handleDragOver = (e, stageKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageKey);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e, toStage) => {
    e.preventDefault();
    setDragOverStage(null);

    if (!draggedCandidate) return;
    if (draggedCandidate.fromStage === toStage) {
      setDraggedCandidate(null);
      return;
    }

    // Optimistic UI — move the candidate locally first
    setStageData((prev) => {
      const fromCandidates =
        prev[draggedCandidate.fromStage]?.candidates?.filter(
          (c) => c._id !== draggedCandidate._id
        ) || [];
      const toCandidates = [
        { ...draggedCandidate, status: toStage },
        ...(prev[toStage]?.candidates || []),
      ];

      return {
        ...prev,
        [draggedCandidate.fromStage]: {
          ...prev[draggedCandidate.fromStage],
          candidates: fromCandidates,
          total: Math.max((prev[draggedCandidate.fromStage]?.total || 1) - 1, 0),
        },
        [toStage]: {
          ...prev[toStage],
          candidates: toCandidates,
          total: (prev[toStage]?.total || 0) + 1,
        },
      };
    });

    try {
      await changeCandidateStatus(draggedCandidate._id, toStage);
    } catch (err) {
      console.error("Status change failed — reloading board:", err);
      loadAllStages();
    } finally {
      setDraggedCandidate(null);
    }
  };

  // ── Status change via dropdown (alternative to drag) ─────────────────────
  const handleStatusChange = async (candidate, newStatus) => {
    if (candidate.status === newStatus) return;
    try {
      // Optimistic local move
      setStageData((prev) => {
        const fromCandidates =
          prev[candidate.status]?.candidates?.filter(
            (c) => c._id !== candidate._id
          ) || [];
        const toCandidates = [
          { ...candidate, status: newStatus },
          ...(prev[newStatus]?.candidates || []),
        ];
        return {
          ...prev,
          [candidate.status]: {
            ...prev[candidate.status],
            candidates: fromCandidates,
            total: Math.max((prev[candidate.status]?.total || 1) - 1, 0),
          },
          [newStatus]: {
            ...prev[newStatus],
            candidates: toCandidates,
            total: (prev[newStatus]?.total || 0) + 1,
          },
        };
      });

      await changeCandidateStatus(candidate._id, newStatus);
    } catch (err) {
      console.error("Status change failed:", err);
      loadAllStages();
    }
  };

  const totalAcrossStages = STAGES.reduce(
    (sum, s) => sum + (stageData[s.key]?.total || 0),
    0
  );

  return (
    <div className="flex gap-4">
      {STAGES.map((stage) => {
        const Icon = stage.icon;
        const data = stageData[stage.key];
        const candidates = data?.candidates || [];
        const total = data?.total || 0;
        const isLoading = stageLoading[stage.key];
        const isDragOver = dragOverStage === stage.key;

        return (
          <div
            key={stage.key}
            className={`flex flex-col w-[280px] rounded-2xl transition-all ${
              isDragOver ? "ring-2 ring-blue-400 ring-offset-2 bg-blue-50/40" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.key)}
          >
            {/* Column Header */}
            <Card className="border-slate-100 shadow-sm rounded-xl mb-3 sticky top-0">
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
                <div className="h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full ${stage.accent} rounded-full transition-all`}
                    style={{
                      width:
                        totalAcrossStages > 0
                          ? `${Math.min(
                              (total / totalAcrossStages) * 100,
                              100
                            )}%`
                          : "0%",
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Column body */}
            <div className="flex-1 space-y-3 min-h-[200px]">
              {isLoading && candidates.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 italic border-2 border-dashed border-slate-200 rounded-xl">
                  Drop candidates here
                </div>
              ) : (
                candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate._id}
                    candidate={candidate}
                    onDragStart={(e) => handleDragStart(e, candidate, stage.key)}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Candidate card with drag + status dropdown ─────────────────────────────
const CandidateCard = ({ candidate, onDragStart, onStatusChange }) => {
  const score =
    candidate.matchScore ??
    Math.min(95, 70 + (candidate.experience || 0) * 3);

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
    <Card
      draggable
      onDragStart={onDragStart}
      className="candidate-card border-slate-100 shadow-sm rounded-xl hover:border-blue-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <CardContent className="p-4">

        {/* Header */}
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

        {/* Status pills */}
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

        {/* Note */}
        {candidate.lastUpdatedBy?.designation || candidate.education ? (
          <div className="bg-pink-50 border border-pink-100 rounded-lg p-2 mb-3">
            <p className="text-[11px] text-pink-700 leading-relaxed line-clamp-2">
              {candidate.lastUpdatedBy?.designation
                ? `Last reviewed by ${candidate.lastUpdatedBy.designation}`
                : `${candidate.education || ""} — ${
                    candidate.experience || 0
                  }y experience`}
            </p>
          </div>
        ) : null}

        {/* Footer + status dropdown */}
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

          {/* Move-status dropdown (alternative to drag) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded-md transition-colors"
              >
                Move <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {STAGES.filter((s) => s.key !== candidate.status).map((s) => (
                <DropdownMenuItem
                  key={s.key}
                  onClick={() => onStatusChange(candidate, s.key)}
                  className="text-xs cursor-pointer"
                >
                  <s.icon className={`w-3 h-3 mr-2 ${s.iconColor}`} />
                  Move to {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusLayout;