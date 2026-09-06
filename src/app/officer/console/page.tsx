"use client";

import React, { useState } from "react";
import { mockApplicants, mockOfficerStats } from "@/lib/mockData/mockApplicants";
import { OfficerStatSummary } from "@/components/officer/OfficerStatSummary";
import { ApplicantFilterBar, FilterState } from "@/components/officer/ApplicantFilterBar";
import { ApplicantTable } from "@/components/officer/ApplicantTable";

export default function OfficerConsolePage() {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    status: "all",
    risk: "all",
  });

  // Client-side filtering logic
  const filteredApplicants = mockApplicants.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      app.businessType.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    const matchesStatus = filters.status === "all" || app.status === filters.status;
    const matchesRisk = filters.risk === "all" || app.riskLevel === filters.risk;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 pb-4 flex items-end justify-between">
        <div>
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full accent-text"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent-from) 12%, transparent)",
              borderWidth: "1px", borderStyle: "solid", borderColor: "var(--accent-border)",
            }}
          >
            Internal SCA Portal
          </span>
          <h1 className="text-2xl font-extrabold text-slate-100 mt-1">
            Officer Review Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor incoming applications, evaluate viability scores, and process scheme loans
          </p>
        </div>
        
        {/* Placeholder for future action button like "Export Report" */}
        <button className="hidden sm:flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* KPI Stats Summary */}
      <OfficerStatSummary stats={mockOfficerStats} />

      {/* Main Table View Wrapper */}
      <div className="glass-card rounded-2xl shadow-xl border border-slate-700/80 overflow-hidden">
        <ApplicantFilterBar filters={filters} onFilterChange={setFilters} />
        
        <div className="p-0 border-t border-slate-800">
          <ApplicantTable applicants={filteredApplicants} />
        </div>
        
        {/* Simple pagination/footer area */}
        <div className="bg-slate-900/50 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredApplicants.length} of {mockApplicants.length} applications</span>
          <div className="flex space-x-1">
            <button className="px-3 py-1 rounded bg-slate-800 text-slate-500 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
