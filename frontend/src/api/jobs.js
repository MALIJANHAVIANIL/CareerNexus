import { mockJobs } from "./mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredJobs = () => {
  const jobs = localStorage.getItem("cn_jobs");
  if (!jobs) {
    localStorage.setItem("cn_jobs", JSON.stringify(mockJobs));
    return mockJobs;
  }
  return JSON.parse(jobs);
};

export const jobsApi = {
  getAllJobs: async () => {
    await delay(400);
    return getStoredJobs();
  },

  getJobById: async (jobId) => {
    await delay(200);
    const jobs = getStoredJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job) throw new Error("Job not found");
    return job;
  },

  postJob: async (jobData) => {
    await delay(700);
    const jobs = getStoredJobs();
    const newJob = {
      id: `job-${Date.now()}`,
      postedDate: "Just now",
      applicantsCount: 0,
      logo: jobData.company ? jobData.company[0].toUpperCase() : "C",
      logoBg: "bg-red-800",
      ...jobData
    };
    jobs.unshift(newJob);
    localStorage.setItem("cn_jobs", JSON.stringify(jobs));
    return newJob;
  },

  saveJob: async (jobId) => {
    await delay(300);
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) throw new Error("Please log in first.");
    const user = JSON.parse(userStr);
    
    if (!user.savedJobs) user.savedJobs = [];
    
    const index = user.savedJobs.indexOf(jobId);
    if (index > -1) {
      user.savedJobs.splice(index, 1); // Unsaves
    } else {
      user.savedJobs.push(jobId);
    }
    
    localStorage.setItem("cn_user", JSON.stringify(user));
    return user.savedJobs;
  }
};
