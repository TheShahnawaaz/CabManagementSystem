/**
 * Adjustment Form Sheet
 * Modal for adding/editing income or expense adjustments
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADJUSTMENT_CATEGORIES } from "@/constants/report.constants";
import type { AdjustmentType, ReportAdjustment } from "@/types/report.types";

interface AdjustmentFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: AdjustmentType;
  adjustment: ReportAdjustment | null;
  onSubmit: (data: {
    category: string;
    description?: string;
    amount: number;
  }) => Promise<void>;
}

export function AdjustmentFormSheet({
  open,
  onOpenChange,
  type,
  adjustment,
  onSubmit,
}: AdjustmentFormSheetProps) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!adjustment;
  const categories = ADJUSTMENT_CATEGORIES[type];

  useEffect(() => {
    if (open) {
      if (adjustment) {
        setCategory(adjustment.category);
        setDescription(adjustment.description || "");
        setAmount(adjustment.amount.toString());
      } else {
        setCategory("");
        setDescription("");
        setAmount("");
      }
    }
  }, [open, adjustment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = parseFloat(amount);
    if (!category || isNaN(amountValue) || amountValue <= 0) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        category,
        description: description.trim() || undefined,
        amount: amountValue,
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
          <SheetTitle>
            {isEditing ? "Edit" : "Add"}{" "}
            {type === "income" ? "Income" : "Expense"}
          </SheetTitle>
          <SheetDescription>
            {type === "income"
              ? "Add additional income like cash collection or donations"
              : "Add additional expenses like fuel reimbursement or tolls"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              placeholder={
                type === "income"
                  ? "e.g., Cash collected from 2 walk-in students"
                  : "e.g., Extra fuel for long detour"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
            <Button type="submit" disabled={submitting || !category || !amount}>
              {submitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : `Add ${type === "income" ? "Income" : "Expense"}`}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
