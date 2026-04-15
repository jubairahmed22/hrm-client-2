"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  createExpenseCategory, 
  getAllExpenseCategories, 
  deleteExpenseCategory,
  submitExpenseRequest, 
  getAllExpenses,        
  updateExpenseStatus,
  getMyExpenses // 1. Import the new API function
} from "../api/expense";

/* ================= SHARED STATE (Cross-Component Sync) ================= */
// Using shared variables outside the hook to keep data in sync across multiple components
let sharedExpenseCategories = [];
let sharedExpenses = []; 
let sharedStats = { pending: 0, approved: 0, reimbursed: 0, total: 0 }; 



// NEW: Injected Summary States for Global and Filtered views
let sharedGlobalSummary = { 
  allTimeTotal: 0, 
  thisMonthTotal: 0, 
  lastMonthTotal: 0, 
  totalCount: 0 
};
let sharedFilterSummary = { 
  totalAmount: 0, 
  averagePerExpense: 0, 
  filteredCount: 0 
};

let sharedPagination = { totalItems: 0, totalPages: 1, currentPage: 1 };
let sharedLoading = false;
let sharedError = null;
let expenseListeners = [];

/* ================= NOTIFY SYSTEM ================= */
const notifyExpense = () => {
  expenseListeners.forEach((listener) => listener());
};

export function useExpense() {
  const [categories, setCategories] = useState(sharedExpenseCategories);
  const [expenses, setExpenses] = useState(sharedExpenses);
  const [stats, setStats] = useState(sharedStats);
  
  // Local States for the injected summaries
  const [globalSummary, setGlobalSummary] = useState(sharedGlobalSummary);
  const [filterSummary, setFilterSummary] = useState(sharedFilterSummary);

  const [pagination, setPagination] = useState(sharedPagination);
  const [loading, setLoading] = useState(sharedLoading);
  const [error, setError] = useState(sharedError);


  const updateSharedStateFromResponse = useCallback((result) => {
    sharedExpenses = result?.data || [];
    sharedPagination = result?.pagination || sharedPagination;
    sharedStats = result?.stats || sharedStats; 
    sharedGlobalSummary = result?.globalSummary || sharedGlobalSummary;
    sharedFilterSummary = result?.filterSummary || sharedFilterSummary;
    sharedError = null;
  }, []);

  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      setCategories([...sharedExpenseCategories]);
      setExpenses([...sharedExpenses]);
      setStats({ ...sharedStats });
      
      // Sync the new summary objects
      setGlobalSummary({ ...sharedGlobalSummary });
      setFilterSummary({ ...sharedFilterSummary });

      setPagination({ ...sharedPagination });
      setLoading(sharedLoading);
      setError(sharedError);
    };

    expenseListeners.push(listener);
    listener(); 

    return () => {
      expenseListeners = expenseListeners.filter((l) => l !== listener);
    };
  }, []);

  /* ================= CATEGORY METHODS ================= */

  const fetchAllCategories = useCallback(async (params = { page: 1, limit: 10 }) => {
    try {
      sharedLoading = true;
      notifyExpense();
      const result = await getAllExpenseCategories(params);
      sharedExpenseCategories = result?.data || [];
      sharedPagination = result?.pagination || sharedPagination;
      sharedError = null;
    } catch (err) {
      sharedError = err.message || "Failed to fetch categories";
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, []);
  

  const submitCategory = useCallback(async (categoryData) => {
    try {
      sharedLoading = true;
      notifyExpense();
      const response = await createExpenseCategory(categoryData);
      if (response.success) await fetchAllCategories();
      return response;
    } catch (err) {
      sharedError = err.message;
      throw err;
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, [fetchAllCategories]);

  const removeCategory = useCallback(async (id) => {
    const previous = [...sharedExpenseCategories];
    try {
      sharedExpenseCategories = sharedExpenseCategories.filter(c => c._id !== id);
      notifyExpense();
      return await deleteExpenseCategory(id);
    } catch (err) {
      sharedExpenseCategories = previous;
      sharedError = err.message;
      notifyExpense();
      throw err;
    }
  }, []);

  /* ================= EXPENSE (REQUESTS) METHODS ================= */

  const fetchAllExpenses = useCallback(async (params = { page: 1, limit: 10 }) => {
    try {
      sharedLoading = true;
      notifyExpense();
      const result = await getAllExpenses(params);
      
      // Update data and pagination
      sharedExpenses = result?.data || [];
      sharedPagination = result?.pagination || sharedPagination;

      // INJECTION: Update the summary parts from the API response
      sharedStats = result?.stats || sharedStats; 
      sharedGlobalSummary = result?.globalSummary || sharedGlobalSummary;
      sharedFilterSummary = result?.filterSummary || sharedFilterSummary;

      sharedError = null;
    } catch (err) {
      sharedError = err.message || "Failed to fetch expenses";
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, []);

  // 2. Add the specific "Get My Expenses" method
  const fetchMyExpenses = useCallback(async (email, params = { page: 1, limit: 10 }) => {
    if (!email) return;
    try {
      sharedLoading = true;
      notifyExpense();
      
      const result = await getMyExpenses(email, params);
      updateSharedStateFromResponse(result);
      
    } catch (err) {
      sharedError = err.message || "Failed to fetch your expenses";
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, [updateSharedStateFromResponse]);

  const submitExpense = useCallback(async (formData) => {
    try {
      sharedLoading = true;
      notifyExpense();
      const response = await submitExpenseRequest(formData);
      if (response.success) {
        // Reset to first page to show the new request
        await fetchAllExpenses({ page: 1, limit: 10 });
      }
      return response;
    } catch (err) {
      sharedError = err.message;
      throw err;
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, [fetchAllExpenses]);

  const updateStatus = useCallback(async (id, newStatus) => {
    try {
      sharedLoading = true;
      notifyExpense();
      const response = await updateExpenseStatus(id, newStatus);
      if (response.success) {
        // Refresh to update both the list and the summary counts
        await fetchAllExpenses(); 
      }
      return response;
    } catch (err) {
      sharedError = err.message;
      throw err;
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, [fetchAllExpenses]);

  return {
    // State
    categories,
    expenses,
    stats,
    globalSummary, // Now available for RequestsTab cards
    filterSummary, // Now available for RequestsTab cards
    pagination,
    loading,
    error,
    
    // Category Actions
    fetchAllCategories,
    submitCategory,
    removeCategory,
    fetchMyExpenses,
    // Expense Actions
    fetchAllExpenses,
    submitExpense,
    updateStatus
  };
}