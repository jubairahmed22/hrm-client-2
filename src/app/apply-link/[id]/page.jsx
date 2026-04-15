"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
// Import your specific hook
import { useJobPosts } from "@/app/hook/useRecruitment";
import { useRecruitment } from "@/app/hook/useRecruitment-jobs";

import {
  UserPlus,
  FileUp,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  MapPin,
  Briefcase,
  ShieldCheck,
  GraduationCap,
  Clock,
  Zap,
  Target,
  Award,
  DollarSign,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const RichTextDisplay = ({ content, className = "" }) => {
  if (!content)
    return <p className="text-gray-400 italic text-xs">No content provided</p>;

  return (
    <div
      className={`prose prose-sm max-w-none text-gray-600 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

const ApplyJobPage = () => {
  const { id } = useParams();
  const router = useRouter();

  // Destructure from your provided hook
  const { fetchSingleJob, loading: jobLoading } = useJobPosts();
  const { submitCandidate, loading: isSubmitting } = useRecruitment();

  const [job, setJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobRoleId: id || "",
    jobRoleName: "",
    source: "Career Site",
    experience: "",
    education: "",
    skills: "",
    salary: "",
    noticePeriod: "",
  });

  // Fetch Full Job Info on Mount
  useEffect(() => {
    const getDetails = async () => {
      if (id) {
        try {
          const data = await fetchSingleJob(id);
          if (data) {
            setJob(data);
            setFormData((prev) => ({
              ...prev,
              jobRoleId: data._id,
              jobRoleName: data.title,
            }));
          }
        } catch (err) {
          console.error("Error fetching job details:", err);
        }
      }
    };
    getDetails();
  }, [id, fetchSingleJob]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) return alert("Please upload your resume.");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      data.append("resume", resumeFile);

      await submitCandidate(data);
      alert("Application Submitted Successfully!");
      router.push("/");
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  if (jobLoading && !job) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FB]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Loading Job Intelligence...
          </p>
        </div>
      </div>
    );
  }

  console.log("job", job);

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 md:p-10 font-poppins">
      <div className="max-w-[1550px] mx-auto">
        {/* Navigation Section */}
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-all font-black text-[11px] uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Job Board
          </button>
          <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase">
              Live Portal
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* --- LEFT SIDE: THE DATA HUB (5/12) --- */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-10 max-h-[85vh] overflow-y-auto pr-4 custom-scrollbar">
            {/* Header Identity */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest backdrop-blur-md">
                    {job?.employmentType || "Full-Time"}
                  </span>
                  <span className="text-indigo-100 text-[10px] font-bold uppercase">
                    Ref: {job?._id?.slice(-8)}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4">
                  {job?.title}
                </h1>
                <div className="flex items-center gap-4 text-indigo-100/80 font-bold text-sm">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {job?.location}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />{" "}
                    <RichTextDisplay
                      content={job?.salary}
                      className="inline-block"
                    />
                  </span>
                </div>
              </div>
              {/* Decoration */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* In-Depth Content */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-10 space-y-12">
                {/* 1. Job Context */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Target className="w-5 h-5" />
                    </div>
                    <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">
                      Job Context
                    </h4>
                  </div>
                  <RichTextDisplay
                    content={job?.context}
                    className="text-gray-600 leading-relaxed text-sm italic border-l-4 border-indigo-100 pl-6"
                  />
                </section>

                {/* 2. Responsibilities */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">
                      Key Responsibilities
                    </h4>
                  </div>
                  <RichTextDisplay
                    content={job?.responsibilities}
                    className="text-gray-600 text-sm pl-2"
                  />
                </section>

                {/* 3. Competencies */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">
                      Core Competencies
                    </h4>
                  </div>
                  <RichTextDisplay
                    content={job?.competencies}
                    className="text-gray-600 text-sm pl-2"
                  />
                </section>

                {/* 4. Deadlines & Stats */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                  <div className="bg-gray-50 p-5 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Vacancy
                    </p>
                    <p className="text-xl font-black text-gray-900">
                      {job?.vacancies} Openings
                    </p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Application Deadline
                    </p>
                    <p className="text-sm font-black text-red-500 uppercase">
                      {job?.endDate
                        ? new Date(job.endDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDE: APPLICATION ENGINE (7/12) --- */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-indigo-100/40 overflow-hidden">
              <div className="p-10 md:p-16">
                <div className="mb-12">
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                    Apply for this position
                  </h2>
                  <p className="text-gray-400 font-medium mt-2">
                    Complete the form below to initiate your recruitment
                    process.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                  {/* Step 1: Documents */}
                  <div className="space-y-4">
                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      01. Resume Attachment (PDF)
                    </Label>
                    <div
                      className={`relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all flex flex-col items-center justify-center gap-4 ${resumeFile ? "border-green-500 bg-green-50/30" : "border-gray-200 bg-gray-50/50 hover:border-indigo-300 hover:bg-white"}`}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      {resumeFile ? (
                        <div className="text-center animate-in zoom-in-95">
                          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                          <p className="text-sm font-black text-gray-800">
                            {resumeFile.name}
                          </p>
                          <p className="text-[10px] text-green-600 font-bold uppercase mt-2">
                            Click to replace
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <FileUp className="w-8 h-8 text-indigo-600" />
                          </div>
                          <p className="text-sm font-black text-gray-800 uppercase tracking-tight">
                            Drop Resume Here
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter italic">
                            Only PDF files accepted
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Personal */}
                  <div className="space-y-6">
                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      02. Identification & Contact
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black text-gray-600 uppercase ml-1">
                          Full Name *
                        </Label>
                        <Input
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="e.g. Michael Scott"
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black text-gray-600 uppercase ml-1">
                          Personal Email *
                        </Label>
                        <Input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="michael@company.com"
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black text-gray-600 uppercase ml-1">
                          Contact Phone *
                        </Label>
                        <Input
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1..."
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black text-gray-600 uppercase ml-1">
                          Current Location *
                        </Label>
                        <Input
                          name="location"
                          required
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="City, Country"
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Qualifications */}
                  <div className="space-y-6 bg-indigo-50/30 p-10 rounded-[2.5rem] border border-indigo-100/50 shadow-inner">
                    <Label className="text-[11px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                      Qualification & Experience
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-[11px] font-black text-gray-600 uppercase ml-1 flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5" /> Educational
                          Background
                        </Label>
                        <Input
                          name="education"
                          required
                          value={formData.education}
                          onChange={handleChange}
                          placeholder="e.g. MBA in Finance"
                          className="h-14 rounded-2xl border-gray-100 bg-white shadow-sm"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-[11px] font-black text-gray-600 uppercase ml-1">
                          Technical Skills & Expertise
                        </Label>
                        <Input
                          name="skills"
                          required
                          value={formData.skills}
                          onChange={handleChange}
                          placeholder="React, Node.js, Project Management..."
                          className="h-14 rounded-2xl border-gray-100 bg-white shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black text-gray-600 uppercase ml-1">
                          Total Experience (Years)
                        </Label>
                        <Input
                          name="experience"
                          type="number"
                          required
                          value={formData.experience}
                          onChange={handleChange}
                          className="h-14 rounded-2xl border-gray-100 bg-white shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black text-gray-600 uppercase ml-1 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" /> Notice Period (Days)
                        </Label>
                        <Input
                          name="noticePeriod"
                          type="number"
                          value={formData.noticePeriod}
                          onChange={handleChange}
                          placeholder="30"
                          className="h-14 rounded-2xl border-gray-100 bg-white shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black text-gray-600 uppercase ml-1">
                          Expected Monthly Salary
                        </Label>
                        <Input
                          name="salary"
                          value={formData.salary}
                          onChange={handleChange}
                          placeholder="e.g. $5,000"
                          className="h-14 rounded-2xl border-gray-100 bg-white shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black text-gray-600 uppercase ml-1">
                          Source
                        </Label>
                        <select
                          name="source"
                          value={formData.source}
                          onChange={handleChange}
                          className="flex w-full h-14 px-4 bg-white border border-gray-100 rounded-2xl appearance-none font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <option value="Career Site">Career Site</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Referral">Referral</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Submission */}
                  <div className="pt-8">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-24 rounded-[2.2rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-6 text-lg group"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                          Finalize Application
                        </>
                      )}
                    </Button>
                    <div className="flex items-center justify-center gap-2 mt-8 opacity-40">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                        Official Recruitment Gateway
                      </span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJobPage;
