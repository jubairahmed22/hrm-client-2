"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  addEmployeeReview, 
  getAllPerformanceReviews, 
  getEmployeePerformanceHistory, 
  deletePerformanceReview 
} from "../api/performance"; // Ensure this path matches your API file

/* ================= SHARED STATE ================= */
let sharedReviews = [];
let sharedPerformanceStats = {
  avgRating: "0.0",
  totalReviews: 0
};
let sharedPerformanceLoading = false;
let sharedPerformanceError = null;
let performanceListeners = [];

/* ================= NOTIFY SYSTEM ================= */
const notifyPerformance = () => {
  performanceListeners.forEach((listener) => listener());
};

export function usePerformance() {
  const [reviews, setReviews] = useState(sharedReviews);
  const [stats, setStats] = useState(sharedPerformanceStats);
  const [loading, setLoading] = useState(sharedPerformanceLoading);
  const [error, setError] = useState(sharedPerformanceError);

  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      setReviews([...sharedReviews]);
      setStats({ ...sharedPerformanceStats });
      setLoading(sharedPerformanceLoading);
      setError(sharedPerformanceError);
    };

    performanceListeners.push(listener);
    // Initial sync
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
      
      // Map 'data' from your backend response
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

  /* ================= SUBMIT REVIEW ================= */
  const submitReview = useCallback(async (reviewData) => {
    try {
      sharedPerformanceLoading = true;
      notifyPerformance();

      const response = await addEmployeeReview(reviewData);
      
      if (response.success) {
        // Refresh the list and trigger global event
        await fetchAllReviews();
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
  }, [fetchAllReviews]);

  /* ================= REMOVE REVIEW ================= */
  const removeReview = useCallback(async (id) => {
    // Keep reference for rollback (Optimistic Update)
    const previousReviews = [...sharedReviews];
    
    try {
      sharedReviews = sharedReviews.filter(review => review._id !== id);
      notifyPerformance(); 

      const response = await deletePerformanceReview(id);

      if (response.success) {
        window.dispatchEvent(new CustomEvent("refresh-performance-list"));
      }
    } catch (err) {
      // Rollback on error
      sharedReviews = previousReviews;
      sharedPerformanceError = err.message || "Failed to delete review";
      notifyPerformance();
    }
  }, []);

  return {
    reviews,
    stats,
    loading,
    error,
    fetchAllReviews,
    fetchEmployeeHistory,
    submitReview,
    removeReview
  };
}