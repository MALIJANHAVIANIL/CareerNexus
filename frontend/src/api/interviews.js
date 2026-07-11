import apiClient from "./client";

const mapBackendInterviewToFrontend = (intExp) => {
  if (!intExp) return null;
  const difficultyMap = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard"
  };
  const diffBadgeMap = {
    EASY: "bg-green-100 text-green-700 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    HARD: "bg-red-100 text-red-700 border-red-200"
  };

  return {
    id: intExp.id.toString(),
    company: intExp.companyName,
    role: intExp.role,
    difficulty: difficultyMap[intExp.difficulty] || "Medium",
    difficultyColor: diffBadgeMap[intExp.difficulty] || "bg-yellow-100 text-yellow-700 border-yellow-200",
    rounds: intExp.rounds || 3,
    experience: intExp.experience,
    authorName: intExp.isAnonymous ? "Anonymous User" : (intExp.userName || "Alumni"),
    authorRole: "Alumni",
    date: intExp.createdAt ? intExp.createdAt.split("T")[0] : "Just now"
  };
};

export const interviewsApi = {
  getInterviews: async (companyFilter = "") => {
    const res = await apiClient.get("/api/interview-experiences");
    let list = (res.data || []).map(mapBackendInterviewToFrontend);
    if (companyFilter) {
      list = list.filter((i) =>
        i.company.toLowerCase().includes(companyFilter.toLowerCase())
      );
    }
    return list;
  },

  shareExperience: async (expData) => {
    // 1. Resolve Company Name to companyId
    let companyId = null;
    const compsRes = await apiClient.get("/api/companies");
    const matchedComp = (compsRes.data || []).find(
      (c) => c.name.toLowerCase() === expData.company.toLowerCase()
    );

    if (matchedComp) {
      companyId = matchedComp.id;
    } else {
      // Create company first
      const newCompRes = await apiClient.post("/api/companies", {
        name: expData.company,
        industry: "Tech",
        website: "https://careernexus.com"
      });
      companyId = newCompRes.data.id;
    }

    const diffMapReverse = {
      Easy: "EASY",
      Medium: "MEDIUM",
      Hard: "HARD"
    };

    const payload = {
      companyId: companyId,
      role: expData.role,
      experience: expData.experience,
      difficulty: diffMapReverse[expData.difficulty] || "MEDIUM",
      rounds: parseInt(expData.rounds, 10) || 3,
      isAnonymous: !!expData.isAnonymous
    };

    const res = await apiClient.post("/api/interview-experiences", payload);
    return mapBackendInterviewToFrontend(res.data);
  }
};
