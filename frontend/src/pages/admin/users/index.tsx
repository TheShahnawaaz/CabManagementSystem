import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserStats } from "./UserStats";
import { UserStatsSkeleton } from "./UserStatsSkeleton";
import { UserTableSkeleton } from "./UserTableSkeleton";
import { UserFormSheet } from "./UserFormSheet";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { DataTable } from "./DataTable";
import { createColumns } from "./columns";
import { useUserManagement } from "./useUserManagement";

export default function UserManagement() {
  const {
    state,
    formState,
    updateFormState,
    handleSubmit,
    handleDelete,
    handleToggleAdmin,
    openCreateSheet,
    openEditSheet,
    openDeleteDialog,
    closeSheet,
    closeDeleteDialog,
  } = useUserManagement();

  const columns = createColumns(
    openEditSheet,
    openDeleteDialog,
    handleToggleAdmin
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users and administrators
          </p>
        </div>
        <Button onClick={openCreateSheet}>
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Stats Cards */}
      {state.loading ? (
        <UserStatsSkeleton />
      ) : (
        <UserStats users={state.users} />
      )}

      {/* Data Table */}
      {state.loading ? (
        <UserTableSkeleton />
      ) : (
        <DataTable columns={columns} data={state.users} />
      )}

      {/* Create/Edit Sheet */}
      <UserFormSheet
        isOpen={state.isSheetOpen}
        onOpenChange={(open) => !open && closeSheet()}
        editingUser={state.editingUser}
        formState={formState}
        onFormChange={updateFormState}
        onSubmit={handleSubmit}
        submitting={state.submitting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        isOpen={state.isDeleteDialogOpen}
        user={state.deletingUser}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        submitting={state.submitting}
      />
    </div>
  );
}
