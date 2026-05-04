"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GitBranch, List, BarChart3, Archive } from "lucide-react";

// Tab content components — replace these imports with your actual components
// import Pipeline from "./Pipeline";
// import CandidateList from "./CandidateList";
// import Analytics from "./Analytics";
// import Inventory from "./Inventory";

const TAB_CONFIG = [
  {
    value: "pipeline",
    label: "Pipeline",
    icon: GitBranch,
    count: 18,
  },
  {
    value: "list",
    label: "List",
    icon: List,
    count: null, // no badge for List
  },
  {
    value: "analytics",
    label: "Analytics",
    icon: BarChart3,
    count: null,
  },
  {
    value: "inventory",
    label: "Inventory",
    icon: Archive,
    count: 10,
  },
];

const Tablisted = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current tab from URL (default to "pipeline")
  const currentTab = searchParams.get("tab") || "pipeline";
  const [activeTab, setActiveTab] = useState(currentTab);

  // Keep local state in sync with URL changes (e.g. when user uses back/forward)
  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);

  // Update URL when tab changes
  const handleTabChange = (value) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

        {/* Tab Bar */}
        <TabsList className="bg-white border border-slate-100 shadow-sm rounded-xl p-1 h-auto mb-6 grid grid-cols-4 w-full max-w-2xl">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <Badge
                    className={`ml-1 px-1.5 py-0 h-5 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content — Pipeline */}
        <TabsContent value="pipeline" className="animate-in fade-in duration-500 mt-0">
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <GitBranch className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Recruitment Pipeline
              </h2>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              Track candidates as they move through your hiring stages.
            </p>

            {/* TODO: Replace with <Pipeline /> component */}
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center">
              <GitBranch className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 font-semibold">
                Pipeline component goes here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Showing 18 candidates across all stages
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Tab Content — List */}
        <TabsContent value="list" className="animate-in fade-in duration-500 mt-0">
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <List className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Candidate List
              </h2>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              View all candidates in a structured table format.
            </p>

            {/* TODO: Replace with <CandidateList /> component */}
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center">
              <List className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 font-semibold">
                List component goes here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Sortable, filterable candidate table
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Tab Content — Analytics */}
        <TabsContent
          value="analytics"
          className="animate-in fade-in duration-500 mt-0"
        >
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Recruitment Analytics
              </h2>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              Insights and metrics on your hiring performance.
            </p>

            {/* TODO: Replace with <Analytics /> component */}
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center">
              <BarChart3 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 font-semibold">
                Analytics component goes here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Charts, conversion rates, time-to-hire stats
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Tab Content — Inventory */}
        <TabsContent
          value="inventory"
          className="animate-in fade-in duration-500 mt-0"
        >
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <Archive className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Candidate Inventory
              </h2>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              Past candidates archived for future opportunities.
            </p>

            {/* TODO: Replace with <Inventory /> component */}
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center">
              <Archive className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 font-semibold">
                Inventory component goes here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                10 candidates in your talent pool
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tablisted;