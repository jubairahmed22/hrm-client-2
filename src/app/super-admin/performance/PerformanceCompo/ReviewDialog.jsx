"use client";
import React, { useState } from "react";
import { Star, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AccessibleDialog from "@/components/ui/accessible-dialog";
import axios from "axios";

export default function ReviewDialog({ open, onClose, selectedEmployee, reviewerData, refreshEmployees }) {
  const [rating, setRating] = useState(0); dsf
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Please select a rating");

    const payload = {
      // Reviewee Details (The employee in the row)
      employeeId: selectedEmployee._id,
      employeeName: selectedEmployee.fullName,
      employeeEmail: selectedEmployee.email,
      employeeDesignation: selectedEmployee.designation,
      
      // Reviewer Details (The person logged in)
      reviewerId: reviewerData?.employeeId,
      reviewerName: reviewerData?.fullName,
      reviewerEmail: reviewerData?.email,
      
      // Review Content
      rating: Number(rating),
      feedback,
      weightContribution: 1.66, // 5 marks / 3 reviewers
    };

    console.log("Final POST Payload:", payload);

    setLoading(true);
    // try {
    //   const response = await axios.post("http://localhost:50001/api/add-employee-review", payload);
    //   if (response.data.success) {
    //     toast.success("Review submitted!");
    //     onClose();
    //     refreshEmployees();
    //   }
    // } catch (err) {
    //   toast.error("Submission failed");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <AccessibleDialog open={open} onOpenChange={onClose} title="Performance Review" size="MEDIUM">
      <div className="space-y-6">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
           <p className="text-sm text-indigo-800 font-medium">Reviewing: {selectedEmployee?.fullName}</p>
           <p className="text-xs text-indigo-600 italic">By Reviewer: {reviewerData?.fullName}</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Label className="text-gray-600">Select Stars</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                onClick={() => setRating(s)}
                className={`w-8 h-8 cursor-pointer ${rating >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Feedback</Label>
          <Textarea 
            value={feedback} 
            onChange={(e) => setFeedback(e.target.value)} 
            placeholder="Write your appraisal..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-slate-900">
            {loading ? "Saving..." : "Submit Review"}
          </Button>
        </div>
      </div>
    </AccessibleDialog>
  );
}