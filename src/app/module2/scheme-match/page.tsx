import { SchemeMatchPanel } from "@/components/entrepreneur/SchemeMatchPanel";

export default function SchemeMatchPage() {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border-default">
        <h1 className="page-title">
          Which loans can you get?
        </h1>
        <p className="text-xs text-muted mb-2">Scheme Match</p>
      </div>

      <SchemeMatchPanel />
    </div>
  );
}
