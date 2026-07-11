import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import apiClient from "../../api/client";
import { 
  User, Mail, Briefcase, Award, Code, Globe, 
  BookOpen, Plus, Trash2, Edit3, CheckCircle, 
  ExternalLink, ArrowLeft, Camera, ShieldCheck, FileText,
  Linkedin, Github
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

// Mock interview questions database
const mockQuestions = {
  frontend: [
    {
      q: "What is the difference between state and props in React?",
      ideal: "State is local, mutable data managed within the component itself. Props are immutable read-only parameters passed down from a parent component."
    },
    {
      q: "Explain React's Virtual DOM and how reconciliation works.",
      ideal: "React maintains a lightweight Virtual DOM representation in memory. When state changes, a new VDOM is created and compared (diffed) with the previous one. Only the changed parts are batched and updated in the real DOM."
    },
    {
      q: "What are Hooks in React? Explain useEffect cleanup function.",
      ideal: "Hooks let you use state and lifecycle features in functional components. The cleanup function returned in useEffect runs before the component unmounts or before the effect re-runs, clearing listeners or timers."
    }
  ],
  backend: [
    {
      q: "What is Dependency Injection (DI) in Spring Framework?",
      ideal: "Dependency Injection is a design pattern where the control of object creation is delegated to the Spring IoC container, allowing loose coupling, easier testing, and dynamic configuration."
    },
    {
      q: "Explain RESTful API design. What is the difference between PUT and PATCH?",
      ideal: "REST uses HTTP verbs to perform CRUD. PUT replaces an entire resource with the payload, while PATCH applies partial updates to a resource."
    },
    {
      q: "How does Spring Boot handle database transaction rollback?",
      ideal: "Spring uses @Transactional. By default, it automatically rolls back the transaction if a RuntimeException or Error occurs during the execution of the transaction block."
    }
  ],
  database: [
    {
      q: "What is the difference between SQL and NoSQL databases?",
      ideal: "SQL databases are relational, table-based, structured, and support ACID transactions. NoSQL databases are non-relational, document/key-value/graph based, schema-less, and scale horizontally."
    },
    {
      q: "Explain database normalization. What is 3NF?",
      ideal: "Normalization organizes database tables to reduce redundancy. Third Normal Form (3NF) requires a table to be in 2NF and all non-primary key columns to be dependent only on the primary key (no transitive dependencies)."
    },
    {
      q: "What is a database index? What are the trade-offs of using indexes?",
      ideal: "An index is a data structure (like B-Tree) that speeds up data retrieval. The trade-off is that it consumes additional disk space and slows down write/insert/update operations."
    }
  ],
  dsa: [
    {
      q: "What is the time and space complexity of QuickSort?",
      ideal: "QuickSort has an average and best-case time complexity of O(N log N) and a worst-case of O(N^2) if the pivot is chosen poorly. Its space complexity is O(log N) due to recursive stack space."
    },
    {
      q: "Explain the difference between BFS and DFS traversal on trees.",
      ideal: "BFS (Breadth-First Search) explores nodes level-by-level using a Queue. DFS (Depth-First Search) explores as deep as possible along branches before backtracking using a Stack or recursion."
    },
    {
      q: "How does a Hash Map handle collisions?",
      ideal: "Collisions occur when two keys hash to the same bucket. They are handled using Chaining (linked lists/trees in the bucket) or Open Addressing (finding another empty slot using probing)."
    }
  ]
};

// Client-side simple scoring matcher
const evaluateMockAnswer = (userAns, idealAns) => {
  if (!userAns || userAns.trim().length < 5) {
    return { score: 2, feedback: "Your answer is too brief. Please provide a more detailed explanation of the concept." };
  }
  
  const userWords = userAns.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const idealWords = idealAns.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  
  // Remove common stopwords
  const stopwords = ["the", "and", "that", "this", "with", "from", "for", "are", "was", "were", "been", "have", "has", "had", "its", "you", "but"];
  const filteredIdeal = idealWords.filter(w => !stopwords.includes(w));
  
  let matches = 0;
  filteredIdeal.forEach(word => {
    if (userWords.includes(word)) matches++;
  });
  
  const matchPercentage = filteredIdeal.length ? (matches / filteredIdeal.length) : 0;
  let score = Math.round(matchPercentage * 8) + 2; // base score 2, max 10
  if (score > 10) score = 10;
  
  let feedbackMsg = "";
  if (score >= 8) {
    feedbackMsg = "Excellent! You have captured all key concepts. Your understanding of this topic is solid.";
  } else if (score >= 5) {
    feedbackMsg = "Good attempt. You have touched upon core concepts, but try to be more precise and include structural details.";
  } else {
    feedbackMsg = "Partial answer. You missed some crucial technical details. Review the ideal explanation to strengthen your concept.";
  }
  
  return { score, feedback: feedbackMsg };
};

export const Profile = () => {
  const { user, token, updateProfileState } = useAuth();
  const { showToast } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Backend profile state
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [cgpa, setCgpa] = useState(0.0);
  const [graduationYear, setGraduationYear] = useState(2027);
  const [skillsList, setSkillsList] = useState([]);

  // Expanded profile state (localStorage persistent)
  const [summary, setSummary] = useState("");
  const [internships, setInternships] = useState([]);
  const [projects, setProjects] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [partnerCompanies, setPartnerCompanies] = useState([]);

  // Social links and resume states
  const [socials, setSocials] = useState(() => {
    const data = localStorage.getItem(`cn_socials_${user?.email}`);
    if (data) return JSON.parse(data);
    if (user?.email && (user.email === "janhavi@test.com" || user.email.includes("janhavi"))) {
      return {
        linkedin: "https://linkedin.com/in/janhavi-mali",
        github: "https://github.com/MALIJANHAVIANIL",
        portfolio: "https://janhavimali.dev"
      };
    }
    return { linkedin: "", github: "", portfolio: "" };
  });
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [socialsForm, setSocialsForm] = useState({ linkedin: "", github: "", portfolio: "" });

  const [resumeFile, setResumeFile] = useState(() => {
    const data = localStorage.getItem(`cn_resume_${user?.email}`);
    if (data) return JSON.parse(data);
    if (user?.email && (user.email === "janhavi@test.com" || user.email.includes("janhavi"))) {
      return {
        name: "Janhavi_Mali_Resume.pdf",
        size: "245 KB",
        uploaded: "June 10, 2026"
      };
    }
    return null;
  });
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleEditSocials = () => {
    setSocialsForm(socials);
    setIsEditingSocials(true);
  };

  const handleSaveSocials = (e) => {
    e.preventDefault();
    setSocials(socialsForm);
    localStorage.setItem(`cn_socials_${user?.email}`, JSON.stringify(socialsForm));
    setIsEditingSocials(false);
    showToast("Online profiles updated successfully.", "success");
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      showToast("Only PDF format resumes are allowed.", "error");
      return;
    }

    setUploadingResume(true);
    setTimeout(() => {
      const newResume = {
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        uploaded: "Just now"
      };
      setResumeFile(newResume);
      localStorage.setItem(`cn_resume_${user?.email}`, JSON.stringify(newResume));
      setUploadingResume(false);
      showToast("Resume uploaded successfully!", "success");
    }, 1200);
  };

  // Modal active states
  const [activeModal, setActiveModal] = useState(null); // 'basic' | 'summary' | 'skills' | 'internship' | 'project' | 'language' | 'certification'
  
  // Certificate and Mock Interview states
  const [showCertModal, setShowCertModal] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockTopic, setMockTopic] = useState("");
  const [mockStep, setMockStep] = useState("select"); // 'select' | 'interview' | 'result'
  const [currentMockQuestionIndex, setCurrentMockQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [mockAnswers, setMockAnswers] = useState([]);
  const [mockFeedback, setMockFeedback] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  
  // Edit form index tracker
  const [editIndex, setEditIndex] = useState(null);

  // Form states for modals
  const [basicForm, setBasicForm] = useState({ name: "", rollNumber: "", department: "", cgpa: 0.0, graduationYear: 2027 });
  const [summaryForm, setSummaryForm] = useState("");
  const [skillsForm, setSkillsForm] = useState("");
  const [internshipForm, setInternshipForm] = useState({ role: "", company: "", startDate: "", endDate: "", description: "" });
  const [projectForm, setProjectForm] = useState({ title: "", techStack: "", description: "", link: "" });
  const [certificationForm, setCertificationForm] = useState({ name: "", issuer: "", date: "" });
  const [languageForm, setLanguageForm] = useState("");

  // Seed default data for test accounts if empty
  useEffect(() => {
    if (!user) return;
    
    const loadProfileData = async () => {
      setLoading(true);
      try {
        if (user.role === "student") {
          // 1. Fetch from backend API
          const response = await apiClient.get("/api/users/profile/student");
          const p = response.data;
          setRollNumber(p.rollNumber || "");
          setDepartment(p.department || "");
          setCgpa(p.cgpa || 0.0);
          setGraduationYear(p.graduationYear || 2027);
          setSkillsList(p.skills ? p.skills.split(",").map(s => s.trim()).filter(Boolean) : []);

          // 1b. Fetch partner companies
          try {
            const compRes = await apiClient.get("/api/companies");
            setPartnerCompanies(compRes.data || []);
          } catch (compErr) {
            console.warn("Failed to load partner companies on profile:", compErr);
          }
        }

        // 2. Fetch from local storage expanded profile
        const localDataKey = `cn_expanded_profile_${user.email}`;
        const localData = localStorage.getItem(localDataKey);
        
        if (localData) {
          const parsed = JSON.parse(localData);
          setSummary(parsed.summary || "");
          setInternships(parsed.internships || []);
          setProjects(parsed.projects || []);
          setLanguages(parsed.languages || []);
          setCertifications(parsed.certifications || []);
        } else {
          // Seed standard demo data for test students
          if (user.email === "student@test.com" || user.email === "janhavi@test.com" || user.email.includes("janhavi")) {
            const seed = {
              summary: "Enthusiastic Computer Engineering student with a strong foundation in full-stack web development. Passionate about solving complex algorithms, database scaling, and building user-centric responsive interfaces. Looking for opportunities to grow as an intern.",
              internships: [
                {
                  role: "Full Stack Engineer Intern",
                  company: "Mahindra Tech Labs",
                  startDate: "Jun 2025",
                  endDate: "Aug 2025",
                  description: "Assisted in building REST APIs with Spring Boot and integrated frontend tables with React. Optimized database queries which reduced server fetch latency by 15%."
                }
              ],
              projects: [
                {
                  title: "CareerNexus Platform",
                  techStack: "React, Tailwind CSS, Spring Boot, Postgres",
                  link: "https://github.com/MALIJANHAVIANIL/CareerNexus",
                  description: "Developed placement portal features, resolving JWT session verification and designing modern HSL color configurations."
                }
              ],
              languages: ["English (Professional)", "Hindi (Native)", "Marathi (Fluent)"],
              certifications: [
                {
                  name: "AWS Certified Developer - Associate",
                  issuer: "Amazon Web Services",
                  date: "May 2025"
                },
                {
                  name: "Oracle Certified Associate Java SE 8",
                  issuer: "Oracle Corporation",
                  date: "Jan 2025"
                }
              ]
            };
            
            setSummary(seed.summary);
            setInternships(seed.internships);
            setProjects(seed.projects);
            setLanguages(seed.languages);
            setCertifications(seed.certifications);
            localStorage.setItem(localDataKey, JSON.stringify(seed));
          }
        }
      } catch (err) {
        console.error("Error retrieving student profile:", err);
        showToast("Unable to fetch complete profile from backend. Showing local details.", "warning");
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  // Compute profile completeness (Naukri style)
  const calculateProfileStrength = () => {
    let score = 0;
    // 1. Basic Info (Name, rollNumber, department) - 20%
    if (user?.name) score += 5;
    if (rollNumber) score += 5;
    if (department) score += 5;
    if (cgpa > 0) score += 5;

    // 2. Summary - 15%
    if (summary.trim().length > 20) score += 15;
    else if (summary.trim().length > 0) score += 5;

    // 3. Skills - 15%
    if (skillsList.length >= 5) score += 15;
    else if (skillsList.length > 0) score += 5;

    // 4. Internships - 20%
    if (internships.length > 0) score += 20;

    // 5. Projects - 15%
    if (projects.length > 0) score += 15;

    // 6. Certifications - 10%
    if (certifications.length > 0) score += 10;

    // 7. Languages - 5%
    if (languages.length > 0) score += 5;

    return score;
  };

  const strengthScore = calculateProfileStrength();

  // Helper to persist local expanded profile details
  const saveLocalExpanded = (updates) => {
    const localDataKey = `cn_expanded_profile_${user.email}`;
    const localData = localStorage.getItem(localDataKey);
    const parsed = localData ? JSON.parse(localData) : {};
    const updated = { ...parsed, ...updates };
    localStorage.setItem(localDataKey, JSON.stringify(updated));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !["jpg", "jpeg", "png", "pdf"].includes(fileExtension)) {
      showToast("Only JPG, PNG, and PDF files are allowed.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedUser = {
        ...user,
        avatar: reader.result,
        avatarType: file.type || (fileExtension === 'pdf' ? 'application/pdf' : 'image/png'),
        avatarName: file.name
      };
      
      localStorage.setItem("cn_user", JSON.stringify(updatedUser));
      
      if (updateProfileState) {
        updateProfileState(updatedUser);
      }
      
      showToast("Profile photo uploaded successfully!", "success");
    };
    reader.readAsDataURL(file);
  };

  // Profile saves handlers
  const handleSaveBasic = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update backend student profile
      await apiClient.put("/api/users/profile/student", {
        rollNumber: basicForm.rollNumber,
        department: basicForm.department,
        cgpa: parseFloat(basicForm.cgpa),
        graduationYear: parseInt(basicForm.graduationYear, 10),
        skills: skillsList.join(", ")
      });

      // Update local states
      setRollNumber(basicForm.rollNumber);
      setDepartment(basicForm.department);
      setCgpa(basicForm.cgpa);
      setGraduationYear(basicForm.graduationYear);

      // Save name in user session context
      const localUser = JSON.parse(localStorage.getItem("cn_user") || "{}");
      localUser.name = basicForm.name;
      localUser.prn = basicForm.rollNumber;
      localUser.branch = basicForm.department;
      localStorage.setItem("cn_user", JSON.stringify(localUser));
      user.name = basicForm.name;
      user.prn = basicForm.rollNumber;
      user.branch = basicForm.department;

      showToast("Basic education profile updated successfully.", "success");
      setActiveModal(null);
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSummary = (e) => {
    e.preventDefault();
    setSummary(summaryForm);
    saveLocalExpanded({ summary: summaryForm });
    showToast("Profile summary updated.", "success");
    setActiveModal(null);
  };

  const handleSaveSkills = async (e) => {
    e.preventDefault();
    setSaving(true);
    const list = skillsForm.split(",").map(s => s.trim()).filter(Boolean);
    try {
      await apiClient.put("/api/users/profile/student", {
        rollNumber,
        department,
        cgpa,
        graduationYear,
        skills: list.join(", ")
      });

      setSkillsList(list);
      showToast("Key skills updated successfully.", "success");
      setActiveModal(null);
    } catch (err) {
      showToast(err.message || "Failed to update skills on backend", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInternship = (e) => {
    e.preventDefault();
    let updated;
    if (editIndex !== null) {
      updated = [...internships];
      updated[editIndex] = internshipForm;
    } else {
      updated = [...internships, internshipForm];
    }
    setInternships(updated);
    saveLocalExpanded({ internships: updated });
    showToast("Internship details updated.", "success");
    setActiveModal(null);
  };

  const handleDeleteInternship = (index) => {
    const updated = internships.filter((_, i) => i !== index);
    setInternships(updated);
    saveLocalExpanded({ internships: updated });
    showToast("Internship removed.", "info");
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    let updated;
    if (editIndex !== null) {
      updated = [...projects];
      updated[editIndex] = projectForm;
    } else {
      updated = [...projects, projectForm];
    }
    setProjects(updated);
    saveLocalExpanded({ projects: updated });
    showToast("Project details updated.", "success");
    setActiveModal(null);
  };

  const handleDeleteProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    saveLocalExpanded({ projects: updated });
    showToast("Project removed.", "info");
  };

  const handleSaveCertification = (e) => {
    e.preventDefault();
    let updated;
    if (editIndex !== null) {
      updated = [...certifications];
      updated[editIndex] = certificationForm;
    } else {
      updated = [...certifications, certificationForm];
    }
    setCertifications(updated);
    saveLocalExpanded({ certifications: updated });
    showToast("Certification added.", "success");
    setActiveModal(null);
  };

  const handleDeleteCertification = (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    setCertifications(updated);
    saveLocalExpanded({ certifications: updated });
    showToast("Certification removed.", "info");
  };

  const handleSaveLanguage = (e) => {
    e.preventDefault();
    if (!languageForm.trim()) return;
    const updated = [...languages, languageForm.trim()];
    setLanguages(updated);
    saveLocalExpanded({ languages: updated });
    setLanguageForm("");
    showToast("Language added.", "success");
  };

  const handleDeleteLanguage = (index) => {
    const updated = languages.filter((_, i) => i !== index);
    setLanguages(updated);
    saveLocalExpanded({ languages: updated });
    showToast("Language removed.", "info");
  };

  // Modal Opener triggers
  const openBasicModal = () => {
    setBasicForm({
      name: user?.name || "",
      rollNumber: rollNumber,
      department: department,
      cgpa: cgpa,
      graduationYear: graduationYear
    });
    setActiveModal("basic");
  };

  const openSummaryModal = () => {
    setSummaryForm(summary);
    setActiveModal("summary");
  };

  const openSkillsModal = () => {
    setSkillsForm(skillsList.join(", "));
    setActiveModal("skills");
  };

  const openInternshipModal = (index = null) => {
    setEditIndex(index);
    if (index !== null) {
      setInternshipForm(internships[index]);
    } else {
      setInternshipForm({ role: "", company: "", startDate: "", endDate: "", description: "" });
    }
    setActiveModal("internship");
  };

  const openProjectModal = (index = null) => {
    setEditIndex(index);
    if (index !== null) {
      setProjectForm(projects[index]);
    } else {
      setProjectForm({ title: "", techStack: "", description: "", link: "" });
    }
    setActiveModal("project");
  };

  const openCertificationModal = (index = null) => {
    setEditIndex(index);
    if (index !== null) {
      setCertificationForm(certifications[index]);
    } else {
      setCertificationForm({ name: "", issuer: "", date: "" });
    }
    setActiveModal("certification");
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-red border-t-transparent"></div>
        <p className="mt-4 text-xs font-semibold text-gray-500 font-outfit">Loading Naukri Profile details...</p>
      </div>
    );
  }

  // Fallback: If user is not student, render a simplified user card
  if (user?.role !== "student") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-gray-150 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-6">
            <label htmlFor="avatar-upload-input" className="relative group cursor-pointer flex-shrink-0 block">
              <input
                type="file"
                id="avatar-upload-input"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {user?.avatar && (user.avatar.startsWith("data:application/pdf") || user.avatarType === "application/pdf") ? (
                <div className="h-24 w-24 rounded-2xl border-2 border-red-200 bg-red-50 flex flex-col items-center justify-center text-brand-red gap-1 group-hover:opacity-85 transition-opacity relative">
                  <FileText size={32} />
                  <span className="text-[9px] font-extrabold uppercase tracking-wide bg-brand-red text-white px-1.5 py-0.5 rounded">PDF Photo</span>
                </div>
              ) : (
                <img
                  src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                  alt={user?.name}
                  className="h-24 w-24 rounded-2xl object-cover border-2 border-brand-red/10 group-hover:opacity-85 transition-opacity"
                />
              )}
              <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
            </label>
            <div className="space-y-1">
              <span className="inline-flex text-[9px] font-extrabold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase font-outfit">
                {user?.role} Account
              </span>
              <h2 className="text-xl font-bold font-outfit text-gray-900">{user?.name}</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 font-sans">
                <Mail size={14} className="text-gray-400" /> {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navbar back hook */}
      <div className="flex items-center justify-between">
        <Link to="/student/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-black transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <span className="text-[10px] text-gray-400 font-outfit font-extrabold uppercase flex items-center gap-1">
          <ShieldCheck size={12} className="text-emerald-500" /> Verified Placement Account
        </span>
      </div>

      {/* Hero card & Profile Completeness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info Hero Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <label htmlFor="avatar-upload-input" className="relative group cursor-pointer flex-shrink-0 block">
              <input
                type="file"
                id="avatar-upload-input"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {user?.avatar && (user.avatar.startsWith("data:application/pdf") || user.avatarType === "application/pdf") ? (
                <div className="h-24 w-24 rounded-2xl border border-red-200 bg-red-50 flex flex-col items-center justify-center text-brand-red gap-1 group-hover:opacity-85 transition-opacity relative">
                  <FileText size={32} />
                  <span className="text-[9px] font-extrabold uppercase tracking-wide bg-brand-red text-white px-1.5 py-0.5 rounded">PDF Photo</span>
                </div>
              ) : (
                <img
                  src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                  alt={user?.name}
                  className="h-24 w-24 rounded-2xl object-cover border border-gray-200 group-hover:opacity-85 transition-opacity"
                />
              )}
              <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
            </label>
            
            <div className="space-y-2.5 min-w-0 flex-1">
              <div>
                <h2 className="text-xl font-bold text-gray-950 font-outfit truncate">{user?.name}</h2>
                <p className="text-xs text-brand-red font-semibold font-sans">{department || "Computer Engineering"}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600 font-sans">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Mail size={13} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen size={13} className="text-gray-400" />
                  <span>PRN: <span className="font-semibold font-mono">{rollNumber || "N/A"}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award size={13} className="text-gray-400" />
                  <span>Passing Class: <span className="font-semibold">{graduationYear}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-emerald-500" />
                  <span>CGPA Parameter: <span className="font-semibold">{cgpa ? cgpa.toFixed(2) : "0.00"}</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <button 
              onClick={openBasicModal}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red hover:underline"
            >
              <Edit3 size={13} /> Edit Personal Details
            </button>
          </div>
        </div>

        {/* Profile Strength Card (Naukri style) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-950 font-outfit uppercase tracking-wider text-gray-400">Profile Strength</h3>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded font-outfit ${
                strengthScore >= 80 ? "bg-emerald-50 text-emerald-700" :
                strengthScore >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
              }`}>
                {strengthScore >= 80 ? "Excellent" : strengthScore >= 50 ? "Intermediate" : "Weak"}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center flex-shrink-0">
                {/* SVG Circular Progress Bar */}
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="6" fill="transparent" />
                  <circle cx="32" cy="32" r="28" stroke={strengthScore >= 85 ? "#10b981" : strengthScore >= 55 ? "#f59e0b" : "#ef4444"} strokeWidth="6" fill="transparent"
                    strokeDasharray={175}
                    strokeDashoffset={175 - (175 * strengthScore) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-sm font-extrabold font-outfit text-gray-900">{strengthScore}%</span>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 font-outfit">Your profile score is {strengthScore}%</p>
                <p className="text-[11px] text-gray-500 font-sans leading-normal mt-0.5">
                  {strengthScore === 100 ? "Amazing! Your placement credentials are fully complete." : "Add internships and summary details to stand out to verified companies."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-gray-50">
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-sans">
              <span>Recruiter Visibility</span>
              <span className="font-extrabold text-emerald-600 flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> High Visibility
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Summary */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User className="text-brand-red h-4.5 w-4.5" />
                <h3 className="text-sm font-bold text-gray-950 font-outfit uppercase tracking-wider">Profile Summary</h3>
              </div>
              <button onClick={openSummaryModal} className="text-gray-400 hover:text-brand-red transition-colors">
                <Edit3 size={15} />
              </button>
            </div>
            
            {summary ? (
              <p className="text-xs text-gray-600 leading-relaxed font-sans font-medium whitespace-pre-line">{summary}</p>
            ) : (
              <div className="text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-medium">Write a brief professional summary to highlight your placement value.</p>
                <button onClick={openSummaryModal} className="mt-2 text-xs font-bold text-brand-red hover:underline">Add Summary</button>
              </div>
            )}
          </div>

          {/* Key Skills */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Code className="text-brand-red h-4.5 w-4.5" />
                <h3 className="text-sm font-bold text-gray-950 font-outfit uppercase tracking-wider">Key Skills</h3>
              </div>
              <button onClick={openSkillsModal} className="text-gray-400 hover:text-brand-red transition-colors">
                <Edit3 size={15} />
              </button>
            </div>

            {skillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200/50 hover:bg-gray-150 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-medium">Add core technical skills to match candidate eligibility filters.</p>
                <button onClick={openSkillsModal} className="mt-2 text-xs font-bold text-brand-red hover:underline">Add Skills</button>
              </div>
            )}
          </div>

          {/* Internships */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Briefcase className="text-brand-red h-4.5 w-4.5" />
                <h3 className="text-sm font-bold text-gray-950 font-outfit uppercase tracking-wider">Employment & Internships</h3>
              </div>
              <button 
                onClick={() => openInternshipModal(null)} 
                className="text-brand-red hover:text-red-800 flex items-center gap-1 text-xs font-bold font-outfit uppercase"
              >
                <Plus size={14} /> Add New
              </button>
            </div>

            {internships.length > 0 ? (
              <div className="space-y-6 divide-y divide-gray-100">
                {internships.map((intern, idx) => (
                  <div key={idx} className={`pt-6 first:pt-0 group relative`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 font-outfit">{intern.role}</h4>
                        <p className="text-xs text-gray-500 font-medium font-sans mt-0.5">{intern.company}</p>
                        <p className="text-[10px] text-gray-400 font-sans mt-0.5">{intern.startDate} - {intern.endDate}</p>
                      </div>
                      <div className="flex gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openInternshipModal(idx)} className="text-gray-400 hover:text-brand-red">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteInternship(idx)} className="text-gray-400 hover:text-brand-red">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {intern.description && (
                      <p className="text-xs text-gray-500 mt-2.5 leading-relaxed font-sans">{intern.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-medium">No internship experience added yet. Highlight corporate roles.</p>
                <button onClick={() => openInternshipModal(null)} className="mt-2 text-xs font-bold text-brand-red hover:underline">Add Experience</button>
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Award className="text-brand-red h-4.5 w-4.5" />
                <h3 className="text-sm font-bold text-gray-950 font-outfit uppercase tracking-wider">Key Projects</h3>
              </div>
              <button 
                onClick={() => openProjectModal(null)} 
                className="text-brand-red hover:text-red-800 flex items-center gap-1 text-xs font-bold font-outfit uppercase"
              >
                <Plus size={14} /> Add New
              </button>
            </div>

            {projects.length > 0 ? (
              <div className="space-y-6 divide-y divide-gray-100">
                {projects.map((proj, idx) => (
                  <div key={idx} className="pt-6 first:pt-0 group relative">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 font-outfit">{proj.title}</h4>
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-red">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-brand-red font-outfit tracking-wide">{proj.techStack}</p>
                      </div>
                      <div className="flex gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openProjectModal(idx)} className="text-gray-400 hover:text-brand-red">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteProject(idx)} className="text-gray-400 hover:text-brand-red">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {proj.description && (
                      <p className="text-xs text-gray-500 mt-2.5 leading-relaxed font-sans">{proj.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-medium">Add key software development projects to showcase practical coding expertise.</p>
                <button onClick={() => openProjectModal(null)} className="mt-2 text-xs font-bold text-brand-red hover:underline">Add Project</button>
              </div>
            )}
          </div>

        </div>

        {/* Right side info cards */}
        <div className="space-y-6">
          
          {/* Dynamic Placement Preparation Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 relative overflow-hidden">
            {strengthScore === 100 ? (
              // 100% COMPLETE STATE - Show Mock Interview & Certificate
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-brand-red h-4.5 w-4.5" />
                    <h3 className="text-sm font-bold text-gray-950 font-outfit uppercase tracking-wider">Placement Prep</h3>
                  </div>
                  <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-outfit uppercase">
                    UNLOCKED
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Congratulations! Your profile is 100% complete. You have unlocked premium prep tools:
                </p>

                <div className="space-y-3 pt-1">
                  {/* Option 1: Mock Interview Practice */}
                  <div className="p-3 bg-red-50/30 rounded-xl border border-brand-red/10 hover:border-brand-red/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 font-outfit">Mock Interview Simulator</h4>
                        <p className="text-[10px] text-gray-400 font-sans mt-0.5">Practice domain technical questions and get instant feedback.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setMockStep("select");
                        setShowMockModal(true);
                      }}
                      className="mt-2 text-xs font-bold text-brand-red hover:underline flex items-center gap-1.5"
                    >
                      Launch Simulator &rarr;
                    </button>
                  </div>

                  {/* Option 2: Placement Readiness Certificate */}
                  <div className="p-3 bg-amber-50/20 rounded-xl border border-amber-500/15 hover:border-amber-500/35 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 font-outfit">Placement Readiness Certificate</h4>
                        <p className="text-[10px] text-gray-400 font-sans mt-0.5">Claim your double-bordered verified placement credential.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowCertModal(true)}
                      className="mt-2 text-xs font-bold text-amber-600 hover:underline flex items-center gap-1.5"
                    >
                      View & Claim &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // INCOMPLETE STATE - Show Free Courses
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-brand-red h-4.5 w-4.5" />
                  <h3 className="text-sm font-bold text-gray-950 font-outfit uppercase tracking-wider">Prepare</h3>
                </div>
                
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Complete your profile to 100% to unlock premium mock interviews and placement certificates. Boost your skills now:
                </p>

                <div className="space-y-3">
                  {[
                    {
                      name: "Java Programming Masterclass",
                      platform: "NPTEL",
                      duration: "12 Weeks • Free Certificate"
                    },
                    {
                      name: "Full Stack Web Development",
                      platform: "Great Learning",
                      duration: "15 Hours • Self-Paced"
                    },
                    {
                      name: "Data Structures & Algorithms",
                      platform: "Coursera",
                      duration: "Princeton Univ. • 50 Hours"
                    }
                  ].map((course, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-150 hover:bg-gray-100/50 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-900 font-outfit leading-tight break-words">{course.name}</h4>
                          <p className="text-[10px] text-gray-400 font-sans mt-1">{course.duration}</p>
                        </div>
                        <span className="text-[8px] font-extrabold bg-red-50 text-brand-red px-1.5 py-0.5 rounded font-outfit uppercase flex-shrink-0">
                          {course.platform}
                        </span>
                      </div>
                      <button 
                        onClick={() => showToast(`Successfully enrolled in "${course.name}" on ${course.platform} for free!`, "success")}
                        className="mt-2 w-full py-1.5 px-2 bg-white hover:bg-gray-50 border border-gray-200 text-[10px] font-bold text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        Enroll Free <ExternalLink size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Languages */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="text-brand-red h-4.5 w-4.5" />
              <h3 className="text-sm font-bold text-gray-950 font-outfit uppercase tracking-wider">Languages</h3>
            </div>

            <form onSubmit={handleSaveLanguage} className="flex gap-2">
              <input 
                type="text"
                placeholder="e.g. French (Conversational)"
                value={languageForm}
                onChange={(e) => setLanguageForm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
              />
              <Button type="submit" className="py-2 px-3 text-xs">
                Add
              </Button>
            </form>

            {languages.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {languages.map((lang, idx) => (
                  <span key={idx} className="bg-red-50/50 text-brand-red border border-red-100 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 font-outfit">
                    {lang}
                    <button type="button" onClick={() => handleDeleteLanguage(idx)} className="text-gray-400 hover:text-brand-red">
                      <Trash2 size={11} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 font-medium text-center">No languages declared.</p>
            )}
          </div>

          {/* Resume Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="text-brand-red h-4.5 w-4.5" />
                <h3 className="text-sm font-bold text-gray-955 font-outfit uppercase tracking-wider">Placement Resume</h3>
              </div>
              <label htmlFor="resume-upload-input" className="cursor-pointer text-brand-red hover:text-red-800 text-xs font-bold font-outfit uppercase flex items-center gap-1">
                <Plus size={14} /> Upload
                <input
                  type="file"
                  id="resume-upload-input"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                />
              </label>
            </div>

            {resumeFile ? (
              <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-50 border border-brand-red/10 rounded-xl flex items-center justify-center text-brand-red font-black text-xs font-outfit">
                    PDF
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-gray-900 truncate font-outfit">{resumeFile.name}</h4>
                    <p className="text-[10px] text-gray-400 font-sans mt-0.5">{resumeFile.size} • Uploaded {resumeFile.uploaded}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      showToast("Downloading resume PDF...", "success");
                    }}
                    className="flex-1 py-1.5 bg-white border border-gray-200 hover:border-brand-red text-brand-red text-[10px] font-bold rounded-lg transition-colors font-outfit text-center"
                  >
                    Download File
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-medium font-sans">No placement resume uploaded yet.</p>
                <label htmlFor="resume-upload-input" className="mt-2 text-xs font-bold text-brand-red hover:underline cursor-pointer block">Upload Resume</label>
              </div>
            )}
          </div>

          {/* Social Profiles Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="text-brand-red h-4.5 w-4.5" />
                <h3 className="text-sm font-bold text-gray-955 font-outfit uppercase tracking-wider">Online Profiles</h3>
              </div>
              {!isEditingSocials && (
                <button onClick={handleEditSocials} className="text-gray-400 hover:text-brand-red transition-colors">
                  <Edit3 size={15} />
                </button>
              )}
            </div>

            {isEditingSocials ? (
              <form onSubmit={handleSaveSocials} className="space-y-3.5">
                <div>
                  <label className="block text-[9px] font-bold text-gray-455 uppercase mb-1 font-outfit">LinkedIn URL</label>
                  <input
                    type="url"
                    value={socialsForm.linkedin}
                    onChange={(e) => setSocialsForm({ ...socialsForm, linkedin: e.target.value })}
                    className="block w-full border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-455 uppercase mb-1 font-outfit">GitHub URL</label>
                  <input
                    type="url"
                    value={socialsForm.github}
                    onChange={(e) => setSocialsForm({ ...socialsForm, github: e.target.value })}
                    className="block w-full border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-455 uppercase mb-1 font-outfit">Portfolio URL</label>
                  <input
                    type="url"
                    value={socialsForm.portfolio}
                    onChange={(e) => setSocialsForm({ ...socialsForm, portfolio: e.target.value })}
                    className="block w-full border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-gray-50">
                  <button type="button" onClick={() => setIsEditingSocials(false)} className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-[10px] font-bold font-outfit">
                    Cancel
                  </button>
                  <button type="submit" className="px-3 py-1.5 bg-brand-red hover:bg-brand-darkRed text-white rounded-lg text-[10px] font-bold font-outfit">
                    Save Links
                  </button>
                </div>
              </form>
            ) : (!socials.linkedin && !socials.github && !socials.portfolio) ? (
              <div className="text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-medium font-sans">No online profiles listed yet.</p>
                <button onClick={handleEditSocials} className="mt-2 text-xs font-bold text-brand-red hover:underline">Add Links</button>
              </div>
            ) : (
              <div className="space-y-3">
                {socials.linkedin && (
                  <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-150 transition-colors">
                    <Linkedin size={15} className="text-blue-700 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-gray-400 block font-outfit uppercase">LinkedIn</span>
                      <span className="text-xs text-gray-800 truncate block font-sans font-medium">{socials.linkedin}</span>
                    </div>
                  </a>
                )}
                {socials.github && (
                  <a href={socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-150 transition-colors">
                    <Github size={15} className="text-gray-900 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-gray-400 block font-outfit uppercase">GitHub</span>
                      <span className="text-xs text-gray-800 truncate block font-sans font-medium">{socials.github}</span>
                    </div>
                  </a>
                )}
                {socials.portfolio && (
                  <a href={socials.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-150 transition-colors">
                    <Globe size={15} className="text-brand-red flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-gray-400 block font-outfit uppercase">Portfolio</span>
                      <span className="text-xs text-gray-800 truncate block font-sans font-medium">{socials.portfolio}</span>
                    </div>
                  </a>
                )}
              </div>
            )}
                    {/* Certifications */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Award className="text-brand-red h-4.5 w-4.5" />
                <h3 className="text-sm font-bold text-gray-955 font-outfit uppercase tracking-wider">Certifications</h3>
              </div>
              <button 
                onClick={() => openCertificationModal(null)}
                className="text-brand-red hover:text-red-800"
              >
                <Plus size={16} />
              </button>
            </div>

            {certifications.length > 0 ? (
              <div className="space-y-4">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="group flex justify-between items-start text-xs border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 font-outfit truncate">{cert.name}</h4>
                      <p className="text-[10px] text-gray-400 font-sans truncate">{cert.issuer} • {cert.date}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1.5">
                      <button onClick={() => openCertificationModal(idx)} className="text-gray-400 hover:text-brand-red">
                        <Edit3 size={12} />
                      </button>
                      <button onClick={() => handleDeleteCertification(idx)} className="text-gray-400 hover:text-brand-red">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-[10px] text-gray-400 font-medium">Verify credentials from Google, AWS, Oracle, etc.</p>
                <button onClick={() => openCertificationModal(null)} className="mt-2 text-[10px] font-bold text-brand-red hover:underline">Add Certification</button>
              </div>
            )}
          </div>

          {/* Recruitment Partners Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="text-brand-red h-4.5 w-4.5" />
              <h3 className="text-sm font-bold text-gray-955 font-outfit uppercase tracking-wider">Recruitment Partners</h3>
            </div>
            
            {partnerCompanies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {partnerCompanies.map((c) => (
                  <div key={c.id} className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex flex-col justify-between hover:bg-gray-100/50 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 font-outfit truncate">{c.name}</h4>
                      <span className="inline-flex text-[8px] font-extrabold bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-outfit mt-1 uppercase">
                        {c.industry || "Technology"}
                      </span>
                    </div>
                    {c.website && (
                      <a 
                        href={c.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[9px] font-bold text-brand-red hover:underline mt-2 inline-flex items-center gap-0.5 font-sans"
                      >
                        Visit Website <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 font-medium text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">No partner companies listed yet.</p>
            )}
          </div>

        </div>    </div>

      </div>

      {/* ================================== MODALS SECTION ================================== */}
      
      {/* 1. Basic Info Modal */}
      {activeModal === "basic" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-md w-full shadow-2xl p-6 relative animate-slide-up">
            <h3 className="text-base font-bold text-gray-900 font-outfit uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
              Edit Basic Details
            </h3>
            
            <form onSubmit={handleSaveBasic} className="space-y-4">
              <Input 
                label="Full Name" 
                value={basicForm.name}
                onChange={(e) => setBasicForm({ ...basicForm, name: e.target.value })}
                required
              />
              <Input 
                label="PRN (Permanent Registration Number)" 
                value={basicForm.rollNumber}
                onChange={(e) => setBasicForm({ ...basicForm, rollNumber: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-outfit">
                  Branch/Department
                </label>
                <select
                  value={basicForm.department}
                  onChange={(e) => setBasicForm({ ...basicForm, department: e.target.value })}
                  className="block w-full border border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                >
                  {["Computer Engineering", "Information Technology", "ENTC", "Mechanical", "Civil", "Electrical"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input 
                  label="CGPA" 
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="10.0"
                  value={basicForm.cgpa}
                  onChange={(e) => setBasicForm({ ...basicForm, cgpa: e.target.value })}
                  required
                />
                <Input 
                  label="Passing Year" 
                  type="number"
                  min="1900"
                  max="2100"
                  value={basicForm.graduationYear}
                  onChange={(e) => setBasicForm({ ...basicForm, graduationYear: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                <Button type="button" variant="outline" className="text-xs" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving} className="text-xs">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Summary Modal */}
      {activeModal === "summary" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-lg w-full shadow-2xl p-6 relative animate-slide-up">
            <h3 className="text-base font-bold text-gray-900 font-outfit uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
              Edit Profile Summary
            </h3>
            
            <form onSubmit={handleSaveSummary} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-outfit">
                  Career Profile Summary
                </label>
                <textarea
                  rows={6}
                  value={summaryForm}
                  onChange={(e) => setSummaryForm(e.target.value)}
                  placeholder="Outline your programming experience, placement ambitions, and tech stacks you specialize in..."
                  className="block w-full border border-gray-300 rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                <Button type="button" variant="outline" className="text-xs" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="text-xs">
                  Save Summary
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Skills Modal */}
      {activeModal === "skills" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-md w-full shadow-2xl p-6 relative animate-slide-up">
            <h3 className="text-base font-bold text-gray-900 font-outfit uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
              Edit Key Skills
            </h3>
            
            <form onSubmit={handleSaveSkills} className="space-y-4">
              <Input 
                label="Core Skills (Comma separated)" 
                value={skillsForm}
                onChange={(e) => setSkillsForm(e.target.value)}
                placeholder="React, Node.js, Spring Boot, Postgres, Docker"
                required
              />

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                <Button type="button" variant="outline" className="text-xs" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving} className="text-xs">
                  Save Skills
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Internship Modal */}
      {activeModal === "internship" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-md w-full shadow-2xl p-6 relative animate-slide-up">
            <h3 className="text-base font-bold text-gray-900 font-outfit uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
              {editIndex !== null ? "Edit Internship" : "Add Internship"}
            </h3>
            
            <form onSubmit={handleSaveInternship} className="space-y-4">
              <Input 
                label="Role / Title" 
                value={internshipForm.role}
                onChange={(e) => setInternshipForm({ ...internshipForm, role: e.target.value })}
                placeholder="e.g. Software Engineer Intern"
                required
              />
              <Input 
                label="Company Name" 
                value={internshipForm.company}
                onChange={(e) => setInternshipForm({ ...internshipForm, company: e.target.value })}
                placeholder="e.g. Google India"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input 
                  label="Start Date" 
                  value={internshipForm.startDate}
                  onChange={(e) => setInternshipForm({ ...internshipForm, startDate: e.target.value })}
                  placeholder="e.g. Jun 2025"
                  required
                />
                <Input 
                  label="End Date" 
                  value={internshipForm.endDate}
                  onChange={(e) => setInternshipForm({ ...internshipForm, endDate: e.target.value })}
                  placeholder="e.g. Aug 2025 (or Present)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-outfit">
                  Role Description
                </label>
                <textarea
                  rows={3}
                  value={internshipForm.description}
                  onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                  placeholder="List your key contributions and tech stacks utilized..."
                  className="block w-full border border-gray-300 rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                <Button type="button" variant="outline" className="text-xs" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="text-xs">
                  Save Internship
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Project Modal */}
      {activeModal === "project" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-md w-full shadow-2xl p-6 relative animate-slide-up">
            <h3 className="text-base font-bold text-gray-900 font-outfit uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
              {editIndex !== null ? "Edit Project" : "Add Project"}
            </h3>
            
            <form onSubmit={handleSaveProject} className="space-y-4">
              <Input 
                label="Project Title" 
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                placeholder="e.g. Student Placement Portal"
                required
              />
              <Input 
                label="Technologies Used" 
                value={projectForm.techStack}
                onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                placeholder="e.g. React, Spring Boot, PostgreSQL"
                required
              />
              <Input 
                label="GitHub Link / URL" 
                value={projectForm.link}
                onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                placeholder="https://github.com/..."
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-outfit">
                  Project Description
                </label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Brief summary of project functions and achievements..."
                  className="block w-full border border-gray-300 rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                <Button type="button" variant="outline" className="text-xs" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="text-xs">
                  Save Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Certification Modal */}
      {activeModal === "certification" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-md w-full shadow-2xl p-6 relative animate-slide-up">
            <h3 className="text-base font-bold text-gray-900 font-outfit uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
              {editIndex !== null ? "Edit Certification" : "Add Certification"}
            </h3>
            
            <form onSubmit={handleSaveCertification} className="space-y-4">
              <Input 
                label="Certification Name" 
                value={certificationForm.name}
                onChange={(e) => setCertificationForm({ ...certificationForm, name: e.target.value })}
                placeholder="e.g. AWS Developer Associate"
                required
              />
              <Input 
                label="Issuing Organization" 
                value={certificationForm.issuer}
                onChange={(e) => setCertificationForm({ ...certificationForm, issuer: e.target.value })}
                placeholder="e.g. Amazon Web Services"
                required
              />
              <Input 
                label="Date of Issue" 
                value={certificationForm.date}
                onChange={(e) => setCertificationForm({ ...certificationForm, date: e.target.value })}
                placeholder="e.g. May 2025"
                required
              />

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                <Button type="button" variant="outline" className="text-xs" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="text-xs">
                  Save Certification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Premium Placement Readiness Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-3xl w-full shadow-2xl p-6 relative animate-slide-up my-8">
            <button 
              onClick={() => setShowCertModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
            >
              &times;
            </button>
            
            <h3 className="text-base font-bold text-gray-900 font-outfit uppercase tracking-wider mb-4 border-b border-gray-50 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="text-emerald-500" /> Claim Placement Readiness Certificate
            </h3>

            {/* Certificate Preview Box */}
            <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 flex justify-center items-center overflow-x-auto">
              <div className="min-w-[640px] max-w-[720px] aspect-[4/3] bg-white p-8 relative shadow-lg border-2 border-amber-500 select-none font-sans" id="placement-certificate">
                {/* Double Border */}
                <div className="absolute inset-2 border border-gray-900/10"></div>
                <div className="absolute inset-3 border-2 border-double border-amber-500/60 p-6 flex flex-col justify-between h-[calc(100%-24px)]">
                  
                  {/* Top Header */}
                  <div className="text-center space-y-1">
                    <div className="flex justify-center items-center gap-1">
                      <div className="h-6 w-6 bg-brand-red rounded-sm flex items-center justify-center text-white font-extrabold text-[10px]">C</div>
                      <span className="font-outfit font-extrabold text-sm text-gray-950 tracking-wider">CAREERNEXUS</span>
                    </div>
                    <p className="text-[7px] text-brand-red font-bold tracking-widest uppercase">PLACEMENT READINESS VERIFIED</p>
                  </div>

                  {/* Main Title */}
                  <div className="text-center space-y-2 mt-4">
                    <h2 className="text-xl font-extrabold font-outfit text-brand-darkRed tracking-wide">PLACEMENT READINESS CERTIFICATE</h2>
                    <p className="text-[10px] text-gray-500 font-medium italic">This is proudly presented to</p>
                    <h1 className="text-2xl font-bold font-outfit text-gray-900 underline decoration-amber-500 decoration-2 underline-offset-4 mt-2">
                      {user?.name}
                    </h1>
                  </div>

                  {/* Description body */}
                  <div className="text-center text-[10px] text-gray-600 leading-relaxed max-w-md mx-auto space-y-1 mt-4">
                    <p>for achieving <span className="font-bold text-emerald-600">100% Completeness</span> of the official CareerNexus profile modules.</p>
                    <p>Having verified academic records under Roll Number/PRN <span className="font-mono font-bold text-gray-800">{rollNumber || "RN1781694145106"}</span>,</p>
                    <p>and demonstrated competency in the department of <span className="font-bold text-gray-800">{department || "Computer Engineering"}</span>, this candidate is certified as placement-ready.</p>
                  </div>

                  {/* Signatures and Date */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-4 items-end">
                    <div className="text-left space-y-1">
                      <p className="text-[9px] text-gray-400">Date of Issue</p>
                      <p className="text-[10px] font-bold text-gray-800">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="text-[8px] font-mono text-gray-400 mt-1">CN-CERT-{rollNumber ? rollNumber.toUpperCase().slice(-6) : 'READY'}</p>
                    </div>

                    <div className="flex justify-center relative">
                      {/* Golden Seal badge style */}
                      <div className="h-14 w-14 rounded-full bg-amber-500/10 border-2 border-dashed border-amber-500 flex items-center justify-center flex-col relative">
                        <span className="text-[8px] font-outfit font-extrabold text-amber-600 tracking-wider">CN</span>
                        <span className="text-[6px] font-bold text-amber-500">VERIFIED</span>
                        <div className="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-500"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-[8px] text-gray-500">
                      <div className="border-t border-gray-200 pt-1.5">
                        <span className="font-outfit font-bold text-gray-800 block text-[9px] italic">Marcus</span>
                        <span>Director, TPO</span>
                      </div>
                      <div className="border-t border-gray-200 pt-1.5">
                        <span className="font-outfit font-bold text-gray-800 block text-[9px] italic">Janhavi M.</span>
                        <span>CN Registrar</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-50 mt-4">
              <Button type="button" variant="outline" className="text-xs" onClick={() => setShowCertModal(false)}>
                Close
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                  const certId = `CN-CERT-${rollNumber ? rollNumber.toUpperCase().slice(-6) : 'READY'}-${Math.floor(1000 + Math.random() * 9000)}`;
                  
                  // Construct dynamic SVG
                  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
                    <rect width="800" height="600" fill="#ffffff" />
                    <rect x="20" y="20" width="760" height="560" fill="none" stroke="#d4af37" stroke-width="4" />
                    <rect x="30" y="30" width="740" height="540" fill="none" stroke="#111827" stroke-width="2" />
                    <rect x="34" y="34" width="732" height="532" fill="none" stroke="#d4af37" stroke-width="1.5" />
                    <path d="M 30 50 L 50 30" stroke="#d4af37" stroke-width="2" />
                    <path d="M 750 30 L 770 50" stroke="#d4af37" stroke-width="2" />
                    <path d="M 30 550 L 50 570" stroke="#d4af37" stroke-width="2" />
                    <path d="M 750 570 L 770 550" stroke="#d4af37" stroke-width="2" />
                    <g transform="translate(400, 90)" text-anchor="middle">
                      <path d="M -15 -10 L 0 -18 L 15 -10 L 0 -2 Z" fill="#990000" />
                      <path d="M 0 -2 L 0 6" stroke="#990000" stroke-width="2" />
                      <path d="M 10 -5 L 12 5 L 8 5 Z" fill="#d4af37" />
                      <text y="25" font-family="sans-serif" font-weight="900" font-size="24" fill="#111827" letter-spacing="4">CAREERNEXUS</text>
                      <text y="42" font-family="sans-serif" font-weight="700" font-size="9" fill="#990000" letter-spacing="2">PLACEMENT READINESS VERIFIED</text>
                    </g>
                    <text x="400" y="200" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="30" fill="#7F0000">PLACEMENT READINESS CERTIFICATE</text>
                    <text x="400" y="230" text-anchor="middle" font-family="sans-serif" font-weight="500" font-size="14" fill="#374151" font-style="italic">This is proudly presented to</text>
                    <text x="400" y="285" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="36" fill="#111827" text-decoration="underline">${user?.name}</text>
                    <text x="400" y="330" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#374151">for achieving 100% Completeness of the official CareerNexus profile modules.</text>
                    <text x="400" y="355" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#374151">Having verified academic records under Roll Number/PRN ${rollNumber || "RN1781694145106"},</text>
                    <text x="400" y="380" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#374151">and demonstrated competency in the department of ${department || "Computer Engineering"}, this candidate is certified as placement-ready.</text>
                    <text x="150" y="440" font-family="sans-serif" font-size="11" fill="#6b7280">Date of Issue: <tspan font-weight="bold" fill="#374151">${dateStr}</tspan></text>
                    <text x="150" y="460" font-family="sans-serif" font-size="11" fill="#6b7280">Verification ID: <tspan font-weight="bold" fill="#374151">${certId}</tspan></text>
                    <circle cx="400" cy="480" r="35" fill="#d4af37" opacity="0.15" />
                    <circle cx="400" cy="480" r="30" fill="none" stroke="#d4af37" stroke-width="2" stroke-dasharray="4 2" />
                    <path d="M 390 495 L 380 540 L 400 520 L 420 540 L 410 495 Z" fill="#d4af37" />
                    <text x="400" y="484" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="11" fill="#d4af37">SEAL</text>
                    <g transform="translate(150, 500)">
                      <line x1="0" y1="0" x2="160" y2="0" stroke="#9ca3af" stroke-width="1" />
                      <path d="M 20 -15 Q 40 -35 60 -10 T 100 -20 T 140 -15" fill="none" stroke="#00008b" stroke-width="2" stroke-linecap="round" />
                      <text x="80" y="15" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="11" fill="#111827">Marcus</text>
                      <text x="80" y="28" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6b7280">Director, TPO</text>
                    </g>
                    <g transform="translate(490, 500)">
                      <line x1="0" y1="0" x2="160" y2="0" stroke="#9ca3af" stroke-width="1" />
                      <path d="M 15 -10 Q 30 -30 65 -15 T 115 -25 T 145 -10" fill="none" stroke="#8b0000" stroke-width="2" stroke-linecap="round" />
                      <text x="80" y="15" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="11" fill="#111827">Janhavi Mali</text>
                      <text x="80" y="28" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6b7280">CareerNexus Registrar</text>
                    </g>
                  </svg>`;
                  
                  const element = document.createElement("a");
                  const file = new Blob([svgContent], { type: 'image/svg+xml' });
                  element.href = URL.createObjectURL(file);
                  element.download = `Placement_Readiness_Certificate_${user.name.replace(/\s+/g, '_')}.svg`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                  
                  showToast("Placement Readiness Certificate downloaded successfully.", "success");
                }}
                className="text-xs"
              >
                Download Certificate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Interactive Mock Interview Simulator Modal */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-xl w-full shadow-2xl p-6 relative animate-slide-up my-8">
            <button 
              onClick={() => setShowMockModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
            >
              &times;
            </button>

            <h3 className="text-base font-bold text-gray-900 font-outfit uppercase tracking-wider mb-4 border-b border-gray-50 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="text-brand-red animate-pulse" /> Technical Mock Interview Simulator
            </h3>

            {mockStep === "select" && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Select your key technical domain focus. The simulator will present 3 conceptual interview questions, evaluate your input, and score your performance:
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    { id: "frontend", label: "Frontend React Dev", desc: "Hooks, Virtual DOM, Components state" },
                    { id: "backend", label: "Backend Spring Boot", desc: "Dependency Injection, Transactions, REST API" },
                    { id: "database", label: "Database Management", desc: "SQL vs NoSQL, Indexing, 3NF Normalization" },
                    { id: "dsa", label: "Algorithms & DSA", desc: "Time complexity, Collision handling, BFS/DFS" }
                  ].map((track) => (
                    <button
                      key={track.id}
                      onClick={() => {
                        setMockTopic(track.id);
                        setMockStep("interview");
                        setCurrentMockQuestionIndex(0);
                        setUserAnswer("");
                        setMockAnswers([]);
                        setMockFeedback([]);
                      }}
                      className="p-4 text-left border border-gray-200 rounded-xl hover:border-brand-red hover:bg-red-50/20 transition-all group"
                    >
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-brand-red font-outfit">{track.label}</h4>
                      <p className="text-[10px] text-gray-400 font-sans mt-1 leading-normal">{track.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mockStep === "interview" && (() => {
              const currentQ = mockQuestions[mockTopic]?.[currentMockQuestionIndex];
              if (!currentQ) return null;
              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-150">
                    <span className="text-[10px] font-extrabold text-brand-red font-outfit uppercase tracking-wider">
                      Question {currentMockQuestionIndex + 1} of 3
                    </span>
                    <span className="text-[9px] font-bold text-gray-500 font-outfit uppercase bg-gray-200 px-2 py-0.5 rounded">
                      {mockTopic.toUpperCase()} TRACK
                    </span>
                  </div>

                  <div className="p-4 bg-red-50/10 rounded-xl border border-brand-red/5">
                    <p className="text-sm font-bold text-gray-900 font-outfit leading-relaxed">
                      {currentQ.q}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 font-outfit">
                      Your Technical Answer:
                    </label>
                    <textarea
                      rows={5}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your technical explanation here. Try to mention key keywords, design patterns, and structural complexity where relevant..."
                      className="block w-full border border-gray-300 rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                      disabled={evaluating}
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="text-xs" 
                      onClick={() => setMockStep("select")}
                      disabled={evaluating}
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      loading={evaluating}
                      onClick={() => {
                        setEvaluating(true);
                        setTimeout(() => {
                          const evalRes = evaluateMockAnswer(userAnswer, currentQ.ideal);
                          const updatedAnswers = [...mockAnswers, userAnswer];
                          const updatedFeedback = [...mockFeedback, evalRes];
                          setMockAnswers(updatedAnswers);
                          setMockFeedback(updatedFeedback);
                          setEvaluating(false);
                          
                          if (currentMockQuestionIndex < 2) {
                            setCurrentMockQuestionIndex(currentMockQuestionIndex + 1);
                            setUserAnswer("");
                          } else {
                            setMockStep("result");
                          }
                        }, 1200);
                      }}
                      className="text-xs"
                    >
                      {currentMockQuestionIndex === 2 ? "Finish Interview" : "Submit & Next Question"}
                    </Button>
                  </div>
                </div>
              );
            })()}

            {mockStep === "result" && (() => {
              const totalScore = mockFeedback.reduce((acc, curr) => acc + curr.score, 0);
              const averageScore = (totalScore / 3).toFixed(1);
              const questions = mockQuestions[mockTopic] || [];
              
              return (
                <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
                  {/* Result Header */}
                  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-1">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">INTERVIEW SIMULATION SUMMARY</p>
                    <h2 className="text-2xl font-black font-outfit text-gray-900">{averageScore} / 10.0</h2>
                    <p className={`text-xs font-bold font-outfit uppercase ${
                      parseFloat(averageScore) >= 8.0 ? "text-emerald-600" :
                      parseFloat(averageScore) >= 5.0 ? "text-amber-600" : "text-brand-red"
                    }`}>
                      {parseFloat(averageScore) >= 8.0 ? "Ready for Placements" :
                       parseFloat(averageScore) >= 5.0 ? "Needs Polish" : "Review Concepts"}
                    </p>
                  </div>

                  {/* Question list with details */}
                  <div className="space-y-4">
                    {questions.map((q, idx) => {
                      const feed = mockFeedback[idx] || { score: 0, feedback: "" };
                      const ans = mockAnswers[idx] || "";
                      return (
                        <div key={idx} className="p-3 border border-gray-200 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-brand-red font-outfit">Question {idx + 1}</h4>
                            <span className="text-[10px] font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                              Score: {feed.score}/10
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-950 font-outfit leading-relaxed">{q.q}</p>
                          <div className="text-[10px] bg-gray-50 p-2 rounded-lg border border-gray-150 space-y-1">
                            <p className="text-gray-500 font-bold uppercase text-[8px]">Your Answer:</p>
                            <p className="text-gray-700 italic font-mono break-words">{ans || "(No answer)"}</p>
                          </div>
                          <div className="text-[10px] bg-emerald-50/30 p-2 rounded-lg border border-emerald-100 space-y-1">
                            <p className="text-emerald-700 font-bold uppercase text-[8px]">Ideal Explanation Reference:</p>
                            <p className="text-emerald-800">{q.ideal}</p>
                          </div>
                          <div className="text-[10px] bg-blue-50/20 p-2 rounded-lg border border-blue-100/50 space-y-1">
                            <p className="text-blue-700 font-bold uppercase text-[8px]">Interviewer Feedback:</p>
                            <p className="text-blue-800">{feed.feedback}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="text-xs" 
                      onClick={() => setMockStep("select")}
                    >
                      Retake Interview
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setShowMockModal(false)}
                      className="text-xs"
                    >
                      Close Summary
                    </Button>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
