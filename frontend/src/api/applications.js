import { mockJobs } from "./mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredApplications = () => {
  const apps = localStorage.getItem("cn_applications");
  if (!apps) {
    // Seed some initial applications
    const initialApps = [
      {
        id: "app-1",
        jobId: "job-1",
        jobTitle: "Frontend Developer Intern",
        company: "Stripe",
        studentId: "user-1",
        studentName: "Alex Rivera",
        studentEmail: "student@careernexus.com",
        studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        coverLetter: "I would love to join the dashboard engineering team at Stripe!",
        status: "applied",
        date: "2026-06-10"
      },
      {
        id: "app-2",
        jobId: "job-3",
        jobTitle: "Associate Product Manager",
        company: "Atlassian",
        studentId: "user-1",
        studentName: "Alex Rivera",
        studentEmail: "student@careernexus.com",
        studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        coverLetter: "I have strong leadership skills as president of my university's CS club.",
        status: "shortlisted",
        date: "2026-06-12"
      }
    ];
    localStorage.setItem("cn_applications", JSON.stringify(initialApps));
    return initialApps;
  }
  return JSON.parse(apps);
};

export const applicationsApi = {
  applyToJob: async (jobId, coverLetter) => {
    await delay(800);
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) throw new Error("Please log in to apply.");
    const user = JSON.parse(userStr);

    const jobs = JSON.parse(localStorage.getItem("cn_jobs") || JSON.stringify(mockJobs));
    const job = jobs.find((j) => j.id === jobId);
    if (!job) throw new Error("Job not found.");

    const apps = getStoredApplications();
    const alreadyApplied = apps.some((a) => a.jobId === jobId && a.studentId === user.id);
    if (alreadyApplied) throw new Error("You have already applied to this job.");

    const newApp = {
      id: `app-${Date.now()}`,
      jobId,
      jobTitle: job.title,
      company: job.company,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      studentAvatar: user.avatar,
      coverLetter,
      status: "applied",
      date: new Date().toISOString().split("T")[0]
    };

    apps.unshift(newApp);
    localStorage.setItem("cn_applications", JSON.stringify(apps));

    // Update user's applied jobs count
    if (!user.appliedJobs) user.appliedJobs = [];
    user.appliedJobs.push({ jobId, status: "applied", date: newApp.date });
    localStorage.setItem("cn_user", JSON.stringify(user));

    return newApp;
  },

  getStudentApplications: async () => {
    await delay(300);
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) return [];
    const user = JSON.parse(userStr);
    const apps = getStoredApplications();
    return apps.filter((a) => a.studentId === user.id);
  },

  getHRApplications: async (companyName) => {
    await delay(500);
    const apps = getStoredApplications();
    // Return applications for jobs matching the HR user's company
    if (companyName) {
      return apps.filter((a) => a.company.toLowerCase() === companyName.toLowerCase());
    }
    return apps; // Return all for demo purposes
  },

  updateApplicationStatus: async (applicationId, status) => {
    await delay(600);
    const apps = getStoredApplications();
    const appIndex = apps.findIndex((a) => a.id === applicationId);
    if (appIndex === -1) throw new Error("Application not found.");
    
    apps[appIndex].status = status;
    localStorage.setItem("cn_applications", JSON.stringify(apps));
    
    // If the student is the current logged-in user, sync their storage
    const userStr = localStorage.getItem("cn_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id === apps[appIndex].studentId && user.appliedJobs) {
        const index = user.appliedJobs.findIndex((j) => j.jobId === apps[appIndex].jobId);
        if (index > -1) {
          user.appliedJobs[index].status = status;
          localStorage.setItem("cn_user", JSON.stringify(user));
        }
      }
    }
    return apps[appIndex];
  }
};
