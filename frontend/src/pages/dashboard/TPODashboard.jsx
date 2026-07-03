import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  Users,
  Award,
  Building,
  Briefcase,
  Calendar,
  BarChart3,
  Sparkles,
  CheckCircle,
  XCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  ExternalLink
} from "lucide-react";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Button from "../../components/common/Button";

export const TPODashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // 1. Mock Alumni Verification requests
  const [pendingAlumni, setPendingAlumni] = useState([
    {
      id: "al-1",
      name: "Rajesh Kumar",
      email: "rajesh@tcs.com",
      company: "Tata Consultancy Services (TCS)",
      designation: "Technical Lead",
      graduationYear: 2017,
      prn: "PRN17092831"
    },
    {
      id: "al-2",
      name: "Deepa Nair",
      email: "deepa.nair@capgemini.com",
      company: "Capgemini India",
      designation: "Lead QA Analyst",
      graduationYear: 2019,
      prn: "PRN19028371"
    }
  ]);

  // 2. Mock Stats State
  const [stats, setStats] = useState({
    placementRate: 84,
    placedStudents: 312,
    activeRecruiters: 28,
    approvedMentors: 42
  });

  // 3. Mock Partner Companies
  const [partners, setPartners] = useState([
    { name: "Google India", jobsCount: 3, status: "Active Drive" },
    { name: "TCS", jobsCount: 14, status: "Active Drive" },
    { name: "Infosys", jobsCount: 8, status: "Recruiting" },
    { name: "JPMorgan Chase", jobsCount: 5, status: "Recruiting" },
    { name: "Capgemini", jobsCount: 9, status: "Stalled" },
    { name: "Stripe", jobsCount: 2, status: "Active Drive" }
  ]);

  // Departmental Placement percentages
  const departmentPlacements = [
    { name: "Computer Eng.", rate: 94, color: "bg-brand-red" },
    { name: "Information Tech.", rate: 90, color: "bg-brand-black" },
    { name: "ENTC", rate: 82, color: "bg-red-800" },
    { name: "Mechanical Eng.", rate: 68, color: "bg-slate-600" },
    { name: "Electrical Eng.", rate: 62, color: "bg-slate-500" },
    { name: "Civil Eng.", rate: 55, color: "bg-slate-400" }
  ];

  // Handlers
  const handleApproveAlumni = (alId, name) => {
    setPendingAlumni(prev => prev.filter(a => a.id !== alId));
    setStats(prev => ({
      ...prev,
      approvedMentors: prev.approvedMentors + 1
    }));
    showToast(`Alumni profile for ${name} has been verified and approved as Mentor!`, "success");
  };

  const handleRejectAlumni = (alId, name) => {
    setPendingAlumni(prev => prev.filter(a => a.id !== alId));
    showToast(`Alumni registration for ${name} declined.`, "info");
  };

  return (
    <div className="space-y-6">
      {/* TPO Welcome Card */}
      <div className="bg-gradient-to-r from-brand-black to-red-950 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden border border-brand-red/10">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-brand-red/20 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="bg-brand-red text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            <Sparkles size={9} /> Administrative Portal
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-outfit">Welcome, {user?.name || "TPO Officer"}</h2>
          <p className="text-sm text-gray-300 font-sans mt-1">
            Training & Placement Office • Campus Placement & Corporate Relations Panel
          </p>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Overall Placement Rate", count: `${stats.placementRate}%`, icon: <TrendingUp size={20} className="text-white" />, bg: "bg-brand-red" },
          { label: "Students Placed", count: stats.placedStudents, icon: <Users size={20} className="text-white" />, bg: "bg-brand-black" },
          { label: "Partner Companies", count: stats.activeRecruiters, icon: <Building size={20} className="text-white" />, bg: "bg-brand-red" },
          { label: "Approved Alumni Mentors", count: stats.approvedMentors, icon: <Award size={20} className="text-white" />, bg: "bg-brand-black" }
        ].map((stat, idx) => (
          <Card key={idx} hover={false} className="bg-white border-gray-150 shadow-xs">
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

      {/* GRAPH SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: SVG placement rates and Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Department placement rates */}
          <Card hover={false} className="bg-white border-gray-150 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
              <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 size={16} className="text-brand-red" /> Placement Rates by Department (Class of 2025)
              </h3>
            </CardHeader>
            <CardBody className="p-5 space-y-4">
              {departmentPlacements.map((dept, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-700">{dept.name}</span>
                    <span className="font-extrabold text-brand-black">{dept.rate}% Placed</span>
                  </div>
                  {/* CSS Progress Bar */}
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                    <div 
                      className={`h-full ${dept.color} rounded-full transition-all duration-500`}
                      style={{ width: `${dept.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Pending Alumni Approvals Table */}
          <Card hover={false} className="bg-white border-gray-150 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 flex justify-between items-center py-4 px-5">
              <h3 className="text-sm font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <Award size={16} className="text-brand-red" /> Pending Alumni Verifications ({pendingAlumni.length})
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              {pendingAlumni.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                  <CheckCircle size={32} className="text-emerald-500 opacity-75" />
                  <p className="font-semibold text-gray-700">Verification Queue Empty!</p>
                  <p className="text-xs">No pending alumni credentials requiring verification at this time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-150 text-xs">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Alumni</th>
                        <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Company / Designation</th>
                        <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase font-outfit">Passout</th>
                        <th className="px-6 py-3 text-right font-bold text-gray-500 uppercase font-outfit">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {pendingAlumni.map((al) => (
                        <tr key={al.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-bold text-gray-950 font-outfit">{al.name}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{al.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-gray-700">{al.designation}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{al.company}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-600">
                            Class of {al.graduationYear}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleApproveAlumni(al.id, al.name)}
                                className="px-3 py-1 bg-brand-red hover:bg-brand-darkRed text-white text-[10px] font-bold rounded-lg transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectAlumni(al.id, al.name)}
                                className="px-3 py-1 border border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-600 text-[10px] font-bold rounded-lg transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

        </div>

        {/* Right column: Corporate recruitment partner stats */}
        <div className="space-y-6">
          <Card hover={false} className="bg-white border-gray-150 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-5">
              <h3 className="text-xs font-bold text-gray-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                <Building size={15} className="text-brand-red" /> Placement Drives & Partners ({partners.length})
              </h3>
            </CardHeader>
            <CardBody className="p-4 space-y-3.5">
              {partners.map((partner, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-150 flex flex-col gap-2 relative">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-950 font-outfit">{partner.name}</h4>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      partner.status === "Active Drive" ? "bg-red-50 text-brand-red border border-red-100" :
                      partner.status === "Recruiting" ? "bg-slate-900 text-white" : "bg-gray-150 text-gray-500"
                    }`}>
                      {partner.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 border-t border-gray-150 pt-2">
                    <span>Active placements:</span>
                    <span className="font-extrabold text-brand-red">{partner.jobsCount} open posts</span>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default TPODashboard;
