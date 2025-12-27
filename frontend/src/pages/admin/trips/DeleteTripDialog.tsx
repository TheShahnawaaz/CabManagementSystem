import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Trip } from '@/types/trip.types';

interface DeleteTripDialogProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

export function DeleteTripDialog({
  isOpen,
  trip,
  onClose,
  onConfirm,
  submitting,
}: DeleteTripDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Trip</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{trip?.trip_title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {trip && trip.booking_count && trip.booking_count > 0 && (
          <div className="my-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded text-sm">
            ⚠️ This trip has {trip.booking_count} booking(s). You may not be able to delete it.
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={submitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {submitting ? 'Deleting...' : 'Delete Trip'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

