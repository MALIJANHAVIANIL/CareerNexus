import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { eventsApi } from "../../api/events";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Sparkles,
  PlusCircle,
  Video,
  CheckCircle,
  Users,
  Search,
  Filter,
  Award
} from "lucide-react";
import Card, { CardBody } from "../../components/common/Card";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import confetti from "canvas-confetti";

// Detailed Mock Past Events Data
const MOCK_PAST_EVENTS = [
  {
    id: "past-1",
    title: "GitHub Bootcamp: Git & GitHub Workflow for Collaborations",
    speaker: "Vikramaditya Roy",
    speakerTitle: "Senior Architect at Microsoft",
    date: "May 10, 2026",
    time: "2:00 PM - 3:30 PM",
    type: "Placement Prep",
    location: "Virtual (Recorded Link)",
    description: "An intensive introductory bootcamp covering basic Git operations, branch merging, rebasing, pull requests, resolving merge conflicts, and GitHub Projects setup.",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600",
    registeredUsers: [],
    isPast: true
  },
  {
    id: "past-2",
    title: "Introduction to Google Summer of Code (GSoC)",
    speaker: "Amit Patil",
    speakerTitle: "AI Research Scientist at NVIDIA",
    date: "April 15, 2026",
    time: "5:00 PM - 6:30 PM",
    type: "Alumni Meetup",
    location: "Auditorium 1 & Google Meet",
    description: "Guidance session explaining how to find open-source projects, prepare proposal drafts, communicate with mentors, and successfully complete the GSoC coding cycles.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600",
    registeredUsers: [],
    isPast: true
  }
];

export const EventHub = () => {
  const { user } = useAuth();
  const { showToast, addNotification } = useNotifications();
  const location = useLocation();

  // Tabs: explore, registered, past
  const [activeTab, setActiveTab] = useState("explore");

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected event for details pane
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Create Event Form state (visible for Alumni/HR/TPO)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [evtTitle, setEvtTitle] = useState("");
  const [evtSpeaker, setEvtSpeaker] = useState("");
  const [evtSpeakerTitle, setEvtSpeakerTitle] = useState("");
  const [evtDate, setEvtDate] = useState("");
  const [evtTime, setEvtTime] = useState("");
  const [evtType, setEvtType] = useState("Webinar");
  const [evtLocation, setEvtLocation] = useState("");
  const [evtDesc, setEvtDesc] = useState("");

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventsApi.getEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Handle redirect from dashboard with state.eventId
  useEffect(() => {
    if (events.length > 0) {
      if (location.state?.eventId) {
        const found = events.find((e) => e.id === location.state.eventId);
        if (found) {
          setSelectedEvent(found);
          window.history.replaceState({}, document.title);
        }
      } else if (!selectedEvent) {
        setSelectedEvent(events[0]);
      }
    }
  }, [location.state, events]);

  // Update selected event if the list changes
  useEffect(() => {
    const filtered = getFilteredEvents(activeTab);
    if (filtered.length > 0) {
      const stillExists = filtered.find(e => e.id === selectedEvent?.id);
      setSelectedEvent(stillExists || filtered[0]);
    } else {
      setSelectedEvent(null);
    }
  }, [activeTab, search, selectedCategory, events]);

  const handleRegisterEvent = async (eventId, title) => {
    try {
      const updatedEvent = await eventsApi.registerForEvent(eventId);
      const isRegistered = updatedEvent.registeredUsers.includes(user.id);
      
      showToast(
        isRegistered ? `Registered for event: ${title}!` : `Cancelled registration for: ${title}.`,
        isRegistered ? "success" : "info"
      );

      if (isRegistered) {
        addNotification("event", "Event Registered", `You have registered for '${title}'. Check details in your inbox.`);
        
        // Confetti!
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#990000", "#111827", "#f59e0b"]
        });
      }

      await loadEvents();
    } catch (err) {
      showToast(err.message || "Failed to toggle event registration.", "error");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!evtTitle || !evtSpeaker || !evtDate || !evtTime || !evtLocation || !evtDesc) {
      showToast("Please fill in all event fields.", "warning");
      return;
    }

    try {
      const newEvt = await eventsApi.createEvent({
        title: evtTitle,
        speaker: evtSpeaker,
        speakerTitle: evtSpeakerTitle || "Guest Speaker",
        date: evtDate,
        time: evtTime,
        type: evtType,
        location: evtLocation,
        description: evtDesc
      });
      showToast("Event created successfully!", "success");
      setShowCreateModal(false);
      // Reset Form
      setEvtTitle("");
      setEvtSpeaker("");
      setEvtSpeakerTitle("");
      setEvtDate("");
      setEvtTime("");
      setEvtLocation("");
      setEvtDesc("");
      
      await loadEvents();
      setSelectedEvent(newEvt);
    } catch (err) {
      showToast(err.message || "Failed to create event.", "error");
    }
  };

  const getFilteredEvents = (tab) => {
    const listToFilter = tab === "past" ? MOCK_PAST_EVENTS : events;
    return listToFilter.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.speaker.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = selectedCategory ? e.type === selectedCategory : true;

      if (tab === "registered") {
        return matchesSearch && matchesCategory && e.registeredUsers?.includes(user?.id);
      }
      return matchesSearch && matchesCategory;
    });
  };

  const filteredEvents = getFilteredEvents(activeTab);

  const isOrganizer = user?.role === "alumni" || user?.role === "hr" || user?.role === "tpo";
  const uniqueCategories = Array.from(new Set(events.map(e => e.type)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Search & Filter banner */}
      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-gray-100">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xl font-extrabold text-gray-900 font-outfit">Career Development Events</h2>
            <p className="text-xs text-gray-500 font-sans">Learn placement hacks and network directly with experienced graduates.</p>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            {isOrganizer && (
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                iconBefore={<PlusCircle size={16} />}
                className="bg-brand-red hover:bg-brand-darkRed text-white px-4 py-2 text-xs"
              >
                Host Event
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by title, speaker, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red hover:border-gray-400 transition bg-white"
            />
          </div>

          {/* Filter by Category */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red hover:border-gray-400 transition appearance-none bg-white font-medium text-gray-700 font-sans"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-gray-100 pt-3 flex gap-2">
          {["explore", "registered", "past"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-outfit uppercase transition-all ${
                activeTab === tab
                  ? "bg-brand-red text-white"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab === "explore" ? "All Schedule" : tab === "registered" ? "My Registered Events" : "Past Events"}
            </button>
          ))}
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side List: 1/3 layout on desktop */}
        <div className="lg:col-span-1 space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
          {loading && activeTab !== "past" ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="h-24 bg-gray-200 rounded-lg" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              title="No events found"
              message={activeTab === "registered" ? "You have not registered for any events matching your filters." : "No events match your search filters."}
            />
          ) : (
            filteredEvents.map((evt) => {
              const isReg = evt.registeredUsers?.includes(user?.id);
              return (
                <Card
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  hover
                  className={`cursor-pointer border-gray-150 overflow-hidden ${selectedEvent?.id === evt.id ? "ring-1.5 ring-brand-red bg-red-50/5" : "bg-white"}`}
                >
                  <div className="h-24 overflow-hidden relative">
                    <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-brand-black/85 text-white text-[8px] font-bold px-2 py-0.5 rounded font-outfit uppercase">
                      {evt.type}
                    </span>
                    {isReg && (
                      <span className="absolute top-2 right-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                        Registered
                      </span>
                    )}
                    {evt.isPast && (
                      <span className="absolute top-2 right-2 bg-gray-800/90 text-gray-300 border border-gray-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                        Completed
                      </span>
                    )}
                  </div>
                  <CardBody className="p-4 space-y-2.5">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-gray-955 font-outfit leading-tight break-words">{evt.title}</h4>
                      <p className="text-[10px] text-gray-500 font-medium truncate mt-1">By {evt.speaker}</p>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-gray-400 font-sans font-medium pt-2 border-t border-gray-50">
                      <span>{evt.date}</span>
                      <span className="text-brand-red font-bold">{evt.isPast ? "Archive" : `${evt.registeredUsers?.length || 0} attending`}</span>
                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Side Details: 2/3 layout on desktop */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <Card hover={false} className="sticky top-24 bg-white border-gray-150 overflow-hidden">
              <div className="h-56 w-full relative">
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
                <span className="absolute top-4 left-4 bg-brand-black text-white text-[10px] font-bold px-3 py-1 rounded-md uppercase font-outfit tracking-wider">
                  {selectedEvent.type}
                </span>
              </div>

              {/* Event Header Details */}
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="text-base font-extrabold text-gray-900 font-outfit leading-tight break-words">{selectedEvent.title}</h3>
                  <p className="text-xs text-gray-500 mt-1.5 font-semibold font-sans flex items-center gap-1.5">
                    <User size={13} className="text-gray-400" /> Lead Speaker: <span className="text-gray-700 font-bold">{selectedEvent.speaker}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium pl-4.5">{selectedEvent.speakerTitle}</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                  {selectedEvent.isPast ? (
                    <Button
                      variant="outline"
                      onClick={() => showToast("Opening event recording playback link...", "info")}
                      className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white px-4 py-2 text-xs font-bold"
                    >
                      Watch Recording
                    </Button>
                  ) : (
                    user?.role === "student" && (
                      <Button
                        variant={selectedEvent.registeredUsers?.includes(user?.id) ? "outline" : "primary"}
                        onClick={() => handleRegisterEvent(selectedEvent.id, selectedEvent.title)}
                        className={
                          selectedEvent.registeredUsers?.includes(user?.id)
                            ? "border-emerald-250 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 text-xs font-bold"
                            : "bg-brand-red hover:bg-brand-darkRed text-white px-4 py-2 text-xs font-bold"
                        }
                      >
                        {selectedEvent.registeredUsers?.includes(user?.id) ? (
                          <span className="flex items-center gap-1"><CheckCircle size={14} /> Registered</span>
                        ) : (
                          "Register for Event"
                        )}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Event Meta Details */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-150">
                  <div className="flex items-start gap-2.5">
                    <Calendar size={16} className="text-brand-red mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-400 font-outfit block">Date</span>
                      <span className="text-xs font-bold text-gray-800 mt-0.5 block">{selectedEvent.date}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock size={16} className="text-brand-red mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-400 font-outfit block">Time</span>
                      <span className="text-xs font-bold text-gray-800 mt-0.5 block">{selectedEvent.time}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-brand-red mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-gray-400 font-outfit block">Venue</span>
                      <span className="text-xs font-bold text-gray-850 mt-0.5 block truncate">{selectedEvent.location}</span>
                    </div>
                  </div>
                </div>

                {/* About Event / Agenda */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-955 font-outfit uppercase tracking-wide flex items-center gap-1.5">
                    <Award size={14} className="text-brand-red" /> Event Agenda & Details
                  </h4>
                  <p className="text-xs text-gray-500 font-sans leading-relaxed whitespace-pre-line">{selectedEvent.description}</p>
                </div>

                {/* Attendees list size */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 font-semibold font-outfit">
                    <Users size={14} className="text-gray-400" /> {selectedEvent.isPast ? "Completed Event" : `${selectedEvent.registeredUsers?.length || 0} Students registered`}
                  </span>
                  <span className="text-[10px] text-gray-400 italic">Verify agenda timings above before attending.</span>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-10 border border-dashed border-gray-200 bg-white/50 rounded-2xl">
              <p className="text-xs text-gray-400 font-outfit">Select an event schedule to view timing and agenda details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Host Event Dialog Form */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-150 z-10 p-6 flex flex-col gap-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-955 font-outfit uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-1.5">
              <PlusCircle size={16} className="text-brand-red" /> Host Career Event
            </h3>
            
            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-650 mb-1 font-outfit uppercase">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. System Design Mock Interview Session"
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-650 mb-1 font-outfit uppercase">Host / Speaker Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={evtSpeaker}
                    onChange={(e) => setEvtSpeaker(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-650 mb-1 font-outfit uppercase">Speaker Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Staff Architect at Stripe"
                    value={evtSpeakerTitle}
                    onChange={(e) => setEvtSpeakerTitle(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-650 mb-1 font-outfit uppercase">Event Category</label>
                  <select
                    value={evtType}
                    onChange={(e) => setEvtType(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white font-semibold text-gray-700 font-sans"
                  >
                    <option value="Webinar">Webinar</option>
                    <option value="Placement Prep">Placement Prep</option>
                    <option value="Alumni Meetup">Alumni Meetup</option>
                    <option value="HR Panel">HR Panel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-650 mb-1 font-outfit uppercase">Date</label>
                  <input
                    type="text"
                    required
                    placeholder="June 30, 2026"
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-650 mb-1 font-outfit uppercase">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="5:00 PM - 6:00 PM EST"
                    value={evtTime}
                    onChange={(e) => setEvtTime(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-650 mb-1 font-outfit uppercase">Location Link / Venue</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zoom Virtual Room / Aud-2"
                  value={evtLocation}
                  onChange={(e) => setEvtLocation(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-650 mb-1 font-outfit uppercase">Detailed Agenda</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Briefly state speaker details and schedule topics..."
                  value={evtDesc}
                  onChange={(e) => setEvtDesc(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red font-sans bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)} className="text-xs py-1.5 px-3">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-brand-red text-white hover:bg-brand-darkRed text-xs py-1.5 px-3">
                  Publish Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventHub;
