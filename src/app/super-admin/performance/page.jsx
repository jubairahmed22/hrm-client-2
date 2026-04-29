"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Target, GitBranch, Trophy } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceHeader from "./PerformanceCompo/PerformanceHeader";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active tab from URL or default to 'appraisals'
  const activeTab = searchParams.get("tab") || "appraisals";

  // Tab change handler — updates URL without page reload
  const handleTabChange = (val) => {
    router.push(`?tab=${val}`, { scroll: false });
  };

  // ── VIEW: Performance Appraisals ──────────────────────────────────────────
  const RenderAppraisals = () => (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-100">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
        Performance Appraisals
      </h3>
      <p className="text-sm text-slate-500 mt-2">
        Appraisal cycles, reviews, and ratings will appear here.
      </p>
    </div>
  );

  // ── VIEW: Approval Workflow ──────────────────────────────────────────────
  const RenderApprovalWorkflow = () => (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-100">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
        Approval Workflow
      </h3>
      <p className="text-sm text-slate-500 mt-2">
        Performance review approval chain and pending approvals will appear here.
      </p>
    </div>
  );

  // ── VIEW: Goals & Objectives ──────────────────────────────────────────────
  const RenderGoals = () => (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-100">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
        Goals & Objectives
      </h3>
      <p className="text-sm text-slate-500 mt-2">
        Employee goals, OKRs, and progress tracking will appear here.
      </p>
    </div>
  );

  return (
    <div className="space-y-8 p-6 bg-[#F8FAFC] min-h-screen">

      {/* HEADER */}
      <PerformanceHeader activeTab={activeTab} />

      {/* TABS */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-8"
      >
        <TabsList className="w-full">
          <TabsTrigger value="appraisals">
            <Target className="w-4 h-4" /> Performance Appraisals
          </TabsTrigger>
          <TabsTrigger value="approval">
            <GitBranch className="w-4 h-4" /> Approval Workflow
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Trophy className="w-4 h-4" /> Goals & Objectives
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appraisals" className="outline-none">
          {RenderAppraisals()}
        </TabsContent>
        <TabsContent value="approval" className="outline-none">
          {RenderApprovalWorkflow()}
        </TabsContent>
        <TabsContent value="goals" className="outline-none">
          {RenderGoals()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;