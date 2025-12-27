import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { tripApi } from '@/services/trip.service';
import type { Trip } from '@/types/trip.types';
import type { TripManagementState, TripFormState } from './types';
import { formDataToCreateData, getInitialFormData } from './utils';

export function useTripManagement() {
  const [state, setState] = useState<TripManagementState>({
    trips: [],
    loading: true,
    isSheetOpen: false,
    isDeleteDialogOpen: false,
    editingTrip: null,
    deletingTrip: null,
    submitting: false,
  });

  const [formState, setFormState] = useState<TripFormState>({
    ...getInitialFormData(),
    tripDateOpen: false,
    bookingStartOpen: false,
    bookingEndOpen: false,
    returnOpen: false,
    endOpen: false,
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const response = await tripApi.getTrips({ sort: 'desc' });
      if (response.success && response.data) {
        setState((prev) => ({ ...prev, trips: response.data || [] }));
      }
    } catch (error) {
      toast.error('Failed to load trips');
      console.error(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSubmit = async () => {
    try {
      setState((prev) => ({ ...prev, submitting: true }));
      const formData = formDataToCreateData(formState);

      if (state.editingTrip) {
        const response = await tripApi.updateTrip(state.editingTrip.id, formData);
        if (response.success) {
          toast.success('Trip updated successfully!');
          closeSheet();
          fetchTrips();
        }
      } else {
        const response = await tripApi.createTrip(formData);
        if (response.success) {
          toast.success('Trip created successfully!');
          closeSheet();
          fetchTrips();
        }
      }
    } catch (error) {
      // Extract detailed error message
      const message = error instanceof Error ? error.message : 'Operation failed';
      
      // If the error message contains multiple lines (validation errors), show separate toasts
      if (message.includes('\n')) {
        const errors = message.split('\n').filter(err => err.trim());
        
        // Show main validation failed toast
        toast.error('Validation Failed', {
          description: `${errors.length} error(s) found. Please check the form.`,
        });
        
        // Show each validation error as a separate toast
        errors.forEach((err, index) => {
          setTimeout(() => {
            toast.error('Validation Error', {
              description: err,
              duration: 5000,
            });
          }, index * 100); // Stagger toasts by 100ms
        });
      } else {
        toast.error('Operation Failed', {
          description: message,
        });
      }
      
      console.error('Trip operation error:', error);
    } finally {
      setState((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleDelete = async () => {
    if (!state.deletingTrip) return;

    try {
      setState((prev) => ({ ...prev, submitting: true }));
      const response = await tripApi.deleteTrip(state.deletingTrip.id);

      if (response.success) {
        toast.success('Trip deleted successfully!');
        setState((prev) => ({
          ...prev,
          isDeleteDialogOpen: false,
          deletingTrip: null,
        }));
        fetchTrips();
      }
    } catch (error) {
      // Extract detailed error message
      const message = error instanceof Error ? error.message : 'Failed to delete trip';
      
      // If the error message contains multiple lines, show separate toasts
      if (message.includes('\n')) {
        const errors = message.split('\n').filter(err => err.trim());
        
        // Show main error toast
        toast.error('Delete Failed', {
          description: `${errors.length} error(s) occurred.`,
        });
        
        // Show each error as a separate toast
        errors.forEach((err, index) => {
          setTimeout(() => {
            toast.error('Error', {
              description: err,
              duration: 5000,
            });
          }, index * 100);
        });
      } else {
        toast.error('Delete Failed', {
          description: message,
        });
      }
      
      console.error('Delete trip error:', error);
    } finally {
      setState((prev) => ({ ...prev, submitting: false }));
    }
  };

  const openCreateSheet = () => {
    setState((prev) => ({ ...prev, editingTrip: null, isSheetOpen: true }));
    resetForm();
  };

  const openEditSheet = (trip: Trip) => {
    setState((prev) => ({ ...prev, editingTrip: trip, isSheetOpen: true }));

    const bStart = new Date(trip.booking_start_time);
    const bEnd = new Date(trip.booking_end_time);
    const rTime = new Date(trip.return_time);
    const eTime = new Date(trip.end_time);

    setFormState({
      tripTitle: trip.trip_title,
      amount: trip.amount_per_person,
      tripDate: new Date(trip.trip_date),
      bookingStartDate: bStart,
      bookingStartTime: format(bStart, 'HH:mm'),
      bookingEndDate: bEnd,
      bookingEndTime: format(bEnd, 'HH:mm'),
      returnDate: rTime,
      returnTime: format(rTime, 'HH:mm'),
      endDate: eTime,
      endTime: format(eTime, 'HH:mm'),
      tripDateOpen: false,
      bookingStartOpen: false,
      bookingEndOpen: false,
      returnOpen: false,
      endOpen: false,
    });
  };

  const openDeleteDialog = (trip: Trip) => {
    setState((prev) => ({ ...prev, deletingTrip: trip, isDeleteDialogOpen: true }));
  };

  const closeSheet = () => {
    setState((prev) => ({ ...prev, isSheetOpen: false, editingTrip: null }));
    resetForm();
  };

  const closeDeleteDialog = () => {
    setState((prev) => ({ ...prev, isDeleteDialogOpen: false, deletingTrip: null }));
  };

  const resetForm = () => {
    setFormState({
      ...getInitialFormData(),
      tripDateOpen: false,
      bookingStartOpen: false,
      bookingEndOpen: false,
      returnOpen: false,
      endOpen: false,
    });
  };

  const updateFormState = (updates: Partial<TripFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  return {
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
  };
}

