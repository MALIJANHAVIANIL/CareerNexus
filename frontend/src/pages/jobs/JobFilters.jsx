import React from "react";
import { Search } from "lucide-react";

export default function JobFilters({
  search,
  setSearch,
  selectedCompany,
  setSelectedCompany,
  selectedLocation,
  setSelectedLocation,
  selectedPackageRange,
  setSelectedPackageRange,
  jobs,
}) {

  const companies = [...new Set(jobs.map(job => job.company))];
  const locations = [...new Set(jobs.map(job => job.location))];

  return (

    <div className="bg-white rounded-xl border p-5 mb-6">

      <div className="grid md:grid-cols-4 gap-4">

        {/* Search */}

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-red-700 outline-none"
          />

        </div>

        {/* Company */}

        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >

          <option value="">
            All Companies
          </option>

          {companies.map(company => (

            <option
              key={company}
              value={company}
            >
              {company}
            </option>

          ))}

        </select>

        {/* Location */}

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >

          <option value="">
            All Locations
          </option>

          {locations.map(location => (

            <option
              key={location}
              value={location}
            >
              {location}
            </option>

          ))}

        </select>

        {/* Package */}

        <select
          value={selectedPackageRange}
          onChange={(e) => setSelectedPackageRange(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >

          <option value="">
            All Packages
          </option>

          <option value="5">
            Above 5 LPA
          </option>

          <option value="10">
            Above 10 LPA
          </option>

          <option value="20">
            Above 20 LPA
          </option>

          <option value="30">
            Above 30 LPA
          </option>

        </select>

      </div>

    </div>

  );

}