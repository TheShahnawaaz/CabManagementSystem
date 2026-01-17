/**
 * Create Report Dialog
 * Modal for creating a new report for a trip
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  Car,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/constants/report.constants";
import type { TripWithoutReport } from "@/types/report.types";

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: TripWithoutReport | null;
  onSubmit: (data: {
    trip_id: string;
    cab_cost: number;
    notes?: string;
  }) => Promise<string>;
}

export function CreateReportDialog({
  open,
  onOpenChange,
  trip,
  onSubmit,
}: CreateReportDialogProps) {
  const navigate = useNavigate();
  const [cabCost, setCabCost] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;

    const cost = parseFloat(cabCost);
    if (isNaN(cost) || cost < 0) {
      return;
    }

    try {
      setSubmitting(true);
      const reportId = await onSubmit({
        trip_id: trip.trip_id,
        cab_cost: cost,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
      setCabCost("");
      setNotes("");
      navigate(`/admin/reports/${reportId}`);
    } catch {
      // Error handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!submitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setCabCost("");
        setNotes("");
      }
    }
  };

  if (!trip) return null;

  const tripDate = new Date(trip.trip_date);
  const grossRevenue = Number(trip.gross_revenue) || 0;
  const totalCabs = Number(trip.total_cabs) || 0;
  const cabCostNum = parseFloat(cabCost) || 0;
  const estimatedCabExpense = totalCabs * cabCostNum;
  const estimatedBalance = grossRevenue - estimatedCabExpense;
  const isSurplus = estimatedBalance >= 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Financial Report</DialogTitle>
          <DialogDescription>
            Enter the cab cost to generate a financial report for this trip
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Trip Info Card */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 mb-6 border border-primary/10">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">
                  {format(tripDate, "EEEE, MMMM d, yyyy")}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {trip.trip_title}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="gap-1.5 bg-background">
                    <Users className="h-3 w-3" />
                    {trip.total_students}
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 bg-background">
                    <Car className="h-3 w-3" />
                    {totalCabs}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="gap-1.5 bg-background text-green-600 border-green-500/30"
                  >
                    <Wallet className="h-3 w-3" />
                    {formatCurrency(grossRevenue)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Cab Cost */}
            <div className="space-y-2">
              <Label htmlFor="cab_cost" className="text-sm font-medium">
                Cost per Cab <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  ₹
                </span>
                <Input
                  id="cab_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="300.00"
                  value={cabCost}
                  onChange={(e) => setCabCost(e.target.value)}
                  className="pl-8 h-11 text-base"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Balance Preview */}
            {cabCostNum > 0 && (
              <div
                className={`rounded-lg p-4 ${isSurplus ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isSurplus ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      Estimated {isSurplus ? "Surplus" : "Deficit"}
                    </span>
                  </div>
                  <span
                    className={`text-lg font-bold ${isSurplus ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(Math.abs(estimatedBalance))}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-current/10 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(grossRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cab expense:</span>
                    <span className="font-medium text-foreground">
                      -{formatCurrency(estimatedCabExpense)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Additional adjustments can be added after creation
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes{" "}
                <span className="text-muted-foreground font-normal">
                  (Optional)
                </span>
              </Label>
              <textarea
                id="notes"
                placeholder="Any observations or notes about this trip..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !cabCost}
              className="min-w-[120px]"
            >
              {submitting ? "Creating..." : "Create Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
