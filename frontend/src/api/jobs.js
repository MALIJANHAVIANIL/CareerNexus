import apiClient from "./client";

const mapBackendJobToFrontend = (job) => {
  if (!job) return null;
  const typeMap = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    INTERNSHIP: "Internship",
    CONTRACT: "Contract"
  };
  return {
    id: job.id.toString(),
    title: job.title,
    description: job.description,
    company: job.companyName,
    companyId: job.companyId,
    location: job.location,
    salary: job.salaryRange || "N/A",
    type: typeMap[job.jobType] || "Full-time",
    postedDate: job.createdAt ? job.createdAt.split("T")[0] : "Just now",
    applicantsCount: job.totalApplications || 0,
    logo: job.companyLogo || (job.companyName ? job.companyName[0].toUpperCase() : "C"),
    logoBg: "bg-brand-red",
    experience: job.experience || "0-2 years",
    workMode: job.workMode || "In-office",
    openings: job.openings || 1,
    requirements: job.eligibility ? [
      `Minimum CGPA: ${job.eligibility.minimumCgpa || 0.0}`,
      `Eligible Departments: ${job.eligibility.eligibleDepartments || "All"}`,
      `Graduation Years: ${job.eligibility.graduationYears || "All"}`
    ] : ["Proficient in core concepts", "Excellent problem solving skills"]
  };
};

export const jobsApi = {
  getAllJobs: async () => {
    const res = await apiClient.get("/api/jobs");
    return (res.data || []).map(mapBackendJobToFrontend);
  },

  getJobById: async (jobId) => {
    const res = await apiClient.get(`/api/jobs/${jobId}`);
    return mapBackendJobToFrontend(res.data);
  },

  postJob: async (jobData) => {
    const typeReverseMap = {
      "Full-time": "FULL_TIME",
      "Part-time": "PART_TIME",
      "Internship": "INTERNSHIP",
      "Contract": "CONTRACT"
    };

    const userStr = localStorage.getItem("cn_user");
    const user = userStr ? JSON.parse(userStr) : null;
    const companyId = user?.companyId || 1; // fallback to 1 if not set

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + 30);

    const postPayload = {
      title: jobData.title,
      description: jobData.description,
      companyId: companyId,
      location: jobData.location,
      salaryRange: jobData.salary,
      jobType: typeReverseMap[jobData.type] || "FULL_TIME",
      deadline: deadlineDate.toISOString(),
      eligibility: {
        minimumCgpa: 0.0,
        eligibleDepartments: "All",
        graduationYears: "All",
        backlogsAllowed: true,
        minimumTenthPercentage: 0.0,
        minimumTwelfthPercentage: 0.0,
        allowedGapYears: 0,
        bondRequired: false,
        bondDuration: ""
      }
    };

    const res = await apiClient.post("/api/jobs", postPayload);
    return mapBackendJobToFrontend(res.data);
  },

  saveJob: async (jobId) => {
    // Determine current save state
    const savedRes = await apiClient.get("/api/jobs/saved");
    const savedList = savedRes.data || [];
    const isSaved = savedList.some(j => j.id.toString() === jobId.toString());

    if (isSaved) {
      await apiClient.delete(`/api/jobs/${jobId}/save`);
    } else {
      await apiClient.post(`/api/jobs/${jobId}/save`);
    }

    const updatedRes = await apiClient.get("/api/jobs/saved");
    return (updatedRes.data || []).map(j => j.id.toString());
  }
};
