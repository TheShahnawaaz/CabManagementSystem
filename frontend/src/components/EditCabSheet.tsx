import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { allocationApi } from "@/services/allocation.service";
import type { CabAllocation, Hall } from "@/types/allocation.types";
import { HALLS } from "@/types/booking.types";
import { isValidIndianPhone } from "@/lib/utils";

interface EditCabSheetProps {
  tripId: string;
  cab: CabAllocation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditCabSheet({
  tripId,
  cab,
  open,
  onOpenChange,
  onSuccess,
}: EditCabSheetProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    cab_number: string;
    cab_type: string;
    cab_owner_name: string;
    cab_owner_phone: string;
    pickup_region: Hall | "";
    passkey: string;
  }>({
    cab_number: "",
    cab_type: "",
    cab_owner_name: "",
    cab_owner_phone: "",
    pickup_region: "",
    passkey: "",
  });

  // Reset form when cab changes or when sheet opens
  useEffect(() => {
    if (cab && open) {
      setFormData({
        cab_number: cab.cab_number || "",
        cab_type: cab.cab_type || "omni",
        cab_owner_name: cab.driver_name || "",
        cab_owner_phone: cab.driver_phone || "",
        pickup_region: cab.pickup_region || "RK",
        passkey: cab.passkey || "",
      });
    }
  }, [cab, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cab?.id) {
      toast.error("Cab ID is missing");
      return;
    }

    // Validate passkey format
    if (!/^\d{4}$/.test(formData.passkey)) {
      toast.error("Passkey must be exactly 4 digits");
      return;
    }

    // Validate phone number using utility
    if (!isValidIndianPhone(formData.cab_owner_phone)) {
      toast.error("Please enter a valid 10-digit Indian phone number");
      return;
    }

    try {
      setLoading(true);
      const response = await allocationApi.updateCab(tripId, cab.id, formData);

      if (response.success) {
        toast.success("Cab updated successfully");
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Error updating cab:", error);
      toast.error((error as any).message || "Failed to update cab");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Cab Details</SheetTitle>
          <SheetDescription>
            Update cab information. Changes will be saved immediately.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Cab Number */}
          <div className="space-y-2">
            <Label htmlFor="cab_number">
              Cab Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cab_number"
              value={formData.cab_number}
              onChange={(e) =>
                setFormData({ ...formData, cab_number: e.target.value })
              }
              placeholder="e.g., TN-01-AB-1234"
              required
            />
          </div>

          {/* Cab Type */}
          <div className="space-y-2">
            <Label htmlFor="cab_type">
              Cab Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.cab_type}
              onValueChange={(value) =>
                setFormData({ ...formData, cab_type: value })
              }
            >
              <SelectTrigger id="cab_type">
                <SelectValue placeholder="Select cab type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="omni">Omni</SelectItem>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="hatchback">Hatchback</SelectItem>
                <SelectItem value="tempo">Tempo Traveller</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Driver Name */}
          <div className="space-y-2">
            <Label htmlFor="driver_name">
              Driver Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="driver_name"
              value={formData.cab_owner_name}
              onChange={(e) =>
                setFormData({ ...formData, cab_owner_name: e.target.value })
              }
              placeholder="Enter driver name"
              required
            />
          </div>

          {/* Driver Phone */}
          {/* Allow only 10-digit numbers and dont allow alphabets to be entered */}
          <div className="space-y-2">
            <Label htmlFor="driver_phone">
              Driver Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="driver_phone"
              type="tel"
              value={formData.cab_owner_phone}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, cab_owner_phone: digitsOnly });
              }}
              placeholder="10-digit phone number"
              maxLength={10}
              pattern="\d{10}"
              inputMode="numeric"
              required
            />
          </div>

          {/* Pickup Region */}
          <div className="space-y-2">
            <Label htmlFor="pickup_region">
              Pickup Region <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.pickup_region}
              onValueChange={(value: Hall) =>
                setFormData({ ...formData, pickup_region: value })
              }
            >
              <SelectTrigger id="pickup_region">
                <SelectValue placeholder="Select pickup region" />
              </SelectTrigger>
              <SelectContent>
                {HALLS.map((hall) => (
                  <SelectItem key={hall.value} value={hall.value}>
                    {hall.label} - {hall.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Passkey */}
          <div className="space-y-2">
            <Label htmlFor="passkey">
              Passkey (4 digits) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="passkey"
              type="text"
              value={formData.passkey}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, passkey: digitsOnly });
              }
              }
              placeholder="4-digit code"
              maxLength={4}
              pattern="\d{4}"
              className="font-mono text-lg"
              required
            />
            <p className="text-xs text-muted-foreground">
              Used by drivers to validate student QR codes
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
