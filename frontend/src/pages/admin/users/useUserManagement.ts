import { useState, useEffect } from "react";
import { toast } from "sonner";
import { userManagementApi } from "@/services/user.service";
import type { UserWithStats } from "@/types/user.types";
import type { UserManagementState, UserFormState } from "./types";

const getInitialFormData = (): UserFormState => ({
  name: "",
  email: "",
  phone_number: "",
  is_admin: false,
});

export function useUserManagement() {
  const [state, setState] = useState<UserManagementState>({
    users: [],
    loading: true,
    isSheetOpen: false,
    isDeleteDialogOpen: false,
    editingUser: null,
    deletingUser: null,
    submitting: false,
  });

  const [formState, setFormState] =
    useState<UserFormState>(getInitialFormData());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const response = await userManagementApi.getUsers({ sort: "desc" });
      if (response.success && response.data) {
        setState((prev) => ({ ...prev, users: response.data || [] }));
      }
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSubmit = async () => {
    try {
      setState((prev) => ({ ...prev, submitting: true }));

      // Validate
      if (!formState.name.trim() || !formState.email.trim()) {
        toast.error("Name and email are required");
        return;
      }

      // Normalize phone number
      const normalizedPhone =
        formState.phone_number.trim() === "" ? null : formState.phone_number;

      if (state.editingUser) {
        const response = await userManagementApi.updateUser(
          state.editingUser.id,
          {
            name: formState.name.trim(),
            phone_number: normalizedPhone,
          }
        );
        if (response.success) {
          toast.success("User updated successfully!");
          closeSheet();
          fetchUsers();
        }
      } else {
        const response = await userManagementApi.createUser({
          email: formState.email.trim(),
          name: formState.name.trim(),
          phone_number: normalizedPhone,
          is_admin: formState.is_admin,
        });
        if (response.success) {
          toast.success("User created successfully!");
          closeSheet();
          fetchUsers();
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Operation failed";

      if (message.includes("\n")) {
        const errors = message.split("\n").filter((err) => err.trim());
        toast.error("Validation Failed", {
          description: `${errors.length} error(s) found. Please check the form.`,
        });
        errors.forEach((err, index) => {
          setTimeout(() => {
            toast.error("Validation Error", {
              description: err,
              duration: 5000,
            });
          }, index * 100);
        });
      } else {
        toast.error("Operation Failed", {
          description: message,
        });
      }
      console.error("User operation error:", error);
    } finally {
      setState((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleDelete = async () => {
    if (!state.deletingUser) return;

    try {
      setState((prev) => ({ ...prev, submitting: true }));
      const response = await userManagementApi.deleteUser(
        state.deletingUser.id
      );

      if (response.success) {
        toast.success("User deleted successfully!");
        setState((prev) => ({
          ...prev,
          isDeleteDialogOpen: false,
          deletingUser: null,
        }));
        fetchUsers();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete user";

      if (message.includes("\n")) {
        const errors = message.split("\n").filter((err) => err.trim());
        toast.error("Delete Failed", {
          description: `${errors.length} error(s) occurred.`,
        });
        errors.forEach((err, index) => {
          setTimeout(() => {
            toast.error("Error", {
              description: err,
              duration: 5000,
            });
          }, index * 100);
        });
      } else {
        toast.error("Delete Failed", {
          description: message,
        });
      }
      console.error("Delete user error:", error);
    } finally {
      setState((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleToggleAdmin = async (user: UserWithStats) => {
    try {
      const action = user.is_admin ? "revoke" : "grant";
      const response = await userManagementApi.toggleAdminStatus(user.id);

      if (response.success) {
        toast.success(
          `Admin privileges ${action === "grant" ? "granted to" : "revoked from"} ${user.name}`
        );
        fetchUsers();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update admin status";
      toast.error("Operation Failed", {
        description: message,
      });
      console.error("Toggle admin error:", error);
    }
  };

  const openCreateSheet = () => {
    setState((prev) => ({ ...prev, editingUser: null, isSheetOpen: true }));
    resetForm();
  };

  const openEditSheet = (user: UserWithStats) => {
    setState((prev) => ({ ...prev, editingUser: user, isSheetOpen: true }));
    setFormState({
      name: user.name,
      email: user.email,
      phone_number: user.phone_number || "",
      is_admin: user.is_admin,
    });
  };

  const openDeleteDialog = (user: UserWithStats) => {
    setState((prev) => ({
      ...prev,
      deletingUser: user,
      isDeleteDialogOpen: true,
    }));
  };

  const closeSheet = () => {
    setState((prev) => ({ ...prev, isSheetOpen: false, editingUser: null }));
    resetForm();
  };

  const closeDeleteDialog = () => {
    setState((prev) => ({
      ...prev,
      isDeleteDialogOpen: false,
      deletingUser: null,
    }));
  };

  const resetForm = () => {
    setFormState(getInitialFormData());
  };

  const updateFormState = (updates: Partial<UserFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  return {
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
  };
}
