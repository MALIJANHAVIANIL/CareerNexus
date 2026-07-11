import apiClient from "./client";

export const profileApi = {
  getProfile: async (userId) => {
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) throw new Error("No active user session.");
    const user = JSON.parse(userStr);

    let profileEndpoint = "/api/users/profile/student";
    if (user.role === "alumni" || user.role === "ALUMNI") {
      profileEndpoint = "/api/users/profile/alumni";
    } else if (user.role === "hr" || user.role === "HR") {
      profileEndpoint = "/api/users/profile/hr";
    } else if (user.role === "admin" || user.role === "ADMIN") {
      profileEndpoint = "/api/users/profile/admin";
    }

    const res = await apiClient.get(profileEndpoint);
    const p = res.data;

    // Return combined profile and user object
    return {
      ...user,
      rollNumber: p.rollNumber || "",
      department: p.department || "",
      cgpa: p.cgpa || 0.0,
      graduationYear: p.graduationYear || 2026,
      skills: p.skills || "",
      summary: p.summary || "",
      internships: p.internships ? JSON.parse(p.internships) : [],
      projects: p.projects ? JSON.parse(p.projects) : [],
      languages: p.languages ? JSON.parse(p.languages) : [],
      certifications: p.certifications ? JSON.parse(p.certifications) : [],
      socials: p.socials ? JSON.parse(p.socials) : { linkedin: "", github: "", portfolio: "" },
      resumeName: p.resumeName || "",
      resumeSize: p.resumeSize || "",
      resumeUploaded: p.resumeUploaded || ""
    };
  },

  updateProfile: async (profileData) => {
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) throw new Error("No active user session.");
    const user = JSON.parse(userStr);

    let profileEndpoint = "/api/users/profile/student";
    let payload = {};

    if (user.role === "student" || user.role === "STUDENT") {
      profileEndpoint = "/api/users/profile/student";
      payload = {
        rollNumber: profileData.rollNumber,
        department: profileData.department,
        cgpa: parseFloat(profileData.cgpa) || 0.0,
        graduationYear: parseInt(profileData.graduationYear, 10) || 2026,
        skills: profileData.skills || "",
        summary: profileData.summary || "",
        internships: profileData.internships ? JSON.stringify(profileData.internships) : "[]",
        projects: profileData.projects ? JSON.stringify(profileData.projects) : "[]",
        languages: profileData.languages ? JSON.stringify(profileData.languages) : "[]",
        certifications: profileData.certifications ? JSON.stringify(profileData.certifications) : "[]",
        socials: profileData.socials ? JSON.stringify(profileData.socials) : "{}"
      };
    } else if (user.role === "alumni" || user.role === "ALUMNI") {
      profileEndpoint = "/api/users/profile/alumni";
      payload = {
        currentCompany: profileData.currentCompany,
        currentRole: profileData.currentRole,
        graduationYear: parseInt(profileData.graduationYear, 10) || 2024,
        department: profileData.department,
        industry: profileData.industry,
        summary: profileData.summary || "",
        internships: profileData.internships ? JSON.stringify(profileData.internships) : "[]",
        projects: profileData.projects ? JSON.stringify(profileData.projects) : "[]",
        languages: profileData.languages ? JSON.stringify(profileData.languages) : "[]",
        certifications: profileData.certifications ? JSON.stringify(profileData.certifications) : "[]",
        socials: profileData.socials ? JSON.stringify(profileData.socials) : "{}"
      };
    } else if (user.role === "hr" || user.role === "HR") {
      profileEndpoint = "/api/users/profile/hr";
      payload = {
        companyId: parseInt(profileData.companyId, 10),
        designation: profileData.designation
      };
    }

    const res = await apiClient.put(profileEndpoint, payload);
    return res.data;
  },

  uploadAvatar: async (base64Image) => {
    const userStr = localStorage.getItem("cn_user");
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      const updatedUser = { ...currentUser, avatar: base64Image };
      localStorage.setItem("cn_user", JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw new Error("Session expired.");
  },

  uploadResume: async (fileName, fileUrl = "#") => {
    // 1. Save Resume entry in the database
    const newResume = await apiClient.post("/api/resumes", {
      resumeUrl: fileUrl,
      fileName: fileName,
      isPrimary: true
    });

    // 2. Update StudentProfile with resume meta details
    const userStr = localStorage.getItem("cn_user");
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      try {
        const studentProfileRes = await apiClient.get("/api/users/profile/student");
        const sp = studentProfileRes.data;

        await apiClient.put("/api/users/profile/student", {
          rollNumber: sp.rollNumber,
          department: sp.department,
          cgpa: sp.cgpa,
          graduationYear: sp.graduationYear,
          skills: sp.skills,
          summary: sp.summary,
          internships: sp.internships,
          projects: sp.projects,
          languages: sp.languages,
          certifications: sp.certifications,
          socials: sp.socials,
          resumeName: fileName,
          resumeSize: "1.2 MB",
          resumeUploaded: new Date().toLocaleDateString()
        });
      } catch (err) {
        console.warn("Could not sync resume metadata to student profile:", err);
      }
    }

    return newResume.data;
  }
};
