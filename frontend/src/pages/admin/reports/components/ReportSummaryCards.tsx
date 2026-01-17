/**
 * Report Summary Cards
 * Displays aggregated stats across all reports using StatCard components
 */

import { FileText, Users, Wallet, PiggyBank } from "lucide-react";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import { formatCurrency } from "@/constants/report.constants";
import type { ReportsSummary } from "@/types/report.types";

interface ReportSummaryCardsProps {
  summary: ReportsSummary | null;
  loading: boolean;
}

export function ReportSummaryCards({
  summary,
  loading,
}: ReportSummaryCardsProps) {
  if (loading) {
    return <ReportSummaryCardsSkeleton />;
  }

  if (!summary) {
    return null;
  }

  // Parse numeric values (may come as strings from DB)
  const netBalance = Number(summary.total_net_profit) || 0;
  const avgStudentsPerTrip = Number(summary.avg_students_per_trip) || 0;
  const totalGrossRevenue = Number(summary.total_gross_revenue) || 0;
  const totalNetRevenue = Number(summary.total_net_revenue) || 0;
  const totalReports = Number(summary.total_reports) || 0;
  const totalStudents = Number(summary.total_students) || 0;
  const totalCabs = Number(summary.total_cabs) || 0;

  const isSurplus = netBalance >= 0;

  return (
    <StatCardGrid columns={4} className="mb-6">
      <StatCard
        value={totalReports}
        label="Total Reports"
        description={`${avgStudentsPerTrip.toFixed(1)} avg students/trip`}
        icon={FileText}
        color="blue"
        variant="stacked"
      />
      <StatCard
        value={totalStudents}
        label="Total Students"
        description={`${totalCabs} cabs used`}
        icon={Users}
        color="purple"
        variant="stacked"
      />
      <StatCard
        value={totalGrossRevenue}
        formatter={formatCurrency}
        label="Total Revenue"
        description={`${formatCurrency(totalNetRevenue)} after fees`}
        icon={Wallet}
        color="green"
        variant="stacked"
      />
      <StatCard
        value={Math.abs(netBalance)}
        formatter={(n) => (isSurplus ? "" : "-") + formatCurrency(n)}
        label={isSurplus ? "Surplus" : "Deficit"}
        description={
          isSurplus ? "Income exceeds expenses" : "Expenses exceed income"
        }
        icon={PiggyBank}
        color={isSurplus ? "green" : "red"}
        variant="stacked"
      />
    </StatCardGrid>
  );
}

function ReportSummaryCardsSkeleton() {
  return (
    <StatCardGrid columns={4} className="mb-6">
      <StatCard
        value={0}
        label="Total Reports"
        icon={FileText}
        color="blue"
        variant="stacked"
        loading
      />
      <StatCard
        value={0}
        label="Total Students"
        icon={Users}
        color="purple"
        variant="stacked"
        loading
      />
      <StatCard
        value={0}
        label="Total Revenue"
        icon={Wallet}
        color="green"
        variant="stacked"
        loading
      />
      <StatCard
        value={0}
        label="Balance"
        icon={PiggyBank}
        color="green"
        variant="stacked"
        loading
      />
    </StatCardGrid>
  );
}
