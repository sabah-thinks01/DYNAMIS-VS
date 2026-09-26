import { mockOfficerStats } from "@/lib/mockData/mockApplicants";
import { OfficerStatSummary } from "@/components/officer/OfficerStatSummary";
import { ApplicantConsoleSection } from "@/components/officer/ApplicantConsoleSection";

export default function OfficerConsolePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-border-default pb-4 flex items-end justify-between">
        <div>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold border border-border-strong text-muted bg-surface-subtle tracking-wide"
          >
            Internal SCA Portal
          </span>
          <h1 className="page-title mt-2">
            Officer Review Console
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Monitor incoming applications, evaluate viability scores, and process scheme loans
          </p>
        </div>

        {/* Placeholder for future action button like "Export Report" */}
        <button className="hidden sm:flex items-center justify-center min-h-[44px] px-5 py-2 bg-surface-subtle hover:bg-surface-hover text-main text-xs font-semibold rounded-xl border border-border-default transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* KPI Stats Summary */}
      <OfficerStatSummary stats={mockOfficerStats} />

      {/* Interactive filter + table section */}
      <ApplicantConsoleSection />
    </div>
  );
}
