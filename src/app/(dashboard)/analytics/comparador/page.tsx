"use client";

import { AnalyticsShell } from "@/components/analytics/analytics-shell";
import { SnapshotHistoryPanel } from "@/components/analytics/snapshot-history-panel";

export default function AnalyticsComparadorPage() {
  return (
    <AnalyticsShell active="/analytics/comparador">
      <SnapshotHistoryPanel />
    </AnalyticsShell>
  );
}
