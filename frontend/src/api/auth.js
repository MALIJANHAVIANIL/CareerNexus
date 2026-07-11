import apiClient from "./client";

// Pre-seeded PRN to email maps for convenience when testing with actual DB users
const seedPrnMappings = () => {
  const seeds = {
    "rn1781694145106": "student@test.com",
    "cdac001": "janhavi@test.com",
    "jan001": "janhavi@gmail.com",
    "cdac006": "student1@test.com",
    "ce001": "teststudent@test.com",
    "rn1781600088893": "debugstudent@test.com",
    "bt2025001": "janhavi1@test.com"
  };

  for (const [prn, email] of Object.entries(seeds)) {
    const key = `cn_prn_map_${prn.toLowerCase()}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, email);
    }
  }
};

// Seed mappings immediately when this module is imported
seedPrnMappings();

// Map backend role to frontend role representation
const mapRoleToFrontend = (backendRole) => {
  if (backendRole === "ADMIN") return "tpo";
  return backendRole.toLowerCase(); // STUDENT -> student, ALUMNI -> alumni, HR -> hr
};

// Map frontend role to backend role representation
const mapRoleToBackend = (frontendRole) => {
  if (frontendRole === "tpo") return "ADMIN";
  return frontendRole.toUpperCase(); // student -> STUDENT, alumni -> ALUMNI, hr -> HR
};

export const authApi = {
  login: async (credentials) => {
    const { role, password, email, identifier } = credentials;

    let targetEmail = email;

    // Resolve PRN to Email if student logged in with PRN
    if (role === "student") {
      const input = identifier.trim();
      if (!input.includes("@")) {
        // Resolve from local storage mapping
        const resolvedEmail = localStorage.getItem(`cn_prn_map_${input.toLowerCase()}`);
        if (!resolvedEmail) {
          throw new Error("PRN mapping not found locally. Please log in with your college email first.");
        }
        targetEmail = resolvedEmail;
      } else {
        targetEmail = input;
      }
    }

    // Call actual backend login endpoint
    const response = await apiClient.post("/api/auth/login", {
      email: targetEmail,
      password: password,
    });

    const { token, fullName, role: backendRole } = response.data;

    // Store token temporarily to fetch profile
    localStorage.setItem("cn_token", token);

    // Build the user details based on role-specific backend profile endpoints
    let mappedUser = {
      email: targetEmail,
      name: fullName,
      role: mapRoleToFrontend(backendRole),
    };

    try {
      if (backendRole === "STUDENT") {
        const profileRes = await apiClient.get("/api/users/profile/student");
        const profile = profileRes.data;
        mappedUser = {
          ...mappedUser,
          prn: profile.rollNumber,
          branch: profile.department,
          passingYear: profile.graduationYear,
        };
        // Ensure local mapping is kept up to date
        if (profile.rollNumber) {
          localStorage.setItem(`cn_prn_map_${profile.rollNumber.toLowerCase()}`, targetEmail);
        }
      } else if (backendRole === "ALUMNI") {
        const profileRes = await apiClient.get("/api/users/profile/alumni");
        const profile = profileRes.data;
        mappedUser = {
          ...mappedUser,
          company: profile.currentCompany,
          designation: profile.currentRole,
          passoutYear: profile.graduationYear,
        };
      } else if (backendRole === "HR") {
        const profileRes = await apiClient.get("/api/users/profile/hr");
        const profile = profileRes.data;
        mappedUser = {
          ...mappedUser,
          companyId: profile.companyId,
          company: profile.companyName,
          designation: profile.designation,
        };
      }
    } catch (profileError) {
      console.warn("Failed to retrieve user profile details: ", profileError);
    }

    // Save final user object and token
    localStorage.setItem("cn_token", token);
    localStorage.setItem("cn_user", JSON.stringify(mappedUser));

    return { success: true, token, user: mappedUser };
  },

  registerStudent: async (studentData) => {
    const { name, prn, email, branch, passingYear, password } = studentData;

    // 1. Create the user credential on the backend
    const regResponse = await apiClient.post("/api/auth/register", {
      email: email,
      password: password,
      fullName: name,
      role: "STUDENT",
    });

    const { token } = regResponse.data;

    // Store token so the profile update call includes authorization
    localStorage.setItem("cn_token", token);

    // 2. Initialize student profile on the backend
    await apiClient.put("/api/users/profile/student", {
      rollNumber: prn,
      department: branch,
      cgpa: 0.0,
      graduationYear: parseInt(passingYear, 10),
      skills: "",
    });

    const mappedUser = {
      email,
      name,
      role: "student",
      prn,
      branch,
      passingYear,
    };

    // Save mapping for future PRN logins
    localStorage.setItem(`cn_prn_map_${prn.toLowerCase()}`, email);

    // Clean up temporary registration token and user so they must login manually
    localStorage.removeItem("cn_token");
    localStorage.removeItem("cn_user");

    return { success: true, user: mappedUser };
  },

  registerAlumni: async (alumniData) => {
    const { name, prn, passoutYear, company, designation, email, password } = alumniData;

    // 1. Create user credential on the backend
    const regResponse = await apiClient.post("/api/auth/register", {
      email: email,
      password: password,
      fullName: name,
      role: "ALUMNI",
    });

    const { token } = regResponse.data;

    // Store token so profile update call includes authorization
    localStorage.setItem("cn_token", token);

    // 2. Initialize alumni profile on the backend
    await apiClient.put("/api/users/profile/alumni", {
      currentCompany: company,
      currentRole: designation,
      graduationYear: parseInt(passoutYear, 10),
      department: "Computer Engineering", // default branch
      industry: "Technology", // default industry
    });

    const mappedUser = {
      email,
      name,
      role: "alumni",
      company,
      designation,
      passoutYear,
    };

    // Clean up temporary registration token and user so they must login manually
    localStorage.removeItem("cn_token");
    localStorage.removeItem("cn_user");

    return { success: true, user: mappedUser };
  },

  registerHR: async (hrData) => {
    const { name, email, password, companyId, designation, companyName, isCustomCompany } = hrData;

    // 1. Create user credential on the backend
    const regResponse = await apiClient.post("/api/auth/register", {
      email: email,
      password: password,
      fullName: name,
      role: "HR",
    });

    const { token } = regResponse.data;

    // Store token so profile update call includes authorization
    localStorage.setItem("cn_token", token);

    // 2. Initialize HR profile on the backend
    await apiClient.put("/api/users/profile/hr", {
      companyId: isCustomCompany ? null : parseInt(companyId, 10),
      companyName: isCustomCompany ? companyName : null,
      designation: designation,
    });

    const mappedUser = {
      email,
      name,
      role: "hr",
      companyId: isCustomCompany ? null : companyId,
      designation,
    };

    // Clean up temporary registration token and user so they must login manually
    localStorage.removeItem("cn_token");
    localStorage.removeItem("cn_user");

    return { success: true, user: mappedUser };
  },

  getCurrentUser: () => {
    const token = localStorage.getItem("cn_token");
    const userStr = localStorage.getItem("cn_user");
    if (token && userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem("cn_token");
    localStorage.removeItem("cn_user");
  }
};
