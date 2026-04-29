/* ================= PERFORMANCE APPRAISAL API SERVICES ================= */

/**
 * Add a new performance review
 * Sends both Reviewer and Reviewee data to the backend
 */
export const addEmployeeReview = async (reviewData) => {
  try {
    const res = await fetch("http://localhost:50001/add-employee-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to submit performance review");
  } catch (error) {
    console.error("addEmployeeReview error:", error);
    throw error;
  }
};

/**
 * Fetch all performance reviews (Global list)
 */
export const getAllPerformanceReviews = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`http://localhost:50001/all-performance-reviews?${query}`);

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to fetch performance reviews");
  } catch (error) {
    console.error("getAllPerformanceReviews error:", error);
    throw error;
  }
};

/**
 * Fetch performance reviews for a specific employee
 */
export const getEmployeePerformanceHistory = async (employeeId, params = {}) => {
  try {
    const query = new URLSearchParams({ employeeId, ...params }).toString();
    const res = await fetch(`http://localhost:50001/employee-performance-history?${query}`);

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to fetch employee performance history");
  } catch (error) {
    console.error("getEmployeePerformanceHistory error:", error);
    throw error;
  }
};

/**
 * Delete a performance review record by ID
 */
export const deletePerformanceReview = async (id) => {
  try {
    const res = await fetch(`http://localhost:50001/delete-performance-review/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to delete performance review");
  } catch (error) {
    console.error("deletePerformanceReview error:", error);
    throw error;
  }
};