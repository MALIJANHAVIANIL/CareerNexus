import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { jobsApi } from "../../api/jobs";
import { applicationsApi } from "../../api/applications";
import { useNotifications } from "../../context/NotificationContext";
import {
  Briefcase,
  Users,
  PlusCircle,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Calendar
} from "lucide-react";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Button from "../../components/common/Button";
import Skeleton from "../../components/common/Skeleton";

export const HRDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Post Job State
  const [showPostModal, setShowPostModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobType, setNewJobType] = useState("Full-time");
  const [newJobLocation, setNewJobLocation] = useState("");
  const [newJobSalary, setNewJobSalary] = useState("");
  const [newJobDesc, setNewJobDesc] = useState("");

  const companyName = user?.company || "Stripe";

  const loadHRData = async () => {
    try {
      const allJobs = await jobsApi.getAllJobs();
      const companyJobs = allJobs.filter(
        (j) => j.company.toLowerCase() === companyName.toLowerCase()
      );
      setJobs(companyJobs);

      const apps = await applicationsApi.getHRApplications(companyName);
      setApplicants(apps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHRData();
  }, [user]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJobTitle || !newJobLocation || !newJobSalary || !newJobDesc) {
      showToast("Please fill in all job details", "warning");
      return;
    }

    setLoading(true);
    try {
      await jobsApi.postJob({
        title: newJobTitle,
        company: companyName,
        type: newJobType,
        location: newJobLocation,
        salary: newJobSalary,
        description: newJobDesc,
        requirements: ["Proficient in modern coding tools", "Excellent team-first approach"],
        benefits: ["Top class medical insurance", "Learning stipend"]
      });
      showToast("Job post created successfully!", "success");
      setShowPostModal(false);
      // Reset forms
      setNewJobTitle("");
      setNewJobLocation("");
      setNewJobSalary("");
      setNewJobDesc("");
      // Reload
      await loadHRData();
    } catch (err) {
      showToast(err.message || "Failed to create job post.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    setProcessingId(appId);
    try {
      await applicationsApi.updateApplicationStatus(appId, newStatus);
      showToast(`Applicant status moved to: ${newStatus}`, "success");
      await loadHRData();
    } catch (e) {
      showToast(e.message || "Failed to update applicant.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApplicants = selectedJobId
    ? applicants.filter((a) => a.jobId === selectedJobId)
    : applicants;

  const totalViews = jobs.reduce((acc, curr) => acc + (curr.applicantsCount || 0) * 4, 0);

  const statusBadge = (status) => {
    const styles = {
      applied: "bg-blue-50 text-blue-700 border-blue-200",
      shortlisted: "bg-purple-50 text-purple-700 border-purple-200",
      interviewing: "bg-amber-50 text-amber-700 border-amber-200",
      offered: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-red-50 text-red-700 border-red-200"
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border capitalize ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 md:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-outfit">Hiring Dashboard • {companyName}</h2>
          <p className="text-sm text-gray-300 font-sans mt-1">
            Post job openings, schedule interviews, and evaluate applications from university students.
          </p>
        </div>
        <div className="flex-shrink-0 flex gap-3">
          <Button
            variant="primary"
            onClick={() => setShowPostModal(true)}
            iconBefore={<PlusCircle size={17} />}
            className="bg-brand-red hover:bg-brand-darkRed text-white"
          >
            Post a Job
          </Button>
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card hover={false}>
          <CardBody className="flex items-center gap-4 py-4.5">
            <div className="p-3 rounded-xl bg-red-50 text-brand-red"><Briefcase size={22} /></div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-outfit">Active Postings</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">{jobs.length}</h3>
            </div>
          </CardBody>
        </Card>

        <Card hover={false}>
          <CardBody className="flex items-center gap-4 py-4.5">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><Users size={22} /></div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-outfit">Total Applicants</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">{applicants.length}</h3>
            </div>
          </CardBody>
        </Card>

        <Card hover={false}>
          <CardBody className="flex items-center gap-4 py-4.5">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600"><TrendingUp size={22} /></div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-outfit">Job Post Views</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalViews}</h3>
            </div>
          </CardBody>
        </Card>

        <Card hover={false}>
          <CardBody className="flex items-center gap-4 py-4.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle size={22} /></div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-outfit">Shortlist Rate</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                {applicants.length > 0
                  ? `${Math.round((applicants.filter(a => a.status === "shortlisted" || a.status === "interviewing").length / applicants.length) * 100)}%`
                  : "0%"}
              </h3>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main hiring tracking section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Applicants List */}
        <div className="lg:col-span-2 space-y-4">
          <Card hover={false}>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white">
              <h3 className="text-lg font-bold text-gray-900 font-outfit">Active Candidates</h3>
              {/* Job filter dropdown */}
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red"
              >
                <option value="">All Jobs Openings</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </CardHeader>
            <CardBody className="p-0">
              {loading ? (
                <Skeleton variant="list" count={2} />
              ) : filteredApplicants.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                  <Users size={32} className="opacity-45" />
                  <p>No candidates applied to this position yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-150">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase font-outfit">Candidate</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase font-outfit">Job Applied</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase font-outfit">Status</th>
                        <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase font-outfit">Evaluation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredApplicants.map((app) => (
                        <tr key={app.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img src={app.studentAvatar} alt={app.studentName} className="h-9 w-9 rounded-lg object-cover" />
                              <div>
                                <div className="text-sm font-bold text-gray-950 font-outfit">{app.studentName}</div>
                                <div className="text-[11px] text-gray-400 font-sans">{app.studentEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">{app.jobTitle}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{app.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{statusBadge(app.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                            {app.status === "applied" && (
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  disabled={processingId === app.id}
                                  onClick={() => handleUpdateStatus(app.id, "rejected")}
                                  className="p-1 rounded-md text-red-500 hover:bg-red-50"
                                >
                                  <XCircle size={16} />
                                </button>
                                <button
                                  disabled={processingId === app.id}
                                  onClick={() => handleUpdateStatus(app.id, "shortlisted")}
                                  className="px-2.5 py-1 bg-brand-red text-white rounded-md text-[10px] font-bold hover:bg-brand-darkRed"
                                >
                                  Shortlist
                                </button>
                              </div>
                            )}
                            {app.status === "shortlisted" && (
                              <button
                                disabled={processingId === app.id}
                                onClick={() => handleUpdateStatus(app.id, "interviewing")}
                                className="px-2.5 py-1 bg-amber-500 text-white rounded-md text-[10px] font-bold hover:bg-amber-600"
                              >
                                Invite Interview
                              </button>
                            )}
                            {app.status === "interviewing" && (
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  disabled={processingId === app.id}
                                  onClick={() => handleUpdateStatus(app.id, "rejected")}
                                  className="px-2 py-1 border border-red-200 text-red-600 rounded-md text-[10px] font-bold hover:bg-red-50"
                                >
                                  Reject
                                </button>
                                <button
                                  disabled={processingId === app.id}
                                  onClick={() => handleUpdateStatus(app.id, "offered")}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[10px] font-bold hover:bg-emerald-700"
                                >
                                  Release Offer
                                </button>
                              </div>
                            )}
                            {(app.status === "offered" || app.status === "rejected") && (
                              <span className="text-[10px] text-gray-400 uppercase font-bold">Closed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Side: Manage Postings / Job List */}
        <div className="space-y-4">
          <Card hover={false}>
            <CardHeader className="bg-white">
              <h3 className="text-base font-bold text-gray-900 font-outfit">My Postings</h3>
            </CardHeader>
            <CardBody className="space-y-3.5">
              {jobs.map((job) => (
                <div key={job.id} className="p-3.5 bg-gray-50 rounded-xl flex flex-col gap-2 relative">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-gray-950 font-outfit max-w-[75%]">{job.title}</h4>
                    <span className="text-[10px] font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded-full">
                      {job.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-sans truncate">{job.location} • {job.salary}</p>
                  <div className="flex items-center gap-1.5 mt-1 border-t border-gray-150 pt-2 text-[10px] font-bold text-gray-400">
                    <Users size={12} />
                    <span>
                      {applicants.filter((a) => a.jobId === job.id).length} candidates applied
                    </span>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

      </div>

      {/* Post Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setShowPostModal(false)} />
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-150 z-10 p-6 flex flex-col gap-4 animate-slide-up">
            <h3 className="text-lg font-bold text-gray-950 font-outfit">Create Job Posting</h3>
            <form onSubmit={handleCreateJob} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 font-outfit uppercase">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Developer"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="block w-full border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 font-outfit uppercase">Job Type</label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value)}
                    className="block w-full border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 font-outfit uppercase">Salary / Compensation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $40 - $55 / hour"
                    value={newJobSalary}
                    onChange={(e) => setNewJobSalary(e.target.value)}
                    className="block w-full border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 font-outfit uppercase">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. San Francisco, CA (Hybrid)"
                  value={newJobLocation}
                  onChange={(e) => setNewJobLocation(e.target.value)}
                  className="block w-full border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 font-outfit uppercase">Job Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe the role requirements, project responsibilities, and about the team..."
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  className="block w-full border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={() => setShowPostModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={loading} className="bg-brand-red text-white hover:bg-brand-darkRed">
                  Create Post
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
