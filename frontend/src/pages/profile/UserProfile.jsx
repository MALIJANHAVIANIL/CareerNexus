import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { profileApi } from "../../api/profile";
import {
  User,
  Mail,
  Award,
  BookOpen,
  Briefcase,
  FileText,
  Upload,
  Plus,
  X,
  CheckCircle,
  Eye
} from "lucide-react";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

export const UserProfile = () => {
  const { user, updateProfileState } = useAuth();
  const { showToast } = useNotifications();

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [title, setTitle] = useState(user?.title || "");
  const [company, setCompany] = useState(user?.company || "");
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);

  // Resume state
  const [showResumePreview, setShowResumePreview] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await profileApi.updateProfile({
        name,
        title,
        company,
        skills
      });
      updateProfileState(updated);
      showToast("Profile updated successfully!", "success");
      setIsEditing(false);
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // Simulate file reading
      const reader = new FileReader();
      reader.onloadend = async () => {
        const updated = await profileApi.uploadAvatar(reader.result);
        updateProfileState(updated);
        showToast("Profile avatar uploaded successfully!", "success");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast("Avatar upload failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const updated = await profileApi.uploadResume(file.name, "#");
      updateProfileState(updated);
      showToast(`Resume '${file.name}' uploaded successfully!`, "success");
    } catch (err) {
      showToast("Resume upload failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) {
      setNewSkill("");
      return;
    }
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header Details card */}
      <Card hover={false} className="bg-white">
        <CardBody className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
          {/* Avatar Upload */}
          <div className="relative group cursor-pointer flex-shrink-0">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
              alt={user?.name}
              className="h-28 w-28 rounded-2xl object-cover border-4 border-white shadow-md"
            />
            <label className="absolute inset-0 bg-black/50 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold">
              <Upload size={16} className="mr-1" /> Change
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left min-w-0 space-y-2.5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div>
                <h2 className="text-2xl font-black text-gray-900 font-outfit truncate">{user?.name}</h2>
                <p className="text-sm font-semibold text-brand-red font-outfit mt-0.5">{user?.title}</p>
              </div>
              <Button
                variant={isEditing ? "outline" : "primary"}
                onClick={() => {
                  if (isEditing) {
                    // Reset fields
                    setName(user?.name || "");
                    setTitle(user?.title || "");
                    setCompany(user?.company || "");
                    setSkills(user?.skills || []);
                  }
                  setIsEditing(!isEditing);
                }}
                className={isEditing ? "border-gray-200" : "bg-brand-red text-white"}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
            
            <p className="text-xs text-gray-400 flex items-center justify-center md:justify-start gap-1 font-sans">
              <Mail size={13} /> {user?.email} • <span className="capitalize font-bold text-gray-500">{user?.role} Profile</span>
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Main splits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: General Profile Form / Details */}
        <div className="md:col-span-2 space-y-6">
          {isEditing ? (
            <Card hover={false} className="bg-white">
              <CardHeader className="bg-white">
                <h3 className="text-base font-bold text-gray-900 font-outfit">Edit Personal Information</h3>
              </CardHeader>
              <CardBody className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Headline / Professional Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Computer Science Junior | Software Engineer Intern"
                    required
                  />
                  {user?.role === "hr" && (
                    <Input
                      label="Company Name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                  )}

                  {/* Skills Editor */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 font-outfit uppercase">Skills Tags</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Add a skill (e.g. React)"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-red"
                      />
                      <Button onClick={handleAddSkill} size="sm" className="bg-brand-red text-white p-2">
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1 text-xs font-bold bg-red-50 text-brand-red px-2.5 py-1 rounded-lg border border-red-100">
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-brand-darkRed text-red-400">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" loading={loading} className="bg-brand-red text-white">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          ) : (
            <>
              {/* Profile Details Sheet */}
              <Card hover={false} className="bg-white">
                <CardHeader className="bg-white">
                  <h3 className="text-base font-bold text-gray-900 font-outfit">Skills Portfolio</h3>
                </CardHeader>
                <CardBody className="p-6">
                  {user?.skills?.length === 0 ? (
                    <p className="text-xs text-gray-400">No skills added yet. Click Edit Profile to add skills.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {user?.skills?.map((skill) => (
                        <span key={skill} className="text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200/80 px-3 py-1.5 rounded-xl">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Education section mockup */}
              <Card hover={false} className="bg-white">
                <CardHeader className="bg-white">
                  <h3 className="text-base font-bold text-gray-900 font-outfit">Education & Certification</h3>
                </CardHeader>
                <CardBody className="p-6 space-y-4">
                  {user?.education && user.education.length > 0 ? (
                    user.education.map((edu, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="p-2 bg-red-50 text-brand-red rounded-xl h-fit">
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 font-outfit">{edu.school}</h4>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">{edu.degree}</p>
                          <p className="text-[10px] text-gray-400 mt-1 font-sans">{edu.year} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-4">
                      <div className="p-2 bg-red-50 text-brand-red rounded-xl h-fit">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 font-outfit">State University</h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">B.S. in Computer Science</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-sans">2023 - 2027 • GPA: 3.8/4.0</p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </>
          )}
        </div>

        {/* Right Side: Resume Manager Card */}
        <div className="md:col-span-1 space-y-6">
          <Card hover={false} className="bg-white">
            <CardHeader className="bg-white">
              <h3 className="text-base font-bold text-gray-900 font-outfit flex items-center gap-1.5">
                <FileText size={18} className="text-brand-red" /> CV / Resume
              </h3>
            </CardHeader>
            <CardBody className="p-5 flex flex-col gap-4">
              <div className="p-3.5 bg-gray-50 border border-gray-150 rounded-xl flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-red/10 text-brand-red flex items-center justify-center font-black rounded-lg">
                  PDF
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-800 truncate">{user?.resumeName || "No resume uploaded"}</p>
                  <p className="text-[10px] text-gray-400">PDF Format (Max 5MB)</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50/50 py-2 rounded-lg text-xs font-bold text-gray-700 cursor-pointer transition">
                  <Upload size={14} /> Upload New
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className="hidden" />
                </label>

                {user?.resumeName && (
                  <Button
                    variant="outline"
                    onClick={() => setShowResumePreview(true)}
                    iconBefore={<Eye size={14} />}
                  >
                    View Resume
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

      </div>

      {/* Mock Resume PDF Visualizer Drawer */}
      {showResumePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setShowResumePreview(false)} />
          <div className="relative w-full max-w-xl bg-white h-screen shadow-2xl flex flex-col justify-between border-l border-gray-150 animate-slide-in-right z-10">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-150 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="text-brand-red" size={20} />
                <h3 className="text-sm font-bold text-gray-900 font-outfit">{user?.resumeName}</h3>
              </div>
              <button onClick={() => setShowResumePreview(false)} className="p-1 rounded hover:bg-gray-200 text-gray-500">
                <X size={18} />
              </button>
            </div>

            {/* Document visual mockup body */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-100 flex justify-center">
              {/* Mock Resume Paper sheet */}
              <div className="bg-white max-w-md w-full shadow-md rounded-sm p-6 flex flex-col gap-4 border border-gray-200 aspect-[1/1.41] h-fit">
                <div className="text-center pb-3 border-b border-gray-200">
                  <h2 className="text-base font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-[10px] text-gray-500 mt-1">{user?.email} • (555) 123-4567 • San Francisco, CA</p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-wide">Education</h4>
                  <div className="h-0.5 bg-gray-100 w-full mb-1" />
                  <p className="text-[9px] font-bold text-gray-800">State University — BS in Computer Science</p>
                  <p className="text-[8px] text-gray-400 leading-none">2023 - 2027 • GPA: 3.8 / 4.0</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-wide">Technical Skills</h4>
                  <div className="h-0.5 bg-gray-100 w-full mb-1" />
                  <p className="text-[8.5px] text-gray-600 leading-normal">
                    React, JavaScript, CSS, HTML5, Node.js, Express, Python, SQL, Git, Linux
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-wide">Projects</h4>
                  <div className="h-0.5 bg-gray-100 w-full mb-1" />
                  <div>
                    <p className="text-[9px] font-bold text-gray-800">CareerNexus Platform Dev</p>
                    <p className="text-[8px] text-gray-500 leading-relaxed">
                      Built frontend dashboards in React, designed responsive mock state managers, and customized Tailwind color pallets.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-150 bg-gray-50 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowResumePreview(false)}>
                Close Viewer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
