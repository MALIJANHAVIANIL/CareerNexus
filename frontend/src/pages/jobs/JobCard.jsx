import React from "react";
import {
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

export default function JobCard({
  job,
  selectedJob,
  onSelect,
  onSave,
  savedJobs = [],
}) {
  const saved = savedJobs.includes(job.id);

  return (
    <div
      onClick={() => onSelect(job)}
      className={`bg-white rounded-xl border p-5 mb-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        selectedJob?.id === job.id
          ? "border-red-700 shadow-lg"
          : "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start">

        <div className="flex gap-4">

          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl ${job.logoBg}`}
          >
            {job.logo}
          </div>

          <div>

            <h3 className="font-bold text-lg text-gray-900">
              {job.title}
            </h3>

          <p className="text-gray-700 font-medium">
           {job.companyName}
            </p>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">

              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {job.location}
              </div>

              <div className="flex items-center gap-1">
                <Briefcase size={16} />
                  {job.jobType}
                    </div>

              <div className="flex items-center gap-1">
  <DollarSign size={16} />
  {job.salaryRange}
</div>

            </div>

            <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
  <Clock size={14} />
  Posted {new Date(job.createdAt).toLocaleDateString()}
</div>

          </div>
        </div>

        <button
          onClick={(e) => onSave(job.id, e)}
          className="text-red-700 hover:scale-110 transition"
        >
          {saved ? (
            <BookmarkCheck size={22} fill="currentColor" />
          ) : (
            <Bookmark size={22} />
          )}
        </button>
      </div>

      <div className="mt-4 flex justify-between items-center">

        <span className="text-sm text-gray-500">
          {job.applicantsCount} Applicants
        </span>

        <button
          onClick={() => onSelect(job)}
          className="text-red-700 font-semibold hover:underline"
        >
          View Details →
        </button>

      </div>
    </div>
  );
}