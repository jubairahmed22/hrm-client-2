"use client";

import React, { useState } from "react";
import { MapPin, Briefcase, Star, FileText, Video, ChevronDown, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Separate Dialog Components (Imported exactly as in your structure)
import AppliedDialog from './AppliedDialog';
import ScreeningDialog from './ScreeningDialog';
import AssessmentDialog from './AssessmentDialog';
import InterviewDialog from './InterviewDialog';
import FinalReviewDialog from './FinalReviewDialog';
import OfferDialog from './OfferDialog';
import HiredDialog from './HiredDialog';

// ── Pipeline stages (defined for dropdown population) ─────────────────────────────
const STAGES = [
  { key: "Applied", label: "Applied" },
  { key: "Screening", label: "Screening" },
  { key: "Assessment", label: "Assessment" },
  { key: "Interview", label: "Interview" },
  { key: "Final Review", label: "Final Review" },
  { key: "Offer", label: "Offer" },
  { key: "Hired", label: "Hired" },
];

const CandidateCard = ({ candidate, onDragStart, onStatusChange, stagesConfig = STAGES, job }) => {
  const [isViewOpen, setIsViewOpen] = useState(false); // Controls the Status Dialog visibility

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

  // --- DIALOG MAPPING LOGIC ---
  const renderStatusDialog = () => {
    if (!isViewOpen) return null;

    const commonProps = {
      open: isViewOpen,
      onClose: () => setIsViewOpen(false),
      person: candidate,
      job: job
    };

    switch (candidate.status) {
      case "Applied": return <AppliedDialog {...commonProps} />;
      case "Screening": return <ScreeningDialog {...commonProps} />;
      case "Assessment": return <AssessmentDialog {...commonProps} />;
      case "Interview": return <InterviewDialog {...commonProps} />;
      case "Final Review": return <FinalReviewDialog {...commonProps} />;
      case "Offer": return <OfferDialog {...commonProps} />;
      case "Hired": return <HiredDialog {...commonProps} />;
      default: return null; 
    }
  };

  return (
    <>
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

            <div className="flex items-center gap-1.5">
              {/* Eye Button to open dialog */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsViewOpen(true);
                }}
                className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>

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
                  {stagesConfig
                    .filter((s) => s.key !== candidate.status)
                    .map((s) => (
                      <DropdownMenuItem
                        key={s.key}
                        onClick={() => onStatusChange(candidate, s.key)}
                        className="text-xs cursor-pointer"
                      >
                        {s.icon && <s.icon className={`w-3 h-3 mr-2 ${s.iconColor}`} />}
                        Move to {s.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render the dynamically selected Dialog */}
      {renderStatusDialog()}
    </>
  );
};

export default CandidateCard;