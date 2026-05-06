"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRecruitmentNextzen } from "@/app/hook/useRecruitment-jobs-nextzen";

export default function RejectedList() {
  const { fetchByStatus, changeCandidateStatus, loading } = useRecruitmentNextzen();
  const [rejectedCandidates, setRejectedCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;

  // ---------------- Load Data ----------------
  const loadRejectedCandidates = useCallback(async () => {
    try {
      // Build clean parameters object matching fetchCandidatesByStatusNextzen logic
      const params = {
        page: currentPage,
        limit,
        jobRoleName: "all",
        source: "all"
      };

      // Only pass search query if the user has typed something
      if (searchTerm.trim() !== "") {
        params.search = searchTerm.trim();
      }

      const data = await fetchByStatus("Rejected", params);
      
      setRejectedCandidates(data.candidates || []);
      setHasNextPage(data.hasNextPage || false);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("Failed to load rejected candidates:", err);
    }
  }, [currentPage, searchTerm, fetchByStatus]);

  // Load on mount, page change, or search query change
  useEffect(() => {
    loadRejectedCandidates();
  }, [loadRejectedCandidates]);

  // Listen for global board updates (e.g. dragging a card to Rejected)
  useEffect(() => {
    const handleGlobalRefresh = () => {
      loadRejectedCandidates();
    };
    window.addEventListener("refresh-kanban-board", handleGlobalRefresh);
    return () => {
      window.removeEventListener("refresh-kanban-board", handleGlobalRefresh);
    };
  }, [loadRejectedCandidates]);

  // ---------------- Revert/Restore Handler ----------------
  const handleRestoreCandidate = async (candidateId, currentJobId) => {
    if (!confirm("Are you sure you want to restore this candidate to Applied status?")) return;
    try {
      // Restore back to Applied
      await changeCandidateStatus(candidateId, "Applied", currentJobId, {
        revertReason: "Restored from Rejected list"
      });
    } catch (err) {
      alert(err.message || "Failed to restore candidate");
    }
  };

  return (
    <div className="w-full bg-zinc-950/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-2xl">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            Rejected Candidates
            <span className="text-xs bg-red-950/40 text-red-400 border border-red-900 px-2.5 py-0.5 rounded-full font-medium">
              {totalCount} Total
            </span>
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Archived talent profiles and documented reasons for disqualification.
          </p>
        </div>

        {/* Premium Search input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search rejected candidates..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on active typing
            }}
            className="w-full px-4 py-2 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition"
          />
        </div>
      </div>

      {/* Loading & Empty UI Logic */}
      {loading && rejectedCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-t-transparent border-red-500 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 mt-4">Retrieving application history...</p>
        </div>
      ) : rejectedCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-zinc-600 text-3xl mb-3">📂</div>
          <p className="text-sm text-zinc-400 font-medium">No rejected candidates found</p>
          <p className="text-xs text-zinc-500 max-w-xs mt-1">
            Candidates moved to Rejected inside the recruitment pipelines with archived metadata will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          {/* Main Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase font-medium tracking-wider">
                <th className="py-4 px-4 font-semibold">Candidate</th>
                <th className="py-4 px-4 font-semibold">Reason Category</th>
                <th className="py-4 px-4 font-semibold">Detailed Reason</th>
                <th className="py-4 px-4 font-semibold">Rejected By</th>
                <th className="py-4 px-4 font-semibold">Disqualified Date</th>
                <th className="py-4 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/80 text-sm text-zinc-300">
              {rejectedCandidates.map((candidate) => {
                const rejectionLog = candidate.lastAction;
                const author = rejectionLog?.updatedBy;
                
                // Read properties safely matching both candidate schema styles
                const candidateName = candidate.fullName || candidate.name || "Unknown Candidate";
                const candidateEmail = candidate.email || "No email available";
                const category = candidate.rejectionCategory || candidate.previousMetadata?.rejectionCategory || "Not Specified";
                const reason = candidate.rejectionReason || candidate.previousMetadata?.rejectionReason || "No details provided.";
                const jobId = candidate.jobRoleId || candidate.jobId || null;

                return (
                  <tr 
                    key={candidate._id} 
                    className="hover:bg-zinc-900/30 transition-colors group"
                  >
                    {/* Basic Info */}
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-zinc-100">{candidateName}</div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">{candidateEmail}</div>
                      </div>
                    </td>

                    {/* Rejection Category Tag */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-950/20 text-red-400 border border-red-900/30">
                        {category}
                      </span>
                    </td>

                    {/* Detailed Notes */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {reason}
                      </p>
                    </td>

                    {/* Metadata Author */}
                    <td className="py-4 px-4">
                      {author ? (
                        <div>
                          <div className="text-xs font-semibold text-zinc-300">{author.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{author.role || author.email}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600">N/A</span>
                      )}
                    </td>

                    {/* Formatted Disqualification Date */}
                    <td className="py-4 px-4 text-xs font-mono text-zinc-400">
                      {rejectionLog?.updatedAt 
                        ? new Date(rejectionLog.updatedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })
                        : "N/A"
                      }
                    </td>

                    {/* Dynamic Action Controls */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleRestoreCandidate(candidate._id, jobId)}
                        className="text-xs text-zinc-400 hover:text-blue-400 border border-zinc-800 hover:border-blue-900 bg-zinc-900/40 hover:bg-blue-950/20 px-3 py-1.5 rounded-lg transition"
                      >
                        Restore Pipeline
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table Pagination Controls */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-500">
              Showing page <span className="font-semibold text-zinc-300">{currentPage}</span>
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-zinc-300 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!hasNextPage}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-zinc-300 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}