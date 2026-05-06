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
import Pipeline from "./Pipeline";
import ListedData from "./ListedData";
import Analytics from "./Analytics";
import Inventory from "./Inventory";
import InventoryNextzen from "./InventoryNextzen";

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
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">2351

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
          <Pipeline></Pipeline>
        </TabsContent>

        {/* Tab Content — List */}
        <TabsContent value="list" className="animate-in fade-in duration-500 mt-0">
          <ListedData></ListedData>
        </TabsContent>

        {/* Tab Content — Analytics */}
        <TabsContent
          value="analytics"
          className="animate-in fade-in duration-500 mt-0"
        >
          <Analytics></Analytics>
        </TabsContent>

        {/* Tab Content — Inventory */}
        <TabsContent
          value="inventory"
          className="animate-in fade-in duration-500 mt-0"
        >
          <InventoryNextzen></InventoryNextzen>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tablisted;