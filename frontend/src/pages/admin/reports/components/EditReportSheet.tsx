/**
 * Edit Report Sheet
 * Modal for editing cab cost and notes
 */

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabCost: number;
  notes: string | null;
  onSubmit: (data: {
    cab_cost?: number;
    notes?: string | null;
  }) => Promise<void>;
}

export function EditReportSheet({
  open,
  onOpenChange,
  cabCost,
  notes,
  onSubmit,
}: EditReportSheetProps) {
  const [cost, setCost] = useState(cabCost.toString());
  const [notesValue, setNotesValue] = useState(notes || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCost(cabCost.toString());
      setNotesValue(notes || "");
    }
  }, [open, cabCost, notes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newCost = parseFloat(cost);
    if (isNaN(newCost) || newCost < 0) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        cab_cost: newCost,
        // Send null to clear notes, string to update, undefined to skip
        notes: notesValue.trim() === "" ? null : notesValue.trim(),
      });
      onOpenChange(false);
    } catch {
      // Error handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Report</SheetTitle>
          <SheetDescription>
            Update the cab cost and notes for this report
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Cab Cost */}
          <div className="space-y-2">
            <Label htmlFor="cab_cost">
              Cost per Cab <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="cab_cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="300.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="pl-7"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              placeholder="Any observations or notes about this trip..."
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
