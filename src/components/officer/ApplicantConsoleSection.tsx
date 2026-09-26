"use client";

import React, { useState } from "react";
import { mockApplicants } from "@/lib/mockData/mockApplicants";
import { ApplicantFilterBar, FilterState } from "@/components/officer/ApplicantFilterBar";
import { ApplicantTable } from "@/components/officer/ApplicantTable";

export function ApplicantConsoleSection() {
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
    <div className="app-card rounded-2xl shadow-xl border border-border-default/80 overflow-hidden">
      <ApplicantFilterBar filters={filters} onFilterChange={setFilters} />

      <div className="p-0 border-t border-border-default">
        <ApplicantTable applicants={filteredApplicants} />
      </div>

      {/* Simple pagination/footer area */}
      <div className="bg-surface-subtle border-t border-border-default p-4 flex items-center justify-between text-xs text-muted">
        <span>Showing {filteredApplicants.length} of {mockApplicants.length} applications</span>
        <div className="flex space-x-2">
          <button className="min-h-[44px] px-4 py-2 rounded-xl bg-surface border border-border-default text-muted cursor-not-allowed opacity-50 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">Previous</button>
          <button className="min-h-[44px] px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border-default text-main transition-colors flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">Next</button>
        </div>
      </div>
    </div>
  );
}
