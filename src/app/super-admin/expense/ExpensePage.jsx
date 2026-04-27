"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  LayoutGrid,
  ShieldAlert,
  BarChart3,
  Check,
  Info,
} from "lucide-react";

// Hooks & Components
import { useExpense } from "@/app/hook/useExpense";
import CreateCategoryDialog from "./ExpenseCompo/CreateCategoryDialog";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Tab content components
import RequestsTab from "./ExpenseCompo/RequestsTab";
import PoliciesTab from "./ExpenseCompo/PoliciesTab";
import AnalyticsTab from "./ExpenseCompo/AnalyticsTab";
import CategoriesTab from "./ExpenseCompo/CategoriesTab";
import SubmitExpenseDialog from "./ExpenseCompo/SubmitExpenseDialog";
import ExpenseHeader from "./ExpenseCompo/ExpenseHeader";
import RequestsHOD from "./ExpenseCompo/RequestsHOD";
import RequestHr from "./ExpenseCompo/RequestHr";
import RequestFinance from "./ExpenseCompo/RequestFinance";
import MyExpense from "./ExpenseCompo/MyExpense";

import { useAuth } from "@/context/AuthContext";

const ExpensePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { UserAllDetails } = useAuth();

  const activeTab = searchParams.get("tab") || "requests";

  const { categories, loading, pagination, fetchAllCategories } = useExpense();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  // Fetch categories when on the categories tab
  useEffect(() => {
    if (activeTab === "categories") {
      fetchAllCategories({ page: currentPage, limit: 10 });
    }
  }, [currentPage, fetchAllCategories, activeTab]);

  const handleTabChange = (val) => {
    router.push(`?tab=${val}`, { scroll: false });
  };

  // ── ROLE RESOLUTION FROM DESIGNATION ───────────────────────────────────────
  // Designation strings come like "Head_of_Engineering", "HR_Manager",
  // "Finance_Manager", "CEO", "Senior_Developer" etc. We split on _ or space
  // and inspect the FIRST word to decide which expense view to render.
const resolveRoleFromDesignation = (designation) => {
  if (!designation) return "employee";

  const normalized = designation.toString().trim();
  const lower = normalized.toLowerCase();

  // Exact CEO match
  if (lower === "ceo") return "ceo";

  // First word check
  const firstWord = lower.split(/[_\s-]+/)[0];

  // ✅ Head of Finance / Head_of_Finance → finance view
  if (lower === "head_of_finance" || lower === "head of finance") return "finance";

  // ✅ Head of HR / Head_of_HR → hr view
  if (lower === "head_of_hr" || lower === "head of hr") return "hr";

  // First-word matching for everything else
  if (firstWord === "head") return "hod";
  if (firstWord === "hr") return "hr";
  if (firstWord === "finance") return "finance";

  return "employee";
};

  const userRole = resolveRoleFromDesignation(UserAllDetails?.designation);

  // ── VIEW: Categories ──────────────────────────────────────────────────────
  const RenderCategories = () => (
    <CategoriesTab
      categories={categories}
      loading={loading}
      pagination={pagination}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />
  );

  // ── VIEW: Requests (role-routed) ──────────────────────────────────────────
  const RenderRequests = () => {
    switch (userRole) {
      case "ceo":
        return (
          <RequestsTab
            UserAllDetails={UserAllDetails}
            categories={categories}
          />
        );

      case "hod":
        return (
          <RequestsHOD
            UserAllDetails={UserAllDetails}
            categories={categories}
          />
        );

      case "hr":
        return (
          <RequestHr
            UserAllDetails={UserAllDetails}
            categories={categories}
          />
        );

      case "finance":
        return (
          <RequestFinance
            UserAllDetails={UserAllDetails}
            categories={categories}
          />
        );

      default:
        return (
          <MyExpense
            UserAllDetails={UserAllDetails}
            categories={categories}
          />
        );
    }
  };

  // ── VIEW: Policies / Analytics ────────────────────────────────────────────
  const RenderPolicies = () => <PoliciesTab />;
  const RenderAnalytics = () => <AnalyticsTab />;

  return (
    <div className="space-y-8 p-6 bg-[#F8FAFC] min-h-screen">

      {/* HEADER */}
      <ExpenseHeader
        activeTab={activeTab}
        setIsDialogOpen={setIsDialogOpen}
        setIsExpenseDialogOpen={setIsExpenseDialogOpen}
      />

      {/* TABS */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-8"
      >
        <TabsList className="w-full">
          <TabsTrigger value="requests">
            <ClipboardList className="w-4 h-4" /> Requests
          </TabsTrigger>
          <TabsTrigger value="categories">
            <LayoutGrid className="w-4 h-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="policies">
            <ShieldAlert className="w-4 h-4" /> Policies
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="outline-none">
          {RenderCategories()}
        </TabsContent>
        <TabsContent value="requests" className="outline-none">
          {RenderRequests()}
        </TabsContent>
        <TabsContent value="policies" className="outline-none">
          {RenderPolicies()}
        </TabsContent>
        <TabsContent value="analytics" className="outline-none">
          {RenderAnalytics()}
        </TabsContent>
      </Tabs>

      {/* FOOTER GUIDELINES */}
      <Card className="border-purple-200 bg-purple-50 shadow-none rounded-[32px] mt-10">
        <CardContent className="p-8">
          <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2 text-lg">
            <Info className="w-5 h-5 text-purple-600" /> Expense System Guidelines
          </h3>
          <ul className="space-y-3 text-sm text-purple-800">
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 mt-0.5 text-purple-600 bg-purple-100 rounded-full p-1" />
              <span>
                <strong>Category Limits:</strong> Enforce maximum BDT amounts to
                maintain fiscal discipline.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 mt-0.5 text-purple-600 bg-purple-100 rounded-full p-1" />
              <span>
                <strong>Policy Rules:</strong> All updates are reflected
                immediately across the company claim forms.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* DIALOGS */}
      <CreateCategoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
      <SubmitExpenseDialog
        isOpen={isExpenseDialogOpen}
        onClose={() => setIsExpenseDialogOpen(false)}
        categories={categories}
      />
    </div>
  );
};

export default ExpensePage;