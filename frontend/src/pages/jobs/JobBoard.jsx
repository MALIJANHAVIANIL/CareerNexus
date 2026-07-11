import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  Search,
  MapPin,
  DollarSign,
  Bookmark,
  Send,
  Building,
  CheckCircle,
  Clock,
  ChevronRight,
  Filter,
  Sparkles,
  BookmarkCheck,
  Briefcase
} from "lucide-react";
import Card, { CardBody } from "../../components/common/Card";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import confetti from "canvas-confetti";
import { jobsApi } from "../../api/jobs";
import { applicationsApi } from "../../api/applications";

export const JobBoard = () => {
  const { user } = useAuth();
  const { showToast, addNotification } = useNotifications();
  const location = useLocation();

  // Tabs: explore, saved, applied
  const [activeTab, setActiveTab] = useState("explore");
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPackageRange, setSelectedPackageRange] = useState(""); // '' | 'low' | 'mid' | 'high'

  const [jobsList, setJobsList] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected job for right-pane details
  const [selectedJob, setSelectedJob] = useState(null);

  // Apply Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);

  const loadJobsData = async () => {
    setLoading(true);
    try {
      const [allJobs, backendSaved, backendApplied] = await Promise.all([
        jobsApi.getAllJobs(),
        jobsApi.getSavedJobs(),
        applicationsApi.getStudentApplications()
      ]);

      setJobsList(allJobs);
      setSavedJobs(backendSaved.map(j => j.id));
      setAppliedJobs(backendApplied.map(app => ({
        jobId: app.jobId,
        status: app.status?.toLowerCase() || "applied",
        appliedDate: new Date(app.appliedAt || new Date()).toLocaleDateString(),
        coverLetter: app.coverLetter || ""
      })));

      // Sync selected job redirection or default to first job
      const stateJobId = location.state?.jobId;
      if (stateJobId) {
        const found = allJobs.find((j) => String(j.id) === String(stateJobId));
        if (found) {
          setSelectedJob(found);
          window.history.replaceState({}, document.title);
        } else if (allJobs.length > 0) {
          setSelectedJob(allJobs[0]);
        }
      } else if (allJobs.length > 0) {
        setSelectedJob(allJobs[0]);
      }
    } catch (err) {
      console.error("Failed to load jobs data from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobsData();
  }, [user]);

  // Sync URL tab params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam === "applied") setActiveTab("applied");
    else if (tabParam === "saved") setActiveTab("saved");
  }, [location]);

  // Handle redirect from dashboard with state.jobId
  useEffect(() => {
    if (location.state?.jobId && jobsList.length > 0) {
      const found = jobsList.find((j) => String(j.id) === String(location.state.jobId));
      if (found) {
        setSelectedJob(found);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, jobsList]);

  // Reset selected job when active tab changes
  useEffect(() => {
    const jobsForTab = getFilteredJobsForTab(activeTab);
    if (jobsForTab.length > 0) {
      setSelectedJob(jobsForTab[0]);
    } else {
      setSelectedJob(null);
    }
  }, [activeTab, search, selectedCompany, selectedLocation, selectedPackageRange, savedJobs, appliedJobs]);

  const handleSaveJob = async (jobId, e) => {
    e.stopPropagation();
    try {
      await jobsApi.saveJob(jobId);
      if (savedJobs.includes(jobId)) {
        setSavedJobs(prev => prev.filter((id) => id !== jobId));
        showToast("Job removed from bookmarks.", "info");
      } else {
        setSavedJobs(prev => [...prev, jobId]);
        showToast("Job saved to bookmarks!", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to update bookmarks.", "error");
    }
  };

  const handleApplyClick = () => {
    if (user?.role !== "student") {
      showToast("Only students can apply to jobs.", "warning");
      return;
    }
    setShowApplyModal(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!coverLetter.trim()) return;

    setApplying(true);
    try {
      await applicationsApi.applyToJob({
        jobId: selectedJob.id,
        coverLetter: coverLetter.trim()
      });

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#990000", "#111827", "#f87171"]
      });

      showToast("Application submitted successfully!", "success");
      addNotification("job", "Applied successfully", `You applied for ${selectedJob.title} at ${selectedJob.company}`);

      setShowApplyModal(false);
      setCoverLetter("");
      loadJobsData();
    } catch (err) {
      showToast(err.message || "Failed to submit application.", "error");
    } finally {
      setApplying(false);
    }
  };

  const matchesPackage = (salaryString, selectedRange) => {
    if (!selectedRange) return true;
    if (!salaryString) return true;
    
    const nums = salaryString.match(/\d+(\.\d+)?/g);
    if (!nums || nums.length === 0) return true;
    
    const minVal = parseFloat(nums[0]);
    
    if (selectedRange === "low") {
      return minVal < 10;
    } else if (selectedRange === "mid") {
      return minVal >= 10 && minVal <= 20;
    } else if (selectedRange === "high") {
      return minVal > 20;
    }
    return true;
  };

  const getFilteredJobsForTab = (tab) => {
    return jobsList.filter((job) => {
      const matchesSearch =
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company?.toLowerCase().includes(search.toLowerCase()) ||
        job.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCompany = selectedCompany ? job.company === selectedCompany : true;
      
      const matchesLoc = selectedLocation
        ? job.location?.toLowerCase().includes(selectedLocation.toLowerCase())
        : true;

      const matchesSal = matchesPackage(job.salary, selectedPackageRange);

      if (tab === "saved") {
        return matchesSearch && matchesCompany && matchesLoc && matchesSal && savedJobs.includes(job.id);
      }
      if (tab === "applied") {
        return matchesSearch && matchesCompany && matchesLoc && matchesSal && appliedJobs.some((a) => a.jobId === job.id);
      }
      return matchesSearch && matchesCompany && matchesLoc && matchesSal;
    });
  };

  const filteredJobs = getFilteredJobsForTab(activeTab);

  const hasApplied = (jobId) => appliedJobs.some((a) => a.jobId === jobId);
  const getAppStatus = (jobId) => appliedJobs.find((a) => a.jobId === jobId)?.status || "";

  // Unique companies and locations for selectors
  const uniqueCompanies = Array.from(new Set(jobsList.map((j) => j.company).filter(Boolean)));
  const uniqueLocations = Array.from(
    new Set(jobsList.map((j) => j.location?.split(",")[0].trim()).filter(Boolean))
  );

  const getLogoLetter = (companyName) => companyName ? companyName.charAt(0).toUpperCase() : "J";
  const getLogoBg = (companyName) => {
    if (!companyName) return "bg-gray-600";
    const char = companyName.charAt(0).toLowerCase();
    if (char >= 'a' && char <= 'd') return "bg-blue-600";
    if (char >= 'e' && char <= 'h') return "bg-red-650";
    if (char >= 'i' && char <= 'l') return "bg-green-600";
    if (char >= 'm' && char <= 'p') return "bg-purple-650";
    if (char >= 'q' && char <= 't') return "bg-teal-600";
    return "bg-amber-700";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header Banner */}
      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs, company, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red hover:border-gray-400 transition bg-white"
            />
          </div>

          {/* Filter by Company */}
          <div className="relative">
            <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red hover:border-gray-400 transition appearance-none bg-white font-medium text-gray-700 font-sans"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Filter by Location */}
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red hover:border-gray-400 transition appearance-none bg-white font-medium text-gray-700 font-sans"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Filter by Package */}
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <select
              value={selectedPackageRange}
              onChange={(e) => setSelectedPackageRange(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red hover:border-gray-400 transition appearance-none bg-white font-medium text-gray-700 font-sans"
            >
              <option value="">All Packages</option>
              <option value="low">Under 10 LPA</option>
              <option value="mid">10 - 20 LPA</option>
              <option value="high">Above 20 LPA</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-gray-100 pt-3 flex gap-2">
          {["explore", "saved", "applied"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-outfit uppercase transition-all ${
                activeTab === tab
                  ? "bg-brand-red text-white"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab === "explore" ? "Explore Jobs" : tab === "saved" ? "Saved Jobs" : "My Applications"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Listings split-pane grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side List: 1/3 layout on desktop */}
        <div className="lg:col-span-1 space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
          {filteredJobs.length === 0 ? (
            <EmptyState
              title={`No matches found`}
              message="No job posts match your keywords and selected filter parameters."
            />
          ) : (
            filteredJobs.map((job) => (
              <Card
                key={job.id}
                onClick={() => setSelectedJob(job)}
                hover
                className={`cursor-pointer border-gray-150 ${selectedJob?.id === job.id ? "ring-1.5 ring-brand-red bg-red-50/5" : "bg-white"}`}
              >
                <CardBody className="p-4 flex gap-3">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0 ${getLogoBg(job.company)}`}>
                    {getLogoLetter(job.company)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-extrabold text-gray-955 truncate font-outfit">{job.title}</h4>
                      <button
                        onClick={(e) => handleSaveJob(job.id, e)}
                        className="text-gray-400 hover:text-brand-red p-0.5 rounded transition flex-shrink-0"
                      >
                        {savedJobs.includes(job.id) ? (
                          <BookmarkCheck className="text-brand-red" size={15} />
                        ) : (
                          <Bookmark size={15} />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] font-bold text-gray-550 mt-0.5">{job.company}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-sans">
                      <MapPin size={11} /> {job.location}
                    </p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                      <span className="text-[9px] font-extrabold text-brand-red bg-red-50 px-2 py-0.5 rounded font-outfit">
                        {job.salary}
                      </span>
                      {hasApplied(job.id) ? (
                        statusBadge(getAppStatus(job.id))
                      ) : (
                        <span className="text-[9px] font-bold text-gray-400 font-outfit">{new Date(job.createdAt || new Date()).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>

        {/* Right Side Details: 2/3 layout on desktop */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <Card hover={false} className="sticky top-24 bg-white border-gray-150">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-extrabold text-white text-2xl shadow-sm ${getLogoBg(selectedJob.company)}`}>
                    {getLogoLetter(selectedJob.company)}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 font-outfit leading-tight">{selectedJob.title}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium font-sans">
                      <Building size={13} /> {selectedJob.company} • {selectedJob.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={(e) => handleSaveJob(selectedJob.id, e)}
                    className="p-2.5 px-3 text-xs"
                  >
                    {savedJobs.includes(selectedJob.id) ? "Saved" : "Save"}
                  </Button>
                  
                  {hasApplied(selectedJob.id) ? (
                    <div className="flex items-center gap-1.5 py-2 px-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-100 font-outfit uppercase">
                      <CheckCircle size={14} className="text-emerald-600" /> Applied
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleApplyClick}
                      className="bg-brand-red hover:bg-brand-darkRed text-white px-4 py-2 text-xs"
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>

              {/* Job Info Details */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-150">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-outfit tracking-wide block">Job Type</span>
                    <span className="text-xs font-bold text-gray-800 mt-0.5 block">{selectedJob.type}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-outfit tracking-wide block">Compensation</span>
                    <span className="text-xs font-bold text-brand-red mt-0.5 block">{selectedJob.salary}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-outfit tracking-wide block">Candidates</span>
                    <span className="text-xs font-bold text-gray-800 mt-0.5 block">{selectedJob.applicantsCount || 0} applied</span>
                  </div>
                </div>

                {/* About Role */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-955 font-outfit uppercase tracking-wide flex items-center gap-1">
                    <Briefcase size={13} className="text-brand-red" /> Role Description
                  </h4>
                  <p className="text-xs text-gray-550 font-sans leading-relaxed">{selectedJob.description}</p>
                </div>

                {/* Requirements */}
                {selectedJob.requirements && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-gray-955 font-outfit uppercase tracking-wide flex items-center gap-1">
                      <Sparkles size={13} className="text-brand-red" /> Requirements
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedJob.requirements.map((req, idx) => (
                        <li key={idx} className="flex gap-2 text-xs text-gray-500 leading-relaxed font-sans">
                          <span className="text-brand-red font-bold">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                {selectedJob.benefits && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-gray-955 font-outfit uppercase tracking-wide flex items-center gap-1">
                      <CheckCircle size={13} className="text-brand-red" /> Benefits & Perks
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedJob.benefits.map((ben, idx) => (
                        <li key={idx} className="flex gap-2 text-xs text-gray-500 leading-relaxed font-sans">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-10 border border-dashed border-gray-200 bg-white/50 rounded-2xl">
              <p className="text-xs text-gray-400 font-outfit">Select a job post to view descriptions and requirements.</p>
            </div>
          )}
        </div>
      </div>

      {/* Application Sheet / Modal Form */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-150 p-6 flex flex-col gap-4 animate-slide-up">
            <h3 className="text-sm font-bold text-gray-955 font-outfit uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-1.5">
              <Send size={15} className="text-brand-red" /> Apply for {selectedJob.title}
            </h3>
            
            <form onSubmit={submitApplication} className="space-y-4">
              <div className="p-3 bg-red-50/20 border border-brand-red/5 rounded-xl flex items-center gap-3">
                <span className="text-brand-red font-semibold text-xs bg-red-100 p-1.5 px-2 rounded-lg font-outfit">PDF</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{user?.resumeName || `${user?.name ? user.name.replace(/\s+/g, '_') : 'My'}_Resume.pdf`}</p>
                  <p className="text-[10px] text-gray-400">Attached directly from verified profile settings</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-650 mb-1.5 font-outfit uppercase">Cover Letter / Statement of Interest</label>
                <textarea
                  required
                  rows="5"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain why you are a good fit for this role and list relevant experience..."
                  className="w-full border border-gray-300 rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red font-sans bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowApplyModal(false)} className="text-xs py-1.5 px-3">
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={applying} className="bg-brand-red text-white hover:bg-brand-darkRed text-xs py-1.5 px-3">
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const statusBadge = (status) => {
  const styles = {
    applied: "bg-blue-50 text-blue-700 border-blue-200",
    shortlisted: "bg-purple-50 text-purple-700 border-purple-200",
    interviewing: "bg-amber-50 text-amber-700 border-amber-200",
    offered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200"
  };
  return (
    <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded-md border uppercase tracking-wider ${styles[status] || "bg-gray-50 text-gray-500"}`}>
      {status}
    </span>
  );
};

export default JobBoard;
