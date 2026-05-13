// lib/api/assessment-nextzen.js

const BASE_URL = "http://localhost:50001";

// 1. Create assessment
export const createAssessmentNextzen = async (assessmentForm) => {
  try {
    const res = await fetch(`${BASE_URL}/add-assessment-post-nextzen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessmentForm),
    });

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to create Nextzen assessment");
  } catch (error) {
    console.error("Nextzen API Error (createAssessment):", error);
    throw error;
  }
};

// 2. Fetch all assessments
export const getAllAssessmentsNextzen = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/all-assessments-nextzen?${query}`);

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to fetch Nextzen assessments");
  } catch (error) {
    console.error("Nextzen API Error (getAllAssessments):", error);
    throw error;
  }
};

// 3. Fetch job-based assessments
export const getJobBasedAssessmentsNextzen = async (jobId, params = {}) => {
  try {
    const query = new URLSearchParams({ jobId, ...params }).toString();
    const res = await fetch(`${BASE_URL}/job-based-assessments-nextzen?${query}`);

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to fetch Nextzen job assessments");
  } catch (error) {
    console.error("Nextzen API Error (getJobBasedAssessments):", error);
    throw error;
  }
};

// 4. Delete assessment
export const deleteAssessmentNextzen = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/delete-assessment-nextzen/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to delete Nextzen assessment");
  } catch (error) {
    console.error("Nextzen API Error (deleteAssessment):", error);
    throw error;
  }
};

// POST: Create the global assessment structure for a job role
export async function createCTOAssessmentNextzen(assessmentData) {
  try {
    const response = await fetch(`${BASE_URL}/cto-assessment-post-nextzen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessmentData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create CTO assessment");
    return data;
  } catch (error) {
    console.error("API Error (createCTOAssessment):", error);
    throw error;
  }
}