/**
 * Report Detail Page
 * View and edit a single report with all financial details
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  Users,
  Car,
  Wallet,
  Receipt,
  PiggyBank,
  History,
  Plus,
  Pencil,
  Trash2,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import {
  formatCurrency,
  getCategoryLabel,
  getCategoryIcon,
} from "@/constants/report.constants";
import { useReportDetail } from "./useReportManagement";
import { AdjustmentFormSheet } from "./components/AdjustmentFormSheet";
import { EditReportSheet } from "./components/EditReportSheet";
import { ReportHistorySheet } from "./components/ReportHistorySheet";
import type { ReportAdjustment, AdjustmentType } from "@/types/report.types";

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  const {
    report,
    history,
    loading,
    historyLoading,
    fetchHistory,
    updateReport,
    addAdjustment,
    updateAdjustment,
    deleteAdjustment,
  } = useReportDetail(reportId);

  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [historySheetOpen, setHistorySheetOpen] = useState(false);
  const [adjustmentSheetOpen, setAdjustmentSheetOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] =
    useState<AdjustmentType>("expense");
  const [editingAdjustment, setEditingAdjustment] =
    useState<ReportAdjustment | null>(null);

  const handleOpenHistory = () => {
    fetchHistory();
    setHistorySheetOpen(true);
  };

  const handleAddAdjustment = (type: AdjustmentType) => {
    setAdjustmentType(type);
    setEditingAdjustment(null);
    setAdjustmentSheetOpen(true);
  };

  const handleEditAdjustment = (adjustment: ReportAdjustment) => {
    setAdjustmentType(adjustment.adjustment_type);
    setEditingAdjustment(adjustment);
    setAdjustmentSheetOpen(true);
  };

  if (loading) {
    return <ReportDetailSkeleton />;
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Report not found</h2>
          <p className="text-muted-foreground mb-4">
            The report you're looking for doesn't exist
          </p>
          <Button onClick={() => navigate("/admin/reports")}>
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  // Parse numeric values (may come as strings from DB)
  const netBalance = Number(report.net_profit) || 0;
  const grossRevenue = Number(report.gross_revenue) || 0;
  const totalIncome = Number(report.total_income) || 0;
  const totalExpense = Number(report.total_expense) || 0;
  const isSurplus = netBalance >= 0;
  const tripDate = new Date(report.trip_date);

  // Separate adjustments by type
  const incomeAdjustments = report.adjustments.filter(
    (a) => a.adjustment_type === "income"
  );
  const expenseAdjustments = report.adjustments.filter(
    (a) => a.adjustment_type === "expense"
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/reports")}
            className="mb-2 -ml-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <h1 className="text-3xl font-bold">
            {format(tripDate, "EEEE, MMMM d, yyyy")}
          </h1>
          <p className="text-muted-foreground mt-1">{report.trip_title}</p>
        </div>
        <Button variant="outline" onClick={handleOpenHistory}>
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </div>

      {/* Summary Cards - Using StatCard for consistency */}
      <StatCardGrid columns={4}>
        <StatCard
          value={grossRevenue}
          formatter={formatCurrency}
          label="Gross Revenue"
          description={`${report.confirmed_payments} payments`}
          icon={Wallet}
          color="blue"
          variant="stacked"
        />
        <StatCard
          value={totalIncome}
          formatter={formatCurrency}
          label="Total Income"
          description={`${report.confirmed_payments} payments + ${report.adjustment_income_count || 0} other`}
          icon={ArrowUpRight}
          color="green"
          variant="stacked"
        />
        <StatCard
          value={totalExpense}
          formatter={formatCurrency}
          label="Total Expenses"
          description={`${report.total_cabs} cabs + ${report.adjustment_expense_count || 0} other`}
          icon={Receipt}
          color="red"
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
              Income
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddAdjustment("income")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Online Payments */}
            <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Online Payments</p>
                  <p className="text-xs text-muted-foreground">
                    {report.confirmed_payments} confirmed
                  </p>
                </div>
              </div>
              <p className="font-semibold">
                {formatCurrency(report.gross_revenue)}
              </p>
            </div>

            {/* Gateway Fees */}
            <div className="flex items-center justify-between py-2 px-3 text-sm text-muted-foreground">
              <span className="ml-11">Gateway fees</span>
              <span className="text-red-600">
                -{formatCurrency(Number(report.gateway_fees) + Number(report.gateway_tax))}
              </span>
            </div>

            {/* Net from Online */}
            <div className="flex items-center justify-between py-2 px-3 text-sm border-t">
              <span className="ml-11 font-medium">Net received</span>
              <span className="font-medium">
                {formatCurrency(report.net_revenue)}
              </span>
            </div>

            {/* Additional Income */}
            {incomeAdjustments.map((adj) => {
              const Icon = getCategoryIcon("income", adj.category);
              return (
                <div
                  key={adj.id}
                  className="flex items-center justify-between py-2 px-3 bg-green-500/5 rounded-lg group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {getCategoryLabel("income", adj.category)}
                      </p>
                      {adj.description && (
                        <p className="text-xs text-muted-foreground">
                          {adj.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">
                      +{formatCurrency(adj.amount)}
                    </span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEditAdjustment(adj)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteAdjustment(adj.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            <Separator />

            {/* Total Income */}
            <div className="flex items-center justify-between py-2 font-semibold">
              <span>Total Income</span>
              <span className="text-green-600">
                {formatCurrency(report.total_income)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-red-600" />
              Expenses
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditSheetOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit Cab Cost
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddAdjustment("expense")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Cab Expense */}
            <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Cab Expense</p>
                  <p className="text-xs text-muted-foreground">
                    {report.total_cabs} cabs × {formatCurrency(report.cab_cost)}
                  </p>
                </div>
              </div>
              <p className="font-semibold">
                {formatCurrency(report.total_cab_expense)}
              </p>
            </div>

            {/* Additional Expenses */}
            {expenseAdjustments.map((adj) => {
              const Icon = getCategoryIcon("expense", adj.category);
              return (
                <div
                  key={adj.id}
                  className="flex items-center justify-between py-2 px-3 bg-red-500/5 rounded-lg group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {getCategoryLabel("expense", adj.category)}
                      </p>
                      {adj.description && (
                        <p className="text-xs text-muted-foreground">
                          {adj.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(adj.amount)}
                    </span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEditAdjustment(adj)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteAdjustment(adj.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            <Separator />

            {/* Total Expenses */}
            <div className="flex items-center justify-between py-2 font-semibold">
              <span>Total Expenses</span>
              <span className="text-red-600">
                -{formatCurrency(report.total_expense)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trip Stats */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Trip Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatCardGrid columns={4}>
            <StatCard
              value={Number(report.total_students) || 0}
              label="Total Students"
              description={`${report.confirmed_payments} confirmed`}
              icon={Users}
              color="blue"
              variant="stacked"
            />
            <StatCard
              value={Number(report.pickup_count) || 0}
              label="Pickup Journeys"
              description={`${report.no_show_pickup} no-show`}
              icon={ArrowUpRight}
              color="green"
              variant="stacked"
            />
            <StatCard
              value={Number(report.dropoff_count) || 0}
              label="Return Journeys"
              description={`${report.no_show_dropoff} stayed back`}
              icon={ArrowDownRight}
              color="purple"
              variant="stacked"
            />
            <StatCard
              value={Number(report.seat_utilization) || 0}
              formatter={(n) => `${n.toFixed(1)}%`}
              label="Seat Utilization"
              description={`${report.total_cabs} cabs used`}
              icon={Car}
              color="orange"
              variant="stacked"
            />
          </StatCardGrid>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card className="bg-muted/30">
        <CardContent className="pt-5">
          <div className="flex gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold">Notes</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setEditSheetOpen(true)}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              {report.notes ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {report.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No notes added
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Report Sheet */}
      <EditReportSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        cabCost={report.cab_cost}
        notes={report.notes}
        onSubmit={updateReport}
      />

      {/* Adjustment Form Sheet */}
      <AdjustmentFormSheet
        open={adjustmentSheetOpen}
        onOpenChange={setAdjustmentSheetOpen}
        type={adjustmentType}
        adjustment={editingAdjustment}
        onSubmit={async (data) => {
          if (editingAdjustment) {
            await updateAdjustment(editingAdjustment.id, data);
          } else {
            await addAdjustment({ ...data, adjustment_type: adjustmentType });
          }
        }}
      />

      {/* History Sheet */}
      <ReportHistorySheet
        open={historySheetOpen}
        onOpenChange={setHistorySheetOpen}
        history={history}
        loading={historyLoading}
      />
    </div>
  );
}

function ReportDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-48 mt-2" />
      </div>

      {/* Summary Cards Skeleton */}
      <StatCardGrid columns={4}>
        <StatCard
          value={0}
          label="Gross Revenue"
          icon={Wallet}
          color="blue"
          variant="stacked"
          loading
        />
        <StatCard
          value={0}
          label="Total Income"
          icon={ArrowUpRight}
          color="green"
          variant="stacked"
          loading
        />
        <StatCard
          value={0}
          label="Total Expenses"
          icon={Receipt}
          color="red"
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

      {/* Income/Expenses Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trip Statistics Skeleton */}
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <StatCardGrid columns={4}>
            <StatCard
              value={0}
              label="Total Students"
              icon={Users}
              color="blue"
              variant="stacked"
              loading
            />
            <StatCard
              value={0}
              label="Pickup Journeys"
              icon={ArrowUpRight}
              color="green"
              variant="stacked"
              loading
            />
            <StatCard
              value={0}
              label="Return Journeys"
              icon={ArrowDownRight}
              color="purple"
              variant="stacked"
              loading
            />
            <StatCard
              value={0}
              label="Seat Utilization"
              icon={Car}
              color="orange"
              variant="stacked"
              loading
            />
          </StatCardGrid>
        </CardContent>
      </Card>

      {/* Notes Skeleton */}
      <Card className="bg-muted/30">
        <CardContent className="pt-5">
          <div className="flex gap-3">
            <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
