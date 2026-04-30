"use client";
import React from "react";
import {
  Settings,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock status labels (4 workflow stages)
const STATUS_LABELS = {
  manager_review: "Manager Review",
  dept_head_review: "Dept Head Review",
  hr_review: "HR Review",
  ceo_review: "CEO Review",
};

// Mock helper for status badge colors + text
const getStatusInfo = (status) => {
  const map = {
    manager_review: {
      color: "bg-amber-100 text-amber-700",
      text: "Manager Review",
      icon: Clock,
    },
    dept_head_review: {
      color: "bg-blue-100 text-blue-700",
      text: "Dept Head Review",
      icon: AlertCircle,
    },
    hr_review: {
      color: "bg-purple-100 text-purple-700",
      text: "HR Review",
      icon: AlertCircle,
    },
    ceo_review: {
      color: "bg-orange-100 text-orange-700",
      text: "CEO Review",
      icon: AlertCircle,
    },
    completed: {
      color: "bg-emerald-100 text-emerald-700",
      text: "Completed",
      icon: CheckCircle,
    },
    draft: {
      color: "bg-slate-100 text-slate-600",
      text: "Draft",
      icon: Clock,
    },
  };
  return (
    map[status] || {
      color: "bg-slate-100 text-slate-600",
      text: status || "Unknown",
      icon: Clock,
    }
  );
};

// Mock appraisals data — replace with real API later
const filteredAppraisals = [
  {
    id: "1",
    employee_name: "Jubair Ahmed",
    appraisal_period: "2024-Annual",
    status: "manager_review",
    updated_date: "2026-04-29",
  },
  {
    id: "2",
    employee_name: "Faruk Islam",
    appraisal_period: "2024-Annual",
    status: "dept_head_review",
    updated_date: "2026-04-28",
  },
  {
    id: "3",
    employee_name: "Lisa Chen",
    appraisal_period: "2024-Annual",
    status: "hr_review",
    updated_date: "2026-04-27",
  },
  {
    id: "4",
    employee_name: "James Rodriguez",
    appraisal_period: "2024-Annual",
    status: "completed",
    updated_date: "2026-04-26",
  },
  {
    id: "5",
    employee_name: "Sarah Johnson",
    appraisal_period: "2024-Annual",
    status: "manager_review",
    updated_date: "2026-04-25",
  },
];

const ApprovalWorkflow = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Performance Appraisal Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">

            {/* Workflow Explanation */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">4-Step Appraisal Process</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                    1
                  </div>
                  <h4 className="font-medium text-sm">Reporting Manager</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Manager fills performance review and ratings
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                    2
                  </div>
                  <h4 className="font-medium text-sm">Department Head</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Department head reviews and adds feedback
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                    3
                  </div>
                  <h4 className="font-medium text-sm">HR Head</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    HR head finalizes and updates records
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                    4
                  </div>
                  <h4 className="font-medium text-sm">CEO (Optional)</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    CEO reviews senior-level employees
                  </p>
                </div>
              </div>
            </div>

            {/* Current Pending Reviews */}
            <div>
              <h3 className="font-semibold mb-4">Pending Reviews by Role</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(STATUS_LABELS).map(([status, label]) => {
                  const pending = filteredAppraisals.filter(
                    (app) => app.status === status
                  );

                  return (
                    <Card
                      key={status}
                      className="border-l-4 border-l-yellow-500"
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <h4 className="font-medium text-sm">{label}</h4>
                          <p className="text-2xl font-bold text-yellow-600 mt-2">
                            {pending.length}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Pending</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="font-semibold mb-4">Recent Appraisal Activity</h3>
              <div className="space-y-3">
                {filteredAppraisals
                  .filter((app) => app.status !== "draft")
                  .sort(
                    (a, b) =>
                      new Date(b.updated_date).getTime() -
                      new Date(a.updated_date).getTime()
                  )
                  .slice(0, 5)
                  .map((appraisal) => (
                    <div
                      key={appraisal.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{appraisal.employee_name}</p>
                        <p className="text-sm text-gray-600">
                          {appraisal.appraisal_period} •{" "}
                          {getStatusInfo(appraisal.status).text}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Updated: {appraisal.updated_date}
                        </p>
                        <Badge
                          className={getStatusInfo(appraisal.status).color}
                        >
                          {getStatusInfo(appraisal.status).text}
                        </Badge>
                      </div>
                    </div>
                  ))}
                {filteredAppraisals.filter((app) => app.status !== "draft")
                  .length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalWorkflow;