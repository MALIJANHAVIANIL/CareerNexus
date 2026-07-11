import apiClient from "./client";

const mapStatusToFrontend = (backendStatus) => {
  const map = {
    APPLIED: "applied",
    SHORTLISTED: "shortlisted",
    INTERVIEWING: "interviewing",
    SELECTED: "offered",
    REJECTED: "rejected"
  };
  return map[backendStatus] || "applied";
};

const mapStatusToBackend = (frontendStatus) => {
  const map = {
    applied: "APPLIED",
    shortlisted: "SHORTLISTED",
    interviewing: "INTERVIEWING",
    offered: "SELECTED",
    rejected: "REJECTED"
  };
  return map[frontendStatus] || "APPLIED";
};

const mapBackendAppToFrontend = (app) => {
  if (!app) return null;
  return {
    id: app.id.toString(),
    jobId: app.jobId.toString(),
    jobTitle: app.jobTitle,
    company: app.companyName,
    studentId: app.studentId.toString(),
    studentName: app.studentName,
    studentEmail: `student_${app.studentId}@careernexus.com`,
    studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    coverLetter: app.feedback || "Applied via CareerNexus portal.",
    status: mapStatusToFrontend(app.status),
    date: app.appliedAt ? app.appliedAt.split("T")[0] : "Just now"
  };
};

export const applicationsApi = {
  applyToJob: async (jobId, coverLetter) => {
    // 1. Check/Get primary resume
    let resumeId = null;
    try {
      const resumesRes = await apiClient.get("/api/resumes");
      if (resumesRes.data && resumesRes.data.length > 0) {
        resumeId = resumesRes.data[0].id;
      } else {
        // Create a default placeholder resume
        const newResume = await apiClient.post("/api/resumes", {
          resumeUrl: "#",
          fileName: "My_Resume.pdf",
          isPrimary: true
        });
        resumeId = newResume.data.id;
      }
    } catch (e) {
      // Fallback fallback
      const newResume = await apiClient.post("/api/resumes", {
        resumeUrl: "#",
        fileName: "My_Resume.pdf",
        isPrimary: true
      });
      resumeId = newResume.data.id;
    }

    // 2. Submit job application
    const res = await apiClient.post("/api/applications", {
      jobId: parseInt(jobId, 10),
      resumeId: resumeId
    });

    return mapBackendAppToFrontend(res.data);
  },

  getStudentApplications: async () => {
    const res = await apiClient.get("/api/applications/student");
    return (res.data || []).map(mapBackendAppToFrontend);
  },

  getHRApplications: async (companyName) => {
    // 1. Fetch all jobs
    const jobsRes = await apiClient.get("/api/jobs");
    const companyJobs = (jobsRes.data || []).filter(
      (job) => job.companyName.toLowerCase() === companyName.toLowerCase()
    );

    // 2. Fetch applications for each job
    const allApps = [];
    for (const job of companyJobs) {
      try {
        const appsRes = await apiClient.get(`/api/applications/job/${job.id}`);
        allApps.push(...(appsRes.data || []));
      } catch (err) {
        console.error(`Failed to load applications for job ${job.id}:`, err);
      }
    }

    return allApps.map(mapBackendAppToFrontend);
  },

  updateApplicationStatus: async (applicationId, status) => {
    const backendStatus = mapStatusToBackend(status);
    const res = await apiClient.put(`/api/applications/${applicationId}/status`, {
      status: backendStatus,
      feedback: `Status updated to ${status}`
    });
    return mapBackendAppToFrontend(res.data);
  }
};
