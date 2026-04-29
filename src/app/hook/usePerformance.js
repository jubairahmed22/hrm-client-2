"use client";

import { useState, useEffect, useCallback } from "react";
import {
  addEmployeeReview,
  getAllPerformanceReviews,
  getEmployeePerformanceHistory,
  deletePerformanceReview,
  getEmployeePerformance,
} from "../api/performance";

/* ================= SHARED STATE ================= */
let sharedReviews = [];
let sharedEmployees = [];
let sharedCounts = {
  employmentTypeCounts: {},
  statusCounts: {},
  roleCounts: {},
};
let sharedPagination = { page: 1, totalPages: 1, totalEmployees: 0 };
let sharedPerformanceStats = { avgRating: "0.0", totalReviews: 0 };
let sharedPerformanceLoading = false;
let sharedPerformanceError = null;
let performanceListeners = [];

const notifyPerformance = () => {
  performanceListeners.forEach((listener) => listener());
};

export function usePerformance() {
  const [reviews, setReviews] = useState(sharedReviews);
  const [employees, setEmployees] = useState(sharedEmployees);
  const [counts, setCounts] = useState(sharedCounts);
  const [pagination, setPagination] = useState(sharedPagination);
  const [stats, setStats] = useState(sharedPerformanceStats);
  const [loading, setLoading] = useState(sharedPerformanceLoading);
  const [error, setError] = useState(sharedPerformanceError);

  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      setReviews([...sharedReviews]);
      setEmployees([...sharedEmployees]);
      setCounts({ ...sharedCounts });
      setPagination({ ...sharedPagination });
      setStats({ ...sharedPerformanceStats });
      setLoading(sharedPerformanceLoading);
      setError(sharedPerformanceError);
    };

    performanceListeners.push(listener);
    listener();

    return () => {
      performanceListeners = performanceListeners.filter((l) => l !== listener);
    };
  }, []);

  /* ================= FETCH ALL REVIEWS ================= */
  const fetchAllReviews = useCallback(async (params = {}) => {
    try {
      sharedPerformanceLoading = true;
      notifyPerformance();
      const result = await getAllPerformanceReviews(params);
      sharedReviews = result?.data || [];
      sharedPerformanceError = null;
    } catch (err) {
      sharedPerformanceError = err.message || "Failed to fetch reviews";
    } finally {
      sharedPerformanceLoading = false;
      notifyPerformance();
    }
  }, []);

  /* ================= FETCH EMPLOYEE HISTORY ================= */
  const fetchEmployeeHistory = useCallback(async (employeeId, params = {}) => {
    if (!employeeId) return;
    try {
      sharedPerformanceLoading = true;
      notifyPerformance();
      const result = await getEmployeePerformanceHistory(employeeId, params);
      sharedReviews = result?.data || [];
      sharedPerformanceError = null;
      return result;
    } catch (err) {
      sharedPerformanceError = err.message;
      throw err;
    } finally {
      sharedPerformanceLoading = false;
      notifyPerformance();
    }
  }, []);

  /* ================= FETCH EMPLOYEES + REVIEWS (joined) ================= */
  const fetchEmployeePerformance = useCallback(async (params = {}) => {
    try {
      sharedPerformanceLoading = true;
      notifyPerformance();

      const result = await getEmployeePerformance(params);

      sharedEmployees = result?.data || [];
      sharedCounts = result?.counts || {
        employmentTypeCounts: {},
        statusCounts: {},
        roleCounts: {},
      };
      sharedPagination = {
        page: result?.page || 1,
        totalPages: result?.totalPages || 1,
        totalEmployees: result?.totalEmployees || 0,
      };

      // Compute summary stats from joined reviews
      const allReviews = (result?.data || []).flatMap(
        (emp) => emp.performanceReviews || []
      );
      const totalReviews = allReviews.length;
      const avgRating =
        totalReviews > 0
          ? (
              allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
              totalReviews
            ).toFixed(1)
          : "0.0";

      sharedPerformanceStats = { avgRating, totalReviews };
      sharedPerformanceError = null;

      return result;
    } catch (err) {
      sharedPerformanceError = err.message || "Failed to fetch employees";
      throw err;
    } finally {
      sharedPerformanceLoading = false;
      notifyPerformance();
    }
  }, []);

  /* ================= SUBMIT REVIEW ================= */
  const submitReview = useCallback(
    async (reviewData) => {
      try {
        sharedPerformanceLoading = true;
        notifyPerformance();

        const response = await addEmployeeReview(reviewData);

        if (response.success) {
          // Refresh joined employee+review list so the new review shows immediately
          await fetchEmployeePerformance();
          window.dispatchEvent(new CustomEvent("refresh-performance-list"));
        }

        return response;
      } catch (err) {
        sharedPerformanceError = err.message || "Failed to submit review";
        throw err;
      } finally {
        sharedPerformanceLoading = false;
        notifyPerformance();
      }
    },
    [fetchEmployeePerformance]
  );

  /* ================= REMOVE REVIEW ================= */
  const removeReview = useCallback(async (id) => {
    const previousReviews = [...sharedReviews];

    try {
      sharedReviews = sharedReviews.filter((review) => review._id !== id);
      notifyPerformance();

      const response = await deletePerformanceReview(id);

      if (response.success) {
        window.dispatchEvent(new CustomEvent("refresh-performance-list"));
      }
    } catch (err) {
      sharedReviews = previousReviews;
      sharedPerformanceError = err.message || "Failed to delete review";
      notifyPerformance();
    }
  }, []);

  return {
    // State
    reviews,
    employees,
    counts,
    pagination,
    stats,
    loading,
    error,

    // Actions
    fetchAllReviews,
    fetchEmployeeHistory,
    fetchEmployeePerformance,
    submitReview,
    removeReview,
  };
}