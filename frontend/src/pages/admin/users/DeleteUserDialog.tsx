import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { UserWithStats } from "@/types/user.types";

interface DeleteUserDialogProps {
  isOpen: boolean;
  user: UserWithStats | null;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

export function DeleteUserDialog({
  isOpen,
  user,
  onClose,
  onConfirm,
  submitting,
}: DeleteUserDialogProps) {
  if (!user) return null;

  const hasBookings = (user.booking_count || 0) > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User Account</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              Are you sure you want to delete the account for{" "}
              <span className="font-semibold text-foreground">{user.name}</span>{" "}
              ({user.email})?
            </div>

            {user.is_admin && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-md">
                <p className="text-purple-900 dark:text-purple-100 text-sm font-medium flex items-center gap-2">
                  <Badge className="bg-purple-500">Admin</Badge>
                  This user has admin privileges
                </p>
              </div>
            )}

            {hasBookings ? (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-900 dark:text-red-100 text-sm font-medium">
                  ⚠️ Cannot Delete
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  This user has {user.booking_count} booking
                  {user.booking_count !== 1 ? "s" : ""}. User data must be
                  retained for record-keeping purposes.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-md">
                <p className="text-orange-900 dark:text-orange-100 text-sm font-medium">
                  ⚠️ This action cannot be undone
                </p>
                <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
                  All user data including profile information will be
                  permanently deleted.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (!hasBookings) {
                onConfirm();
              }
            }}
            disabled={submitting || hasBookings}
            className="bg-red-600 hover:bg-red-700"
          >
            {submitting ? "Deleting..." : "Delete User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
