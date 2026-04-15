"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRecruitment } from "@/app/hook/useRecruitment-jobs";
import { 
  Loader2, 
  Inbox, 
  DollarSign, 
  MapPin, 
  XCircle, 
  Clock, 
  Users,
  TrendingDown,
  Award,
  Users2,
  ClipboardList
} from "lucide-react";
import InventoryCard from "./InventoryCard";

const InventoryData = () => {
  const { id: jobId } = useParams();
  const { fetchByStatus } = useRecruitment();
  
  const [allInventory, setAllInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // --- 1. DATA FETCHING LOGIC ---
  const loadInitialData = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      // Fetch specifically from the "Inventory" stage
      const data = await fetchByStatus(jobId, "Inventory", 1, 500, "");
      setAllInventory(data.candidates || []);
    } catch (err) {
      console.error("Error loading inventory:", err);
    } finally {
      setLoading(false);
    }
  }, [jobId, fetchByStatus]);

  // Initial Load
  useEffect(() => { 
    loadInitialData(); 
  }, [loadInitialData]);

  // --- 2. REAL-TIME SYNCHRONIZATION ---
  // This ensures that if a card is dragged to Inventory in the Kanban, 
  // this list updates immediately.
  useEffect(() => {
    const handleRefresh = () => {
      loadInitialData();
    };

    window.addEventListener("refresh-kanban-board", handleRefresh);
    return () => window.removeEventListener("refresh-kanban-board", handleRefresh);
  }, [loadInitialData]);

  // --- 3. STATS CALCULATION (All 8 Reasons) ---
  const stats = useMemo(() => ({
    all: allInventory.length,
    salary: allInventory.filter(c => c.inventoryDetails?.category === "salary").length,
    location: allInventory.filter(c => c.inventoryDetails?.category === "location").length,
    declined: allInventory.filter(c => c.inventoryDetails?.category === "declined").length,
    timing: allInventory.filter(c => c.inventoryDetails?.category === "timing").length,
    counter_offer: allInventory.filter(c => c.inventoryDetails?.category === "counter_offer").length,
    overqualified: allInventory.filter(c => c.inventoryDetails?.category === "overqualified").length,
    cultural_fit: allInventory.filter(c => c.inventoryDetails?.category === "cultural_fit").length,
    other: allInventory.filter(c => c.inventoryDetails?.category === "other").length,
  }), [allInventory]);

  // --- 4. FILTERING LOGIC ---
  const filteredCandidates = useMemo(() => {
    if (activeTab === "all") return allInventory;
    return allInventory.filter(c => c.inventoryDetails?.category === activeTab);
  }, [activeTab, allInventory]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- ALL 8 REASONS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatTab 
          label="Total Qualified" 
          count={stats.all} 
          icon={Users} 
          isActive={activeTab === "all"}
          onClick={() => setActiveTab("all")}
          activeColor="bg-slate-900 text-white"
          idleColor="bg-white text-slate-600 border-gray-100"
        />
        <StatTab 
          label="Salary Mismatch" 
          count={stats.salary} 
          icon={DollarSign} 
          isActive={activeTab === "salary"}
          onClick={() => setActiveTab("salary")}
          activeColor="bg-amber-400 text-amber-950"
          idleColor="bg-amber-50 text-amber-600 border-amber-100"
        />
        <StatTab 
          label="Location Issues" 
          count={stats.location} 
          icon={MapPin} 
          isActive={activeTab === "location"}
          onClick={() => setActiveTab("location")}
          activeColor="bg-blue-500 text-white"
          idleColor="bg-blue-50 text-blue-600 border-blue-100"
        />
        <StatTab 
          label="Declined Offer" 
          count={stats.declined} 
          icon={XCircle} 
          isActive={activeTab === "declined"}
          onClick={() => setActiveTab("declined")}
          activeColor="bg-red-500 text-white"
          idleColor="bg-red-50 text-red-600 border-red-100"
        />
        <StatTab 
          label="Timing Issues" 
          count={stats.timing} 
          icon={Clock} 
          isActive={activeTab === "timing"}
          onClick={() => setActiveTab("timing")}
          activeColor="bg-purple-500 text-white"
          idleColor="bg-purple-50 text-purple-600 border-purple-100"
        />
        <StatTab 
          label="Counter Offer" 
          count={stats.counter_offer} 
          icon={TrendingDown} 
          isActive={activeTab === "counter_offer"}
          onClick={() => setActiveTab("counter_offer")}
          activeColor="bg-emerald-500 text-white"
          idleColor="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <StatTab 
          label="Overqualified" 
          count={stats.overqualified} 
          icon={Award} 
          isActive={activeTab === "overqualified"}
          onClick={() => setActiveTab("overqualified")}
          activeColor="bg-orange-500 text-white"
          idleColor="bg-orange-50 text-orange-600 border-orange-100"
        />
        <StatTab 
          label="Cultural Fit" 
          count={stats.cultural_fit} 
          icon={Users2} 
          isActive={activeTab === "cultural_fit"}
          onClick={() => setActiveTab("cultural_fit")}
          activeColor="bg-indigo-500 text-white"
          idleColor="bg-indigo-50 text-indigo-600 border-indigo-100"
        />
        <StatTab 
          label="Other Reasons" 
          count={stats.other} 
          icon={ClipboardList} 
          isActive={activeTab === "other"}
          onClick={() => setActiveTab("other")}
          activeColor="bg-gray-800 text-white"
          idleColor="bg-gray-50 text-gray-600 border-gray-200"
        />
      </div>

      {/* --- LIST VIEW --- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {activeTab === 'all' ? 'All Inventory' : activeTab.split('_').join(' ').toUpperCase()}
                <span className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full font-bold">
                    {filteredCandidates.length} Candidates
                </span>
            </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-indigo-500 w-10 h-10 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Repository...</p>
          </div>
        ) : filteredCandidates.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredCandidates.map((person) => (
              <InventoryCard
                key={person._id} 
                person={person} 
                isInventory={true} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-24 flex flex-col items-center border border-dashed border-slate-200">
            <Inbox className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Candidates Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- REUSABLE STAT TAB COMPONENT ---
const StatTab = ({ label, count, icon: Icon, isActive, onClick, activeColor, idleColor }) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-5 rounded-[24px] border flex flex-col items-start text-left transition-all duration-300 group hover:shadow-lg ${
        isActive ? `${activeColor} border-transparent shadow-xl scale-[1.02]` : `${idleColor} shadow-sm hover:-translate-y-1`
      }`}
    >
      <div className="flex w-full justify-between items-start mb-3">
        <span className={`text-[10px] font-bold uppercase tracking-wider opacity-80 leading-tight`}>
          {label}
        </span>
        <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-white/80'} transition-colors`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      
      <div className="mt-auto">
        <h4 className="text-3xl font-black tracking-tighter">{count}</h4>
      </div>

      {isActive && (
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      )}
    </button>
  );
};

export default InventoryData;