/**
 * Report Management Hook
 * State management for the reports module
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { reportApi } from "@/services/report.service";
import type {
  ReportFinancials,
  ReportsSummary,
  TripWithoutReport,
  ReportWithAdjustments,
  ReportHistory,
  CreateReportDTO,
  UpdateReportDTO,
  CreateAdjustmentDTO,
  UpdateAdjustmentDTO,
} from "@/types/report.types";

// ====================================
// STATE TYPES
// ====================================

interface ReportsListState {
  reports: ReportFinancials[];
  summary: ReportsSummary | null;
  pendingTrips: TripWithoutReport[];
  loading: boolean;
  summaryLoading: boolean;
}

interface ReportDetailState {
  report: ReportWithAdjustments | null;
  history: ReportHistory[];
  loading: boolean;
  historyLoading: boolean;
}

// ====================================
// REPORTS LIST HOOK
// ====================================

export function useReportsList() {
  const [state, setState] = useState<ReportsListState>({
    reports: [],
    summary: null,
    pendingTrips: [],
    loading: true,
    summaryLoading: true,
  });

  const fetchReports = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const response = await reportApi.getReports();
      setState((prev) => ({
        ...prev,
        reports: response.data || [],
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, summaryLoading: true }));
      const response = await reportApi.getSummary();
      setState((prev) => ({
        ...prev,
        summary: response.data || null,
        summaryLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching summary:", error);
      setState((prev) => ({ ...prev, summaryLoading: false }));
    }
  }, []);

  const fetchPendingTrips = useCallback(async () => {
    try {
      const response = await reportApi.getPendingTrips();
      setState((prev) => ({ ...prev, pendingTrips: response.data || [] }));
    } catch (error) {
      console.error("Error fetching pending trips:", error);
    }
  }, []);

  const createReport = useCallback(
    async (data: CreateReportDTO) => {
      try {
        const response = await reportApi.createReport(data);
        toast.success("Report created successfully");
        await Promise.all([fetchReports(), fetchSummary(), fetchPendingTrips()]);
        return response.data!.id;
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { error?: string } } }).response?.data
            ?.error || "Failed to create report";
        toast.error(message);
        throw error;
      }
    },
    [fetchReports, fetchSummary, fetchPendingTrips]
  );

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchReports(), fetchSummary(), fetchPendingTrips()]);
    };
    loadData();
  }, [fetchReports, fetchSummary, fetchPendingTrips]);

  return {
    ...state,
    fetchReports,
    fetchSummary,
    fetchPendingTrips,
    createReport,
  };
}

// ====================================
// REPORT DETAIL HOOK
// ====================================

export function useReportDetail(reportId: string | undefined) {
  const [state, setState] = useState<ReportDetailState>({
    report: null,
    history: [],
    loading: true,
    historyLoading: false,
  });

  const fetchReport = useCallback(async () => {
    if (!reportId) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));
      const response = await reportApi.getReport(reportId);
      setState((prev) => ({
        ...prev,
        report: response.data || null,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to fetch report");
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [reportId]);

  const fetchHistory = useCallback(async () => {
    if (!reportId) return;

    try {
      setState((prev) => ({ ...prev, historyLoading: true }));
      const response = await reportApi.getHistory(reportId);
      setState((prev) => ({
        ...prev,
        history: response.data || [],
        historyLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching history:", error);
      setState((prev) => ({ ...prev, historyLoading: false }));
    }
  }, [reportId]);

  const updateReport = useCallback(
    async (data: UpdateReportDTO) => {
      if (!reportId) return;

      try {
        await reportApi.updateReport(reportId, data);
        toast.success("Report updated successfully");
        await fetchReport();
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { error?: string } } }).response?.data
            ?.error || "Failed to update report";
        toast.error(message);
        throw error;
      }
    },
    [reportId, fetchReport]
  );

  const addAdjustment = useCallback(
    async (data: CreateAdjustmentDTO) => {
      if (!reportId) return;

      try {
        await reportApi.addAdjustment(reportId, data);
        toast.success("Adjustment added successfully");
        await fetchReport();
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { error?: string } } }).response?.data
            ?.error || "Failed to add adjustment";
        toast.error(message);
        throw error;
      }
    },
    [reportId, fetchReport]
  );

  const updateAdjustment = useCallback(
    async (adjustmentId: string, data: UpdateAdjustmentDTO) => {
      if (!reportId) return;

      try {
        await reportApi.updateAdjustment(reportId, adjustmentId, data);
        toast.success("Adjustment updated successfully");
        await fetchReport();
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { error?: string } } }).response?.data
            ?.error || "Failed to update adjustment";
        toast.error(message);
        throw error;
      }
    },
    [reportId, fetchReport]
  );

  const deleteAdjustment = useCallback(
    async (adjustmentId: string) => {
      if (!reportId) return;

      try {
        await reportApi.deleteAdjustment(reportId, adjustmentId);
        toast.success("Adjustment deleted successfully");
        await fetchReport();
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { error?: string } } }).response?.data
            ?.error || "Failed to delete adjustment";
        toast.error(message);
        throw error;
      }
    },
    [reportId, fetchReport]
  );

  useEffect(() => {
    const loadData = async () => {
      await fetchReport();
    };
    loadData();
  }, [fetchReport]);

  return {
    ...state,
    fetchReport,
    fetchHistory,
    updateReport,
    addAdjustment,
    updateAdjustment,
    deleteAdjustment,
  };
}
