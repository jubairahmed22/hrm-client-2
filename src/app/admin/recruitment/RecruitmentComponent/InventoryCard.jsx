"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Briefcase, Star, Eye, Trash2, 
  ChevronDown, CheckCircle2, Loader2, DollarSign, Calendar
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useRecruitment } from "@/app/hook/useRecruitment-jobs";

// Separate Dialog Components
import AppliedDialog from './AppliedDialog';
import ScreeningDialog from './ScreeningDialog';
import AssessmentDialog from './AssessmentDialog';
import InterviewDialog from './InterviewDialog';
import FinalReviewDialog from './FinalReviewDialog';
import OfferDialog from './OfferDialog';
import HiredDialog from './HiredDialog';
import ViewDialog from './ViewDialog';

const RECRUITMENT_STAGES = [
  "Applied", "Screening", "Assessment", "Interview", 
  "Final Review", "Offer", "Hired", "Inventory", "Rejected"
];

const InventoryCard = ({ person, removeCandidate }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false); 
    const dropdownRef = useRef(null);
    
    const { changeCandidateStatus } = useRecruitment();
    
    // Mock match score if not present in data
    const matchScore = person.matchScore || 88;

    // Formatting Date
    const appliedDate = person.createdAt ? new Date(person.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : "N/A";

    const onDragStart = (e) => {
        e.dataTransfer.setData("candidateId", person._id);
        e.dataTransfer.setData("currentStatus", person.status);
        e.dataTransfer.effectAllowed = "move";
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleStatusUpdate = async (newStatus) => {
        if (newStatus === person.status) {
            setIsDropdownOpen(false);
            return;
        }
        setIsUpdating(true);
        setIsDropdownOpen(false);
        try {
            await changeCandidateStatus(person._id, newStatus, person.jobId);
            window.dispatchEvent(new Event("refresh-kanban-board"));
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const renderStatusDialog = () => {
        if (!isViewOpen) return null;
        const commonProps = { open: isViewOpen, onClose: () => setIsViewOpen(false), person: person };
        
        switch (person.status) {
            case "Inventory": return <ViewDialog {...commonProps} />; 
            case "Applied": return <AppliedDialog {...commonProps} />;
            case "Screening": return <ScreeningDialog {...commonProps} />;
            case "Assessment": return <AssessmentDialog {...commonProps} />;
            case "Interview": return <InterviewDialog {...commonProps} />;
            case "Final Review": return <FinalReviewDialog {...commonProps} />;
            case "Offer": return <OfferDialog {...commonProps} />;
            case "Hired": return <HiredDialog {...commonProps} />;
            default: return <AppliedDialog {...commonProps} />;
        }
    };

    return (
        <>
            <div 
                draggable
                onDragStart={onDragStart}
                className="group bg-[#FFFDF5] border border-[#FDE68A]/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 mb-4 w-full"
            >
                <div className="flex flex-col md:flex-row lg:flex-row justify-between gap-6">
                    
                    {/* Left Section: Avatar & Info */}
                    <div className="flex flex-1 gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {person.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        
                        <div className="space-y-1 w-full">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-slate-800">{person.fullName}</h3>
                                <div className="flex items-center gap-1 bg-white border border-amber-100 px-2 py-0.5 rounded-full shadow-sm">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-bold text-slate-600">{matchScore}%</span>
                                </div>
                            </div>
                            <p className="text-slate-500 font-medium text-sm">{person.jobRoleName}</p>
                            
                            {/* Meta Grid */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-medium">{person.location}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <DollarSign className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-medium">${person.salary?.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-medium font-bold">Applied {appliedDate}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-medium">Score: {matchScore}/100</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Buttons */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                        <button 
                            onClick={() => setIsViewOpen(true)}
                            className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Eye className="w-4 h-4" />
                            View Details
                        </button>
                        
                      
                    </div>
                </div>

                {/* Rejection/Inventory Reason Section */}
                <div className="mt-5 p-4 bg-white/60 border border-slate-100 rounded-2xl">
                    <div className="flex gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Rejection Reason:
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed ml-6">
                        {person.inventoryDetails?.reason || "No specific reason provided."}
                    </p>
                </div>

                {/* Bottom Tags */}
                <div className="flex items-center justify-between mt-4">
                    {/* <div className="flex gap-2">
                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none px-3 py-1 rounded-full text-[10px] font-bold lowercase">
                            qualified
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none px-3 py-1 rounded-full text-[10px] font-bold lowercase">
                            {person.inventoryDetails?.category || "inventory"}
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none px-3 py-1 rounded-full text-[10px] font-bold lowercase">
                            strong-candidate
                        </Badge>
                    </div> */}
                    
                    <button 
                        onClick={() => removeCandidate(person._id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {renderStatusDialog()}
        </>
    );
};

export default InventoryCard;