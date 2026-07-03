import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import {
  Briefcase,
  UserCheck,
  Calendar,
  MessageSquare,
  User,
  Sparkles,
  MapPin,
  DollarSign,
  Bell,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import Card, { CardBody } from "../../components/common/Card";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  // Calculate Naukri-style profile completeness score
  const [profileScore, setProfileScore] = useState(65);

  useEffect(() => {
    if (!user) return;
    let score = 0;
    if (user.name) score += 5;
    if (user.prn) score += 5;
    if (user.branch) score += 5;

    const localDataKey = `cn_expanded_profile_${user.email}`;
    const localData = localStorage.getItem(localDataKey);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (parsed.summary?.trim().length > 20) score += 15;
      if (parsed.internships?.length > 0) score += 20;
      if (parsed.projects?.length > 0) score += 15;
      if (parsed.certifications?.length > 0) score += 10;
      if (parsed.languages?.length > 0) score += 5;
    } else {
      score += 65; // Seed demo profile value
    }
    setProfileScore(score);
  }, [user]);

  const recentJobs = [
    {
      company: "Google India",
      role: "Associate Software Engineer",
      package: "24 - 28 LPA",
      location: "Bangalore (Hybrid)"
    },
    {
      company: "Tata Consultancy Services (TCS)",
      role: "Systems Engineer (Digital)",
      package: "7.5 - 9 LPA",
      location: "Pune (On-site)"
    },
    {
      company: "JPMorgan Chase & Co.",
      role: "Software Engineer Intern",
      package: "12 LPA equivalent",
      location: "Mumbai (Remote)"
    }
  ];

  const recommendedMentors = [
    {
      name: "Vikramaditya Roy",
      company: "Microsoft Corporation",
      designation: "Senior Software Architect",
      year: "Class of 2020",
      experience: "6+ years",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Pooja Deshmukh",
      company: "Amazon Web Services",
      designation: "Cloud Infrastructure Engineer",
      year: "Class of 2022",
      experience: "4 years",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Amit Patil",
      company: "NVIDIA Graphics",
      designation: "AI Research Scientist",
      year: "Class of 2018",
      experience: "8 years",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
    }
  ];

  const upcomingEvents = [
    {
      name: "Resume Building & ATS Optimization Workshop",
      date: "June 25, 2026 • 4:00 PM IST",
      mode: "Online (Google Meet)"
    },
    {
      name: "Technical Mock Interview Marathon",
      date: "July 02, 2026 • 10:00 AM IST",
      mode: "Offline (Campus Seminar Hall)"
    },
    {
      name: "Product Management Roadmap Session",
      date: "July 10, 2026 • 5:30 PM IST",
      mode: "Online (Zoom Webinar)"
    }
  ];

  const notifications = [
    {
      text: "New job opportunity posted by Google India matching your backend developer skills.",
      time: "2 hours ago",
      type: "job"
    },
    {
      text: "Your mentorship request has been accepted by Vikramaditya Roy (Microsoft).",
      time: "1 day ago",
      type: "mentor"
    },
    {
      text: "Reminder: Upcoming Resume Building & ATS Workshop starts in 24 hours.",
      time: "2 days ago",
      type: "event"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Student Welcome Card */}
      <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden border border-brand-red/10">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-brand-red/20 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="bg-brand-red text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                <Sparkles size={9} /> Placement Portal
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-outfit">Welcome Back, {user?.name || "Student"}</h2>
              <p className="text-xs text-gray-300 font-sans">
                Permanent Registration Number (PRN): <span className="font-mono text-white font-bold">{user?.prn || "N/A"}</span> • Branch: {user?.branch || "Computer Engineering"}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/10 text-right space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-gray-400 font-outfit tracking-wide block">Placement Status</span>
              <span className="text-xs font-bold text-emerald-400 font-outfit flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Ready to Apply
              </span>
            </div>
          </div>

          {/* Profile strength bar */}
          <div className="space-y-1.5 max-w-md pt-2">
            <div className="flex justify-between text-xs text-gray-300">
              <span>Profile Completeness</span>
              <span className="font-bold text-white">{profileScore}%</span>
            </div>
            <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-red rounded-full transition-all duration-500" 
                style={{ width: `${profileScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Available Jobs", count: "124", icon: <Briefcase size={20} className="text-white" />, bg: "bg-brand-red" },
          { label: "Alumni Mentors", count: "48", icon: <UserCheck size={20} className="text-white" />, bg: "bg-brand-black" },
          { label: "Upcoming Events", count: "6", icon: <Calendar size={20} className="text-white" />, bg: "bg-brand-red" },
          { label: "Unread Messages", count: "3", icon: <MessageSquare size={20} className="text-white" />, bg: "bg-brand-black" }
        ].map((stat, idx) => (
          <Card 
            key={idx} 
            onClick={() => {
              if (stat.label === "Available Jobs") navigate("/student/jobs");
              else if (stat.label === "Alumni Mentors") navigate("/student/mentorship");
              else if (stat.label === "Upcoming Events") navigate("/student/events");
              else if (stat.label === "Unread Messages") navigate("/student/chat");
            }}
            hover
            className="cursor-pointer bg-white border-gray-150 shadow-xs hover:shadow-sm transition-all"
          >
            <CardBody className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-400 font-outfit uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-brand-black font-outfit">{stat.count}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} shadow-md`}>
                {stat.icon}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Dashboard Main Layout Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Jobs, Mentors, Events) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 2: RECENT JOBS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase size={16} className="text-brand-red" /> Recent Job Opportunities
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentJobs.map((job, idx) => (
                <Card key={idx} className="bg-white border-gray-150 hover:border-brand-red/20 transition-all flex flex-col justify-between h-full">
                  <CardBody className="p-4 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-extrabold text-gray-400 font-outfit uppercase tracking-wider truncate">{job.company}</p>
                      <h4 className="text-xs font-bold text-brand-black font-outfit leading-tight line-clamp-2">{job.role}</h4>
                    </div>

                    <div className="space-y-1 text-[10px] text-gray-600 font-sans">
                      <div className="flex items-center gap-1">
                        <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={11} className="text-gray-400 flex-shrink-0" />
                        <span className="font-semibold text-brand-red">{job.package}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        let mappedId = "job-1";
                        if (job.company.includes("TCS")) mappedId = "job-2";
                        else if (job.company.includes("JPMorgan")) mappedId = "job-3";
                        navigate("/student/jobs", { state: { jobId: mappedId } });
                      }}
                      className="w-full py-1.5 bg-gray-50 hover:bg-brand-red hover:text-white border border-gray-200 hover:border-brand-red text-[10px] font-bold text-gray-700 rounded-lg transition-all flex items-center justify-center gap-1 shadow-2xs"
                    >
                      View Details
                    </button>
                  </CardBody>
                </Card>
              ))}
            </div>

            <div className="flex justify-center pt-1">
              <button 
                onClick={() => navigate("/student/jobs")}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-brand-red hover:underline uppercase font-outfit"
              >
                View All Jobs <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* SECTION 3: RECOMMENDED MENTORS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck size={16} className="text-brand-red" /> Recommended Alumni Mentors
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedMentors.map((mentor, idx) => (
                <Card key={idx} className="bg-white border-gray-150 hover:border-brand-red/20 transition-all flex flex-col justify-between h-full">
                  <CardBody className="p-4 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <img 
                          src={mentor.avatar} 
                          alt={mentor.name} 
                          className="h-8 w-8 rounded-xl object-cover border border-gray-150 flex-shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-brand-black font-outfit leading-tight">{mentor.name}</h4>
                          <p className="text-[9px] text-gray-400 font-sans mt-0.5">{mentor.year}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-50 text-[10px] text-gray-650 font-sans leading-tight">
                        <p className="font-bold text-gray-800">{mentor.designation}</p>
                        <p className="text-gray-500 mt-0.5">{mentor.company}</p>
                        <p className="text-[9px] text-brand-red font-bold font-outfit mt-1">{mentor.experience} Exp</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        let mappedId = "mentor-1";
                        if (mentor.name.includes("Pooja")) mappedId = "mentor-2";
                        else if (mentor.name.includes("Amit")) mappedId = "mentor-3";
                        navigate("/student/mentorship", { state: { mentorId: mappedId } });
                      }}
                      className="w-full py-1.5 bg-white hover:bg-brand-red hover:text-white border border-brand-red text-[10px] font-bold text-brand-red rounded-lg transition-all flex items-center justify-center gap-1 shadow-2xs"
                    >
                      Request Mentorship
                    </button>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          {/* SECTION 4: UPCOMING EVENTS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={16} className="text-brand-red" /> Upcoming Events
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingEvents.map((event, idx) => (
                <Card key={idx} className="bg-white border-gray-150 hover:border-brand-red/20 transition-all flex flex-col justify-between h-full">
                  <CardBody className="p-4 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-2.5">
                      <span className={`inline-flex text-[8px] font-extrabold px-1.5 py-0.5 rounded font-outfit uppercase ${
                        event.mode.includes("Online") ? "bg-red-50 text-brand-red" : "bg-gray-100 text-gray-700"
                      }`}>
                        {event.mode.includes("Online") ? "Online Session" : "On Campus"}
                      </span>
                      <h4 className="text-xs font-bold text-brand-black font-outfit leading-tight line-clamp-2 h-8">{event.name}</h4>
                      
                      <div className="text-[9px] text-gray-500 font-sans space-y-0.5">
                        <p className="font-bold text-gray-700">{event.date}</p>
                        <p className="italic">{event.mode}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        let mappedId = "evt-1";
                        if (event.name.includes("Mock Interview")) mappedId = "evt-2";
                        else if (event.name.includes("Product Management")) mappedId = "evt-3";
                        navigate("/student/events", { state: { eventId: mappedId } });
                      }}
                      className="w-full py-1.5 bg-brand-red hover:bg-brand-darkRed text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 shadow-xs"
                    >
                      Register / Details
                    </button>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Notifications list) */}
        <div className="space-y-6">
          
          {/* SECTION 5: NOTIFICATIONS */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-955 font-outfit uppercase tracking-wider flex items-center gap-1.5">
              <Bell size={16} className="text-brand-red" /> Recent Notifications
            </h3>

            <div className="space-y-4">
              {notifications.map((notif, idx) => (
                <div key={idx} className="flex gap-3 text-xs border-b border-gray-50 pb-3.5 last:border-0 last:pb-0">
                  <div className={`p-2 rounded-lg h-fit ${
                    notif.type === 'job' ? 'bg-red-50 text-brand-red' :
                    notif.type === 'mentor' ? 'bg-gray-100 text-brand-black' : 'bg-red-50/50 text-brand-red'
                  }`}>
                    {notif.type === 'job' && <Briefcase size={13} />}
                    {notif.type === 'mentor' && <UserCheck size={13} />}
                    {notif.type === 'event' && <Calendar size={13} />}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-[11px] text-gray-700 font-sans leading-relaxed break-words">{notif.text}</p>
                    <p className="text-[9px] text-gray-400 font-outfit font-bold">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Profile Summary Card */}
          <div className="bg-gradient-to-br from-brand-black to-slate-900 p-5 rounded-2xl border border-slate-800 text-white space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-brand-red">Your Placement Readiness</h4>
              <p className="text-[11px] text-gray-300 font-sans">Ensure your academic, skill, and certification details are up to date.</p>
            </div>
            <button 
              onClick={() => navigate("/profile")}
              className="w-full py-2 bg-brand-red hover:bg-brand-darkRed text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              Update Placement Profile <ChevronRight size={14} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
