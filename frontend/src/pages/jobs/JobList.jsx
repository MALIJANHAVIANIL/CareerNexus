import React from "react";
import JobCard from "./JobCard";

export default function JobList({
  jobs,
  selectedJob,
  onSelect,
  onSave,
  savedJobs,
}) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-10 text-center">
        <h2 className="text-xl font-semibold text-gray-700">
          No Jobs Found
        </h2>

        <p className="text-gray-500 mt-2">
          Try changing filters or search keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          selectedJob={selectedJob}
          onSelect={onSelect}
          onSave={onSave}
          savedJobs={savedJobs}
        />
      ))}

    </div>
  );
}