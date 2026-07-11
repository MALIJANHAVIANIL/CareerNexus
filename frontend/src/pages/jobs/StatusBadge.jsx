import React from "react";

const STATUS_CONFIG = {
  applied: {
    text: "Applied",
    className:
      "bg-blue-100 text-blue-700 border border-blue-200",
  },
  shortlisted: {
    text: "Shortlisted",
    className:
      "bg-green-100 text-green-700 border border-green-200",
  },
  rejected: {
    text: "Rejected",
    className:
      "bg-red-100 text-red-700 border border-red-200",
  },
  interview: {
    text: "Interview",
    className:
      "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  selected: {
    text: "Selected",
    className:
      "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
};

export default function StatusBadge({ status }) {
  const badge =
    STATUS_CONFIG[status?.toLowerCase()] || {
      text: status || "Unknown",
      className:
        "bg-gray-100 text-gray-700 border border-gray-200",
    };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}
    >
      {badge.text}
    </span>
  );
}