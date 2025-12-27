import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TripStats } from './TripStats';
import { TripStatsSkeleton } from './TripStatsSkeleton';
import { TripTableSkeleton } from './TripTableSkeleton';
import { TripFormSheet } from './TripFormSheet';
import { DeleteTripDialog } from './DeleteTripDialog';
import { DataTable } from './DataTable';
import { createColumns } from './columns';
import { useTripManagement } from './useTripManagement';
import type { Trip } from '@/types/trip.types';

export default function TripManagement() {
  const navigate = useNavigate();
  const {
    state,
    formState,
    updateFormState,
    handleSubmit,
    handleDelete,
    openCreateSheet,
    openEditSheet,
    openDeleteDialog,
    closeSheet,
    closeDeleteDialog,
  } = useTripManagement();

  const handleViewDetails = (trip: Trip) => {
    navigate(`/admin/trips/${trip.id}`);
  };

  const columns = createColumns(openEditSheet, openDeleteDialog, handleViewDetails);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Trip Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage Friday cab trips
          </p>
        </div>
        <Button onClick={openCreateSheet}>
          <Plus className="w-4 h-4 mr-2" />
          Create Trip
        </Button>
      </div>

      {/* Stats Cards */}
      {state.loading ? (
        <TripStatsSkeleton />
      ) : (
        <TripStats trips={state.trips} />
      )}

      {/* Data Table */}
      {state.loading ? (
        <TripTableSkeleton />
      ) : (
        <DataTable columns={columns} data={state.trips} />
      )}

      {/* Create/Edit Sheet */}
      <TripFormSheet
        isOpen={state.isSheetOpen}
        onOpenChange={(open) => !open && closeSheet()}
        editingTrip={state.editingTrip}
        formState={formState}
        onFormChange={updateFormState}
        onSubmit={handleSubmit}
        submitting={state.submitting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteTripDialog
        isOpen={state.isDeleteDialogOpen}
        trip={state.deletingTrip}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        submitting={state.submitting}
      />
    </div>
  );
}

