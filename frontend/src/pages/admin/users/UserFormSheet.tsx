import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { UserWithStats } from "@/types/user.types";
import type { UserFormState } from "./types";

interface UserFormSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: UserWithStats | null;
  formState: UserFormState;
  onFormChange: (updates: Partial<UserFormState>) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function UserFormSheet({
  isOpen,
  onOpenChange,
  editingUser,
  formState,
  onFormChange,
  onSubmit,
  submitting,
}: UserFormSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {editingUser ? "Edit User" : "Create New User"}
          </SheetTitle>
          <SheetDescription>
            {editingUser
              ? "Update user details. Changes will be reflected immediately."
              : "Add a new user to the system. They can log in with Google OAuth."}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formState.name}
              onChange={(e) => onFormChange({ name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formState.email}
              onChange={(e) => onFormChange({ email: e.target.value })}
              placeholder="john.doe@example.com"
              disabled={!!editingUser} // Email cannot be changed after creation
            />
            {editingUser && (
              <p className="text-xs text-muted-foreground">
                Email cannot be changed after user creation
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center px-3 bg-muted rounded-md border text-sm">
                +91
              </div>
              <Input
                id="phone_number"
                type="tel"
                value={formState.phone_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  onFormChange({ phone_number: value });
                }}
                placeholder="9876543210"
                maxLength={10}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              10-digit Indian mobile number (without +91)
            </p>
          </div>

          {/* Admin Checkbox */}
          {!editingUser && (
            <div className="flex items-center space-x-2 rounded-md border p-4">
              <Checkbox
                id="is_admin"
                checked={formState.is_admin}
                onCheckedChange={(checked) =>
                  onFormChange({ is_admin: checked === true })
                }
              />
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="is_admin"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Grant Admin Privileges
                </Label>
                <p className="text-xs text-muted-foreground">
                  Admin users can manage trips, vehicles, and other users
                </p>
              </div>
            </div>
          )}

          {editingUser?.is_admin && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-md">
              <p className="text-purple-900 dark:text-purple-100 text-sm">
                This user has admin privileges. Use the "Toggle Admin" action in
                the table to change their role.
              </p>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting
              ? editingUser
                ? "Updating..."
                : "Creating..."
              : editingUser
                ? "Update User"
                : "Create User"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
