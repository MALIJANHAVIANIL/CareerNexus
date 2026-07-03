import { mockInterviews } from "./mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredInterviews = () => {
  const ints = localStorage.getItem("cn_interviews");
  if (!ints) {
    localStorage.setItem("cn_interviews", JSON.stringify(mockInterviews));
    return mockInterviews;
  }
  return JSON.parse(ints);
};

export const interviewsApi = {
  getInterviews: async (companyFilter = "") => {
    await delay(300);
    const ints = getStoredInterviews();
    if (companyFilter) {
      return ints.filter((i) => i.company.toLowerCase().includes(companyFilter.toLowerCase()));
    }
    return ints;
  },

  shareExperience: async (expData) => {
    await delay(800);
    const userStr = localStorage.getItem("cn_user");
    if (!userStr) throw new Error("Please log in to share an experience.");
    const user = JSON.parse(userStr);

    const ints = getStoredInterviews();
    
    // Choose diff badge color
    let diffColor = "bg-green-100 text-green-700 border-green-200";
    if (expData.difficulty === "Medium") {
      diffColor = "bg-yellow-100 text-yellow-700 border-yellow-200";
    } else if (expData.difficulty === "Hard") {
      diffColor = "bg-red-100 text-red-700 border-red-200";
    }

    const newExp = {
      id: `int-${Date.now()}`,
      authorName: user.name,
      authorRole: user.role === "alumni" ? "Alumni" : "Student",
      date: new Date().toISOString().split("T")[0],
      difficultyColor: diffColor,
      ...expData
    };

    ints.unshift(newExp);
    localStorage.setItem("cn_interviews", JSON.stringify(ints));
    return newExp;
  }
};
