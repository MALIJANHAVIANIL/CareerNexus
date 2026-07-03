const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const profileApi = {
  getProfile: async (userId) => {
    await delay(300);
    const userStr = localStorage.getItem("cn_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id === userId) return user;
    }
    throw new Error("Profile not found");
  },

  updateProfile: async (profileData) => {
    await delay(600);
    const userStr = localStorage.getItem("cn_user");
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      const updatedUser = { ...currentUser, ...profileData };
      localStorage.setItem("cn_user", JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw new Error("No active session to update profile.");
  },

  uploadAvatar: async (base64Image) => {
    await delay(800);
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
    await delay(900);
    const userStr = localStorage.getItem("cn_user");
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      const updatedUser = { 
        ...currentUser, 
        resumeName: fileName,
        resumeUrl: fileUrl
      };
      localStorage.setItem("cn_user", JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw new Error("Session expired.");
  }
};
