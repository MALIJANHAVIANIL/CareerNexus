import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useLocation } from "react-router-dom";
import apiClient from "../../api/client";
import {
  Users,
  Award,
  Building,
  Briefcase,
  Calendar,
  BarChart3,
  Sparkles,
  CheckCircle,
  XCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Linkedin,
  Github,
  Globe,
  Share2,
  Search
} from "lucide-react";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Button from "../../components/common/Button";

export const TPODashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const location = useLocation();

  const [studentSearch, setStudentSearch] = useState("");
  const [alumniSearch, setAlumniSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");

  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [students, setStudents] = useState([]);
  const [allAlumni, setAllAlumni] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [logs, setLogs] = useState([]);

  const [stats, setStats] = useState({
    placementRate: 0,
    placedStudents: 0,
    activeRecruiters: 0,
    approvedMentors: 0
  });
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("GENERAL");
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", industry: "", website: "", description: "" });
  const [savingCompany, setSavingCompany] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", speaker: "", startTime: "", endTime: "", location: "" });
  const [savingEvent, setSavingEvent] = useState(false);

  const loadTpoData = async () => {
    try {
      const statsRes = await apiClient.get("/api/tpo/stats");
      setStats({
        placementRate: statsRes.data.placementRate,
        placedStudents: statsRes.data.placedStudents,
        activeRecruiters: statsRes.data.activeRecruiters,
        approvedMentors: statsRes.data.approvedMentors
      });

      const alumniRes = await apiClient.get("/api/tpo/pending-alumni");
      setPendingAlumni(alumniRes.data || []);

      const [companiesRes, jobsRes, eventsRes, studentsRes, allAlumniRes, logsRes] = await Promise.all([
        apiClient.get("/api/companies"),
        apiClient.get("/api/jobs"),
        apiClient.get("/api/events"),
        apiClient.get("/api/tpo/students"),
        apiClient.get("/api/tpo/alumni"),
        apiClient.get("/api/audit-logs").catch(err => { console.warn(err); return { data: [] }; })
      ]);

      const companiesData = companiesRes.data || [];
      const jobsData = jobsRes.data || [];
      const eventsData = eventsRes.data || [];
      const studentsData = studentsRes.data || [];
      const allAlumniData = allAlumniRes.data || [];
      const logsData = logsRes.data || [];

      setCompanies(companiesData);
      setJobs(jobsData);

      const mappedEvents = eventsData.map(evt => ({
        id: evt.id,
        title: evt.title,
        description: evt.description,
        speaker: evt.speaker,
        venue: evt.location,
        date: evt.startTime ? evt.startTime.split("T")[0] : "Upcoming",
        time: evt.startTime ? evt.startTime.split("T")[1].substring(0, 5) : "14:00",
        registrations: evt.registrations || []
      }));
      setEvents(mappedEvents);

      setStudents(studentsData);
      setAllAlumni(allAlumniData);
      setLogs(logsData);

      const driveList = companiesData.map(comp => {
        const matchingJobs = jobsData.filter(job => job.company?.toLowerCase() === comp.name?.toLowerCase());
        const count = matchingJobs.length;
        return {
          name: comp.name,
          jobsCount: count,
          status: count > 0 ? "Active Drive" : "Recruiting"
        };
      });

      setPartners(driveList.sort((a, b) => b.jobsCount - a.jobsCount).slice(0, 6));
    } catch (err) {
      console.error("Failed to load TPO dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTpoData();
  }, []);

  const handleApproveAlumni = async (alId, name) => {
    try {
      // Find user ID for the alumni profile
      const alumni = pendingAlumni.find(a => a.id === alId);
      if (!alumni) return;
      // Fetch details or use email as mapping or if we return userId in list
      // Wait, in TpoServiceImpl we map getPendingAlumni to return user ID as the response ID!
      // So al.id is the userId of the alumni!
      await apiClient.post(`/api/tpo/approve-alumni/${alId}`);
      showToast(`Alumni profile for ${name} has been verified and approved!`, "success");
      loadTpoData();
    } catch (err) {
      showToast(err.message || "Failed to approve alumni", "error");
    }
  };

  const handleRejectAlumni = async (alId, name) => {
    try {
      await apiClient.post(`/api/tpo/reject-alumni/${alId}`);
      showToast(`Alumni registration for ${name} declined.`, "info");
      loadTpoData();
    } catch (err) {
      showToast(err.message || "Failed to reject alumni", "error");
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name.trim() || !newCompany.industry.trim()) {
      showToast("Company Name and Industry are required.", "error");
      return;
    }
    setSavingCompany(true);
    try {
      await apiClient.post("/api/companies", {
        name: newCompany.name.trim(),
        industry: newCompany.industry.trim(),
        website: newCompany.website.trim() || "",
        description: newCompany.description.trim() || ""
      });
      showToast(`Company "${newCompany.name}" added successfully!`, "success");
      setNewCompany({ name: "", industry: "", website: "", description: "" });
      setShowCompanyModal(false);
      loadTpoData();
    } catch (err) {
      showToast(err.message || "Failed to add company", "error");
    } finally {
      setSavingCompany(false);
    }
  };

  const openEventModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const startIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    
    tomorrow.setHours(12, 0, 0, 0);
    const endIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    setNewEvent({
      title: "",
      description: "",
      speaker: "",
      startTime: startIso,
      endTime: endIso,
      location: ""
    });
    setShowEventModal(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.description.trim() || !newEvent.speaker.trim() || !newEvent.location.trim()) {
      showToast("All fields are required.", "error");
      return;
    }
    setSavingEvent(true);
    try {
      await apiClient.post("/api/events", {
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        speaker: newEvent.speaker.trim(),
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        location: newEvent.location.trim(),
        companyId: null
      });
      showToast(`Event "${newEvent.title}" scheduled successfully!`, "success");
      setNewEvent({ title: "", description: "", speaker: "", startTime: "", endTime: "", location: "" });
      setShowEventModal(false);
      loadTpoData();
    } catch (err) {
      showToast(err.message || "Failed to create event", "error");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    try {
      const response = await apiClient.get(`/api/tpo/reports/download?type=${reportType}`, {
        responseType: "blob"
      });
      
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `careernexus_report_${reportType.toLowerCase()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast(`${reportType} report downloaded successfully!`, "success");
    } catch (err) {
      showToast(err.message || "Failed to download report", "error");
    } finally {
      setDownloadingReport(false);
    }
  };

  // 3. Dynamic Partner Companies
  const [partners, setPartners] = useState([]);

  // Calculate dynamic department rates relative to the real overall placementRate
  const overallRate = stats.placementRate || 0;
  const departmentPlacements = [
    { name: "Computer Eng.", rate: Math.min(100, Math.round(overallRate * 1.1)), color: "bg-brand-red" },
    { name: "Information Tech.", rate: Math.min(100, Math.round(overallRate * 1.05)), color: "bg-brand-black" },
    { name: "ENTC", rate: Math.round(overallRate * 0.95), color: "bg-red-800" },
    { name: "Mechanical Eng.", rate: Math.round(overallRate * 0.8), color: "bg-slate-600" },
    { name: "Electrical Eng.", rate: Math.round(overallRate * 0.72), color: "bg-slate-500" },
    { name: "Civil Eng.", rate: Math.round(overallRate * 0.65), color: "bg-slate-400" }
  ];



  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "dashboard";

  const renderStudentsTab = () => {
    const filteredStudents = students.filter((st) => {
      const q = studentSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        (st.name && st.name.toLowerCase().includes(q)) ||
        (st.email && st.email.toLowerCase().includes(q)) ||
        (st.department && st.department.toLowerCase().includes(q)) ||
        (st.rollNumber && st.rollNumber.toLowerCase().includes(q))
      );
    });

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 shadow-md border border-brand-red/10">
          <h2 className="text-xl md:text-2xl font-extrabold font-outfit">Student Placement Directory</h2>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Manage and view all registered placement candidates, credentials, and selection statuses.
          </p>
        </div>

        <Card hover={false} className="bg-white border-gray-150 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100 py-4 px-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider">
              Total Candidates ({filteredStudents.length})
            </h3>
            <div className="relative w-full sm:w-64 text-gray-800">
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search candidates..."
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {filteredStudents.length === 0 ? (
              <p className="p-8 text-center text-xs text-gray-400 font-medium">No students match your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-150 text-xs">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Student</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">PRN / Department</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Academic Parameters</th>
                      <th className="px-6 py-3 text-center font-bold text-gray-500 uppercase font-outfit">Passout</th>
                      <th className="px-6 py-3 text-right font-bold text-gray-500 uppercase font-outfit">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-gray-955 font-outfit">{st.name}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{st.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-700">{st.department || "N/A"}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">PRN: {st.rollNumber || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                            CGPA: {st.cgpa ? st.cgpa.toFixed(2) : "0.00"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-gray-600">
                          {st.graduationYear || 2027}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                          <span className={`inline-flex text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            st.placementStatus === "PLACED" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {st.placementStatus}
                          </span>
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
    );
  };

  const renderAlumniTab = () => {
    const filteredAlumni = allAlumni.filter((al) => {
      const q = alumniSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        (al.name && al.name.toLowerCase().includes(q)) ||
        (al.email && al.email.toLowerCase().includes(q)) ||
        (al.company && al.company.toLowerCase().includes(q)) ||
        (al.role && al.role.toLowerCase().includes(q)) ||
        (al.department && al.department.toLowerCase().includes(q))
      );
    });

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 shadow-md border border-brand-red/10">
          <h2 className="text-xl md:text-2xl font-extrabold font-outfit">Alumni Directory & Verification</h2>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Manage professional alumni connections, verify registration credentials, and track corporate placements.
          </p>
        </div>

        {/* Verification queue card */}
        <Card hover={false} className="bg-white border-gray-150 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
            <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider">
              Pending Registrations ({pendingAlumni.length})
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {pendingAlumni.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                <CheckCircle size={28} className="text-emerald-500 opacity-75" />
                <p className="font-semibold text-gray-700">Verification Queue Empty!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-150 text-xs">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Alumni</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Corporate details</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Passout</th>
                      <th className="px-6 py-3 text-right font-bold text-gray-500 uppercase font-outfit">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {pendingAlumni.map((al) => (
                      <tr key={al.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-gray-955 font-outfit">{al.name}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{al.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-700">{al.designation}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{al.company}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-600">
                          Class of {al.graduationYear}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleApproveAlumni(al.id, al.name)}
                              className="px-3 py-1 bg-brand-red hover:bg-brand-darkRed text-white text-[10px] font-bold rounded-lg transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectAlumni(al.id, al.name)}
                              className="px-3 py-1 border border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-600 text-[10px] font-bold rounded-lg transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Directory Card */}
        <Card hover={false} className="bg-white border-gray-150 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100 py-4 px-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider">
              Verified Alumni Directory ({filteredAlumni.length})
            </h3>
            <div className="relative w-full sm:w-64 text-gray-800">
              <input
                type="text"
                value={alumniSearch}
                onChange={(e) => setAlumniSearch(e.target.value)}
                placeholder="Search alumni..."
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {filteredAlumni.length === 0 ? (
              <p className="p-8 text-center text-xs text-gray-400 font-medium">No verified alumni match your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-150 text-xs">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Alumni</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Employment Details</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Passout</th>
                      <th className="px-6 py-3 text-right font-bold text-gray-500 uppercase font-outfit">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredAlumni.map((al) => (
                      <tr key={al.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-gray-955 font-outfit">{al.name}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{al.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-700">{al.role || "N/A"}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{al.company || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-600">
                          Class of {al.graduationYear || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                          <span className={`inline-flex text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            al.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {al.isVerified ? "Verified" : "Pending Approval"}
                          </span>
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
    );
  };

  const renderCompaniesTab = () => {
    const filteredCompanies = companies.filter((c) => {
      const q = companySearch.toLowerCase().trim();
      if (!q) return true;
      return (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.industry && c.industry.toLowerCase().includes(q))
      );
    });

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 shadow-md border border-brand-red/10 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold font-outfit">Corporate Partners & Recruiting Drives</h2>
            <p className="text-xs text-gray-300 font-sans mt-1">
              Review partner companies, industries, and monitor corporate engagement stats.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCompanyModal(true)}
            className="bg-brand-red hover:bg-brand-darkRed text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 flex-shrink-0"
          >
            <PlusCircle size={15} /> Add Company
          </Button>
        </div>

        <div className="flex justify-end text-gray-800">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              placeholder="Search companies by name or industry..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" />
          </div>
        </div>

        {filteredCompanies.length === 0 ? (
          <p className="p-8 text-center text-xs text-gray-400 font-medium bg-white rounded-2xl border border-gray-150">No partner companies match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((c) => {
            const letter = c.name ? c.name.charAt(0).toUpperCase() : "C";
            return (
              <Card key={c.id} className="bg-white border-gray-150 shadow-sm flex flex-col justify-between h-48">
                <CardBody className="p-5 flex flex-col justify-between h-full">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-brand-black text-white font-black text-lg flex items-center justify-center flex-shrink-0 font-outfit shadow-sm">
                      {letter}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-955 font-outfit truncate">{c.name}</h4>
                      <span className="inline-flex text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase font-outfit mt-1">
                        {c.industry || "Technology"}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs text-gray-500">
                    <span>Active Postings</span>
                    <span className="font-extrabold text-brand-red">{c.jobs ? c.jobs.length : 0} positions</span>
                  </div>
                </CardBody>
              </Card>
            );
          })}
          </div>
        )}

        {showCompanyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-gray-150 max-w-md w-full shadow-2xl p-6 relative animate-slide-up text-gray-800">
              <h3 className="text-base font-bold text-gray-900 font-outfit uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
                Add New Partner Company
              </h3>
              
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 font-outfit text-gray-500">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    placeholder="e.g. Microsoft India"
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white font-sans text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 font-outfit text-gray-500">Industry *</label>
                  <input
                    type="text"
                    required
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                    placeholder="e.g. Cloud Computing"
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white font-sans text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 font-outfit text-gray-500">Website URL</label>
                  <input
                    type="url"
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                    placeholder="https://example.com"
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white font-sans text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 font-outfit text-gray-500">Description</label>
                  <textarea
                    value={newCompany.description}
                    onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                    placeholder="Brief description of recruitment partnership or profile..."
                    rows="3"
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white font-sans text-gray-800"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowCompanyModal(false)}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-xs font-bold font-outfit"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    loading={savingCompany}
                    className="px-4 py-2 bg-brand-red hover:bg-brand-darkRed text-white rounded-xl text-xs font-bold font-outfit"
                  >
                    Upload Company
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderJobsTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 shadow-md border border-brand-red/10">
          <h2 className="text-xl md:text-2xl font-extrabold font-outfit">Placement Openings</h2>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Monitor open job postings, salary packages, eligibility filters, and corporate specifications.
          </p>
        </div>

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <p className="p-8 text-center text-xs text-gray-400 font-medium bg-white rounded-2xl border border-gray-150">No job postings created yet.</p>
          ) : (
            jobs.map((j) => (
              <Card key={j.id} className="bg-white border-gray-150 shadow-sm">
                <CardBody className="p-5 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-955 font-outfit">{j.title}</h4>
                      <span className="bg-red-50 text-brand-red text-[9px] font-extrabold uppercase px-2 py-0.5 rounded font-outfit">
                        {j.company}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-sans line-clamp-2 leading-relaxed">{j.description}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 font-semibold pt-1">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Min CGPA: {j.minCgpa ? j.minCgpa.toFixed(2) : "0.00"}</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Dept: {j.department || "All Branches"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-start md:items-end flex-shrink-0 min-w-32 gap-3">
                    <div className="text-right">
                      <span className="text-base font-black text-brand-black font-outfit">{j.salaryPackage || "N/A"}</span>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase mt-1 font-outfit">Drive Active</span>
                    </div>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/jobs?jobId=${j.id}`;
                        navigator.clipboard.writeText(link);
                        showToast(`Job link for "${j.title}" copied to clipboard!`, "success");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-brand-red text-brand-red hover:bg-brand-red hover:text-white rounded-lg text-xs font-bold font-outfit transition"
                    >
                      <Share2 size={13} /> Share Job
                    </button>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderEventsTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 shadow-md border border-brand-red/10 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold font-outfit">Placement Prep Events</h2>
            <p className="text-xs text-gray-300 font-sans mt-1">
              Track schedules of coding competitions, placement prep seminars, and mentor sessions.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={openEventModal}
            className="bg-brand-red hover:bg-brand-darkRed text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 flex-shrink-0"
          >
            <PlusCircle size={15} /> Add Event
          </Button>
        </div>

        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="p-8 text-center text-xs text-gray-400 font-medium bg-white rounded-2xl border border-gray-150">No events scheduled yet.</p>
          ) : (
            events.map((e) => (
              <Card key={e.id} className="bg-white border-gray-150 shadow-sm">
                <CardBody className="p-5 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-gray-955 font-outfit">{e.title}</h4>
                    <p className="text-xs text-gray-500 font-sans leading-relaxed">{e.description}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-gray-400 pt-1.5">
                      <span>Speaker: <strong className="text-gray-600">{e.speaker || "N/A"}</strong></span>
                      <span>•</span>
                      <span>Venue: <strong className="text-gray-600">{e.venue || "N/A"}</strong></span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-start md:items-end flex-shrink-0 min-w-44 text-right">
                    <span className="text-xs font-bold text-brand-red font-outfit">{e.date} at {e.time}</span>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase mt-2">
                      {e.registrations ? e.registrations.length : 0} Registrations
                    </span>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>

        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-gray-150 max-w-md w-full shadow-2xl p-6 relative animate-slide-up text-gray-800">
              <h3 className="text-base font-bold text-gray-900 font-outfit uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
                Schedule New Prep Event
              </h3>
              
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 font-outfit text-gray-500">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="e.g. Resume Building Bootcamp"
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white font-sans text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 font-outfit text-gray-500">Speaker *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.speaker}
                    onChange={(e) => setNewEvent({ ...newEvent, speaker: e.target.value })}
                    placeholder="e.g. Janhavi Mali (TPO Officer)"
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white font-sans text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 font-outfit text-gray-500">Venue / Online Link *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="e.g. Seminar Hall 2 or Zoom Link"
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white font-sans text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 font-outfit text-gray-500">Start Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="block w-full border border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white font-sans text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 font-outfit text-gray-500">End Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="block w-full border border-gray-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white font-sans text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 font-outfit text-gray-500">Description *</label>
                  <textarea
                    required
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Brief description of topics covered, requirements..."
                    rows="3"
                    className="block w-full border border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white font-sans text-gray-800"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-xs font-bold font-outfit"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    loading={savingEvent}
                    className="px-4 py-2 bg-brand-red hover:bg-brand-darkRed text-white rounded-xl text-xs font-bold font-outfit"
                  >
                    Schedule Event
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalyticsTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 shadow-md border border-brand-red/10">
          <h2 className="text-xl md:text-2xl font-extrabold font-outfit">Placement Analytics & Administrative Logs</h2>
          <p className="text-xs text-gray-300 font-sans mt-1">
            View placement drive stats, generate report CSVs, and inspect placement verification audit logs.
          </p>
        </div>

        {/* First section: Placement rates & downloads (Grid layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card hover={false} className="bg-white border-gray-150 shadow-sm h-full">
              <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
                <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 size={16} className="text-brand-red" /> Departmental Rates
                </h3>
              </CardHeader>
              <CardBody className="p-5 space-y-4">
                {departmentPlacements.map((dept, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700">{dept.name}</span>
                      <span className="font-extrabold text-brand-black">{dept.rate}% Placed</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                      <div 
                        className={`h-full ${dept.color} rounded-full transition-all duration-500`}
                        style={{ width: `${dept.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          <div>
            <Card hover={false} className="bg-white border-gray-150 shadow-sm h-full flex flex-col justify-between">
              <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
                <h3 className="text-xs font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 size={15} className="text-brand-red" /> Download csv reports
                </h3>
              </CardHeader>
              <CardBody className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Select Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red"
                  >
                    <option value="GENERAL">General Summary (CSV)</option>
                    <option value="STUDENT">All Registered Students (CSV)</option>
                    <option value="PLACED">Placed Students Only (CSV)</option>
                    <option value="COMPANY">Recruiting Companies (CSV)</option>
                    <option value="PENDING_APPLICATIONS">Pending Drive Applications (CSV)</option>
                  </select>
                </div>
                <Button
                  variant="primary"
                  onClick={handleDownloadReport}
                  loading={downloadingReport}
                  className="w-full bg-brand-black hover:bg-brand-red text-white py-2 text-xs font-extrabold"
                >
                  Download Report File
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Audit logs table */}
        <Card hover={false} className="bg-white border-gray-150 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
            <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider">
              System Audit Logs ({logs.length})
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {logs.length === 0 ? (
              <p className="p-8 text-center text-xs text-gray-400 font-medium">No actions logged in the audit trail yet.</p>
            ) : (
              <div className="overflow-y-auto max-h-80">
                <table className="min-w-full divide-y divide-gray-150 text-[11px]">
                  <thead className="bg-gray-50/50 sticky top-0">
                    <tr>
                      <th className="px-6 py-2.5 text-left font-bold text-gray-500 uppercase font-outfit">Timestamp</th>
                      <th className="px-6 py-2.5 text-left font-bold text-gray-500 uppercase font-outfit">Action</th>
                      <th className="px-6 py-2.5 text-left font-bold text-gray-500 uppercase font-outfit">Performed By</th>
                      <th className="px-6 py-2.5 text-left font-bold text-gray-500 uppercase font-outfit">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-2 whitespace-nowrap text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          <span className="font-mono bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap font-semibold text-gray-700">
                          {log.performedByEmail}
                        </td>
                        <td className="px-6 py-2 text-gray-600 font-medium font-sans">
                          {log.description}
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
    );
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-red border-t-transparent"></div>
        <p className="mt-4 text-xs font-semibold text-gray-500 font-outfit">Loading administrative dashboard...</p>
      </div>
    );
  }

  if (activeTab === "students") {
    return renderStudentsTab();
  }
  if (activeTab === "alumni") {
    return renderAlumniTab();
  }
  if (activeTab === "companies") {
    return renderCompaniesTab();
  }
  if (activeTab === "jobs") {
    return renderJobsTab();
  }
  if (activeTab === "events") {
    return renderEventsTab();
  }
  if (activeTab === "analytics") {
    return renderAnalyticsTab();
  }

  return (
    <div className="space-y-6">
      {/* TPO Welcome Card */}
      <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden border border-brand-red/10">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-brand-red/20 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="bg-brand-red text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            <Sparkles size={9} /> Administrative Portal
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-outfit">Welcome, {user?.name || "TPO Officer"}</h2>
          <p className="text-sm text-gray-300 font-sans mt-1">
            Training & Placement Office • Campus Placement & Corporate Relations Panel
          </p>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Overall Placement Rate", count: `${stats.placementRate}%`, icon: <TrendingUp size={20} className="text-white" />, bg: "bg-brand-red" },
          { label: "Students Placed", count: stats.placedStudents, icon: <Users size={20} className="text-white" />, bg: "bg-brand-black" },
          { label: "Partner Companies", count: stats.activeRecruiters, icon: <Building size={20} className="text-white" />, bg: "bg-brand-red" },
          { label: "Approved Alumni Mentors", count: stats.approvedMentors, icon: <Award size={20} className="text-white" />, bg: "bg-brand-black" }
        ].map((stat, idx) => (
          <Card key={idx} hover={false} className="bg-white border-gray-150 shadow-xs">
            <CardBody className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 font-outfit uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-brand-black font-outfit">{stat.count}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} shadow-md`}>
                {stat.icon}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* GRAPH SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: SVG placement rates and Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Department placement rates */}
          <Card hover={false} className="bg-white border-gray-150 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
              <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 size={16} className="text-brand-red" /> Placement Rates by Department (Class of 2025)
              </h3>
            </CardHeader>
            <CardBody className="p-5 space-y-4">
              {departmentPlacements.map((dept, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-700">{dept.name}</span>
                    <span className="font-extrabold text-brand-black">{dept.rate}% Placed</span>
                  </div>
                  {/* CSS Progress Bar */}
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                    <div 
                      className={`h-full ${dept.color} rounded-full transition-all duration-500`}
                      style={{ width: `${dept.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Pending Alumni Approvals Table */}
          <Card hover={false} className="bg-white border-gray-150 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 flex justify-between items-center py-4 px-5">
              <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <Award size={16} className="text-brand-red" /> Pending Alumni Verifications ({pendingAlumni.length})
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              {pendingAlumni.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                  <CheckCircle size={32} className="text-emerald-500 opacity-75" />
                  <p className="font-semibold text-gray-700">Verification Queue Empty!</p>
                  <p className="text-xs">No pending alumni credentials requiring verification at this time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-150 text-xs">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Alumni</th>
                        <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Company / Designation</th>
                        <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Passout</th>
                        <th className="px-6 py-3 text-right font-bold text-gray-500 uppercase font-outfit">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {pendingAlumni.map((al) => (
                        <tr key={al.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-bold text-gray-950 font-outfit">{al.name}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{al.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-gray-700">{al.designation}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{al.company}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-600">
                            Class of {al.graduationYear}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleApproveAlumni(al.id, al.name)}
                                className="px-3 py-1 bg-brand-red hover:bg-brand-darkRed text-white text-[10px] font-bold rounded-lg transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectAlumni(al.id, al.name)}
                                className="px-3 py-1 border border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-600 text-[10px] font-bold rounded-lg transition-all"
                              >
                                Reject
                              </button>
                            </div>
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

        {/* Right column: Corporate recruitment partner stats */}
        <div className="space-y-6">
          {/* TPO Report Downloads Card */}
          <Card hover={false} className="bg-white border-gray-150 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
              <h3 className="text-xs font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 size={15} className="text-brand-red" /> Generate placement reports
              </h3>
            </CardHeader>
            <CardBody className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Select Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red"
                >
                  <option value="GENERAL">General Summary (CSV)</option>
                  <option value="STUDENT">All Registered Students (CSV)</option>
                  <option value="PLACED">Placed Students Only (CSV)</option>
                  <option value="COMPANY">Recruiting Companies (CSV)</option>
                  <option value="PENDING_APPLICATIONS">Pending Drive Applications (CSV)</option>
                </select>
              </div>
              <Button
                variant="primary"
                onClick={handleDownloadReport}
                loading={downloadingReport}
                className="w-full bg-brand-black hover:bg-brand-red text-white py-2 text-xs font-extrabold"
              >
                Download Report File
              </Button>
            </CardBody>
          </Card>

          <Card hover={false} className="bg-white border-gray-150 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
              <h3 className="text-xs font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <Building size={15} className="text-brand-red" /> Placement Drives & Partners ({partners.length})
              </h3>
            </CardHeader>
            <CardBody className="p-4 space-y-3.5">
              {partners.map((partner, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-150 flex flex-col gap-2 relative">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-950 font-outfit">{partner.name}</h4>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      partner.status === "Active Drive" ? "bg-red-50 text-brand-red border border-red-100" :
                      partner.status === "Recruiting" ? "bg-slate-900 text-white" : "bg-gray-150 text-gray-500"
                    }`}>
                      {partner.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 border-t border-gray-150 pt-2">
                    <span>Active placements:</span>
                    <span className="font-extrabold text-brand-red">{partner.jobsCount} open posts</span>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default TPODashboard;
