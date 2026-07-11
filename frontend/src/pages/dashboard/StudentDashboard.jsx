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
import { jobsApi } from "../../api/jobs";
import { mentorshipApi } from "../../api/mentorship";
import { eventsApi } from "../../api/events";
import { chatApi } from "../../api/chat";
import { notificationsApi } from "../../api/notifications";
import { profileApi } from "../../api/profile";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  // Calculate profile completeness score
  const [profileScore, setProfileScore] = useState(0);

  const [availableJobsCount, setAvailableJobsCount] = useState(0);
  const [mentorsCount, setMentorsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const [recentJobs, setRecentJobs] = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [successStories, setSuccessStories] = useState([]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      // 1. Fetch available jobs
      const jobs = await jobsApi.getAllJobs();
      setAvailableJobsCount(jobs.length);
      setRecentJobs(jobs.slice(0, 3));

      // 2. Fetch alumni mentors
      const mentors = await mentorshipApi.getMentors();
      setMentorsCount(mentors.length);
      setRecommendedMentors(mentors.slice(0, 3));

      // 3. Fetch events
      const events = await eventsApi.getEvents();
      setEventsCount(events.length);
      setUpcomingEvents(events.slice(0, 3));

      // 4. Fetch chat conversations for message count
      const convs = await chatApi.getConversations();
      setUnreadMessages(convs.length);

      // 5. Fetch notifications
      const notifs = await notificationsApi.getNotifications();
      setNotifications(notifs.slice(0, 3));

      // 6. Fetch profile for completeness score calculation
      try {
        const profile = await profileApi.getProfile();
        let score = 0;
        if (user?.name) score += 5;
        if (profile.rollNumber) score += 5;
        if (profile.department) score += 5;
        if (profile.cgpa > 0) score += 5;

        if (profile.summary?.trim().length > 20) score += 15;
        else if (profile.summary?.trim().length > 0) score += 5;

        const skillsList = profile.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
        if (skillsList.length >= 5) score += 15;
        else if (skillsList.length > 0) score += 5;

        if (profile.internships?.length > 0) score += 20;
        if (profile.projects?.length > 0) score += 15;
        if (profile.certifications?.length > 0) score += 10;
        if (profile.languages?.length > 0) score += 5;

        setProfileScore(score);
      } catch (profileErr) {
        console.warn("Failed to load profile for score calculation:", profileErr);
      }
    } catch (err) {
      console.warn("Failed to load dashboard data dynamically:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadDashboardData();

    const storiesData = localStorage.getItem("cn_success_stories");
    if (storiesData) {
      setSuccessStories(JSON.parse(storiesData));
    } else {
      const defaultStories = [
        {
          name: "Janhavi Mali",
          role: "Java Developer",
          company: "TCS",
          package: "7.5 LPA",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
          quote: "Leveraged CareerNexus mentorship sessions and code preps to land my dream corporate role!"
        },
        {
          name: "Aditya Deshmukh",
          role: "Cloud Engineer",
          company: "Google India",
          package: "18.2 LPA",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
          quote: "The mock interviews evaluator tool was exactly what I needed to clear the technical rounds."
        },
        {
          name: "Sneha Kulkarni",
          role: "Software Intern",
          company: "Stripe",
          package: "12.0 LPA",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
          quote: "Regular placement drives on the portal kept me ahead of deadlines and corporate eligibility."
        }
      ];
      localStorage.setItem("cn_success_stories", JSON.stringify(defaultStories));
      setSuccessStories(defaultStories);
    }
  }, [user]);

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
          { label: "Available Jobs", count: availableJobsCount, icon: <Briefcase size={20} className="text-white" />, bg: "bg-brand-red" },
          { label: "Alumni Mentors", count: mentorsCount, icon: <UserCheck size={20} className="text-white" />, bg: "bg-brand-black" },
          { label: "Upcoming Events", count: eventsCount, icon: <Calendar size={20} className="text-white" />, bg: "bg-brand-red" },
          { label: "Unread Messages", count: unreadMessages, icon: <MessageSquare size={20} className="text-white" />, bg: "bg-brand-black" }
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
              {recentJobs.length === 0 ? (
                <div className="md:col-span-3 text-center py-6 text-xs text-gray-400 font-outfit bg-gray-50 rounded-xl border border-dashed border-gray-200">No jobs listed yet.</div>
              ) : (
                recentJobs.map((job, idx) => (
                  <Card key={idx} className="bg-white border-gray-150 hover:border-brand-red/20 transition-all flex flex-col justify-between h-full">
                    <CardBody className="p-4 flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-extrabold text-gray-400 font-outfit uppercase tracking-wider truncate">{job.company}</p>
                        <h4 className="text-xs font-bold text-brand-black font-outfit leading-tight line-clamp-2">{job.title}</h4>
                      </div>

                      <div className="space-y-1 text-[10px] text-gray-600 font-sans">
                        <div className="flex items-center gap-1">
                          <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign size={11} className="text-gray-400 flex-shrink-0" />
                          <span className="font-semibold text-brand-red">{job.salary || "N/A"}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => navigate("/student/jobs", { state: { jobId: job.id } })}
                        className="w-full py-1.5 bg-gray-50 hover:bg-brand-red hover:text-white border border-gray-200 hover:border-brand-red text-[10px] font-bold text-gray-700 rounded-lg transition-all flex items-center justify-center gap-1 shadow-2xs"
                      >
                        View Details
                      </button>
                    </CardBody>
                  </Card>
                ))
              )}
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
              {recommendedMentors.length === 0 ? (
                <div className="md:col-span-3 text-center py-6 text-xs text-gray-400 font-outfit bg-gray-50 rounded-xl border border-dashed border-gray-200">No mentors available yet.</div>
              ) : (
                recommendedMentors.map((mentor, idx) => (
                  <Card key={idx} className="bg-white border-gray-150 hover:border-brand-red/20 transition-all flex flex-col justify-between h-full">
                    <CardBody className="p-4 flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src={mentor.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"} 
                            alt={mentor.name} 
                            className="h-8 w-8 rounded-xl object-cover border border-gray-150 flex-shrink-0"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-brand-black font-outfit leading-tight">{mentor.name}</h4>
                            <p className="text-[9px] text-gray-400 font-sans mt-0.5">{mentor.domain || "Mentor"}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-50 text-[10px] text-gray-650 font-sans leading-tight">
                          <p className="font-bold text-gray-800">{mentor.title || "Industry Lead"}</p>
                          <p className="text-gray-500 mt-0.5">{mentor.company}</p>
                          <p className="text-[9px] text-brand-red font-bold font-outfit mt-1">{mentor.experience || "3+ years"} Exp</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => navigate("/student/mentorship", { state: { mentorId: mentor.id } })}
                        className="w-full py-1.5 bg-white hover:bg-brand-red hover:text-white border border-brand-red text-[10px] font-bold text-brand-red rounded-lg transition-all flex items-center justify-center gap-1 shadow-2xs"
                      >
                        Request Mentorship
                      </button>
                    </CardBody>
                  </Card>
                ))
              )}
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
              {upcomingEvents.length === 0 ? (
                <div className="md:col-span-3 text-center py-6 text-xs text-gray-400 font-outfit bg-gray-50 rounded-xl border border-dashed border-gray-200">No events scheduled.</div>
              ) : (
                upcomingEvents.map((event, idx) => {
                  const isOnline = event.location?.toLowerCase().includes("online") || event.location?.toLowerCase().includes("virtual") || event.location?.toLowerCase().includes("zoom") || event.location?.toLowerCase().includes("meet");
                  return (
                    <Card key={idx} className="bg-white border-gray-150 hover:border-brand-red/20 transition-all flex flex-col justify-between h-full">
                      <CardBody className="p-4 flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-2.5">
                          <span className={`inline-flex text-[8px] font-extrabold px-1.5 py-0.5 rounded font-outfit uppercase ${
                            isOnline ? "bg-red-50 text-brand-red" : "bg-gray-100 text-gray-700"
                          }`}>
                            {isOnline ? "Online Session" : "On Campus"}
                          </span>
                          <h4 className="text-xs font-bold text-brand-black font-outfit leading-tight line-clamp-2 h-8">{event.title}</h4>
                          
                          <div className="text-[9px] text-gray-500 font-sans space-y-0.5">
                            <p className="font-bold text-gray-700">{event.date} {event.time ? `• ${event.time}` : ""}</p>
                            <p className="italic">{event.location}</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => navigate("/student/events", { state: { eventId: event.id } })}
                          className="w-full py-1.5 bg-brand-red hover:bg-brand-darkRed text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 shadow-xs"
                        >
                          Register / Details
                        </button>
                      </CardBody>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* SECTION 5: PLACEMENT SUCCESS STORIES */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
              <Award size={16} className="text-brand-red animate-bounce" /> Campus Success Stories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {successStories.map((story, idx) => (
                <Card key={idx} className="bg-gradient-to-b from-white to-gray-50/50 border-gray-150 hover:border-brand-red/10 transition-all flex flex-col justify-between h-full">
                  <CardBody className="p-4 flex flex-col justify-between h-full space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={story.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                          alt={story.name} 
                          className="h-10 w-10 rounded-xl object-cover border border-gray-155 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-955 font-outfit truncate">{story.name}</h4>
                          <p className="text-[9px] text-gray-500 font-sans">{story.role} at <strong>{story.company}</strong></p>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-650 font-sans italic leading-relaxed bg-white/70 p-2 rounded-lg border border-gray-100/50">
                        "{story.quote}"
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-400">Package Secured:</span>
                      <span className="text-emerald-600 font-outfit font-extrabold">{story.package}</span>
                    </div>
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
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 font-outfit">No notifications.</div>
              ) : (
                notifications.map((notif, idx) => {
                  const typeLower = notif.type?.toLowerCase();
                  const isJob = typeLower === 'job' || typeLower === 'recruitment';
                  const isMentor = typeLower === 'mentor' || typeLower === 'mentorship';
                  const isEvent = typeLower === 'event' || typeLower === 'webinar';
                  return (
                    <div key={idx} className="flex gap-3 text-xs border-b border-gray-50 pb-3.5 last:border-0 last:pb-0">
                      <div className={`p-2 rounded-lg h-fit ${
                        isJob ? 'bg-red-50 text-brand-red' :
                        isMentor ? 'bg-gray-100 text-brand-black' : 'bg-red-50/50 text-brand-red'
                      }`}>
                        {isJob && <Briefcase size={13} />}
                        {isMentor && <UserCheck size={13} />}
                        {isEvent && <Calendar size={13} />}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-[11px] text-gray-700 font-sans leading-relaxed break-words">
                          {notif.title ? `${notif.title}: ` : ""}{notif.message}
                        </p>
                        <p className="text-[9px] text-gray-400 font-outfit font-bold">
                          {new Date(notif.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
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
