"use client";
import { useState, useEffect, useCallback } from "react";
import { createInterviewNextzen, getAllInterviewsNextzen, deleteInterviewNextzen } from "../api/interview-nextzen";

let sharedInterviews = [];
let sharedLoading = false;
let listeners = [];

const notify = () => listeners.forEach((l) => l());

export function useInterviewNextzen() {
  const [interviews, setInterviews] = useState(sharedInterviews);
  const [loading, setLoading] = useState(sharedLoading);

  useEffect(() => {
    const listener = () => { setInterviews([...sharedInterviews]); setLoading(sharedLoading); };
    listeners.push(listener);
    return () => { listeners = listeners.filter((l) => l !== listener); };
  }, []);

  const fetchInterviews = useCallback(async (jobId) => {
    sharedLoading = true; notify();
    const res = await getAllInterviewsNextzen({ jobId });
    sharedInterviews = res.interviews || [];
    sharedLoading = false; notify();
  }, []);

  const submitInterviewSuggestion = useCallback(async (data) => {
    sharedLoading = true; notify();
    const res = await createInterviewNextzen(data);
    if (res.success) await fetchInterviews(data.jobRoleId);
    sharedLoading = false; notify();
    return res;
  }, [fetchInterviews]);

  return { interviews, loading, submitInterviewSuggestion, fetchInterviews };
}