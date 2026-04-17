"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  Contact,
  Lock,
  History,
  LayoutDashboard,
  Settings as SettingsIcon,
} from "lucide-react";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Your Custom Components
import AdminPanelHeader from "./AdminPanelCompo/AdminPanelHeader";
import UserManagementNew from "./AdminPanelCompo/UserManagementNew";
import PasswordManagement from "./AdminPanelCompo/PasswordManagement";
import EmployeeManagement from "./AdminPanelCompo/EmployeeManagement";
import ActivityLog from "./AdminPanelCompo/ActivityLog";
import SystemOverview from "./AdminPanelCompo/SystemOverview";
import Settings from "./AdminPanelCompo/Settings";

const AdminPanelPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Sync active tab with URL (?tab=...)
  const urlTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(urlTab);

  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    // This updates the URL without a full page reload
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  };

  return (
    <div className="p-6  space-y-6">
      <AdminPanelHeader />

      {/* ================= TABS ================= */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="grid w-full  md:grid-cols-6 lg:grid-cols-6">
          <TabsTrigger value="users">
            <Users className="w-4 h-4" /> User Management
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Contact className="w-4 h-4" /> Employee Management
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4" /> Password Management
          </TabsTrigger>
          <TabsTrigger value="logs">
            <History className="w-4 h-4" /> Activity Logs
          </TabsTrigger>
          <TabsTrigger value="overview">
            <History className="w-4 h-4" /> System Overview
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="w-4 h-4" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB CONTENT ================= */}

        <TabsContent value="users">
          <UserManagementNew />
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeManagement />
        </TabsContent>

        <TabsContent value="security">
          <PasswordManagement />
        </TabsContent>

        <TabsContent value="logs">
          <ActivityLog />
        </TabsContent>

        <TabsContent value="overview">
          <SystemOverview />
        </TabsContent>

        <TabsContent value="settings">
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanelPage;
