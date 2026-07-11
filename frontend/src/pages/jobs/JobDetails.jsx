import React from "react";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
  Bookmark,
  CheckCircle
} from "lucide-react";

import Button from "../../components/common/Button";
import Card, { CardBody } from "../../components/common/Card";

export default function JobDetails({
  job,
  savedJobs,
  onSave,
  onApply
}) {

  if (!job) {
    return (
      <Card>
        <CardBody className="p-10 text-center">

          <Building2
            className="mx-auto mb-5 text-gray-400"
            size={60}
          />

          <h2 className="text-2xl font-bold">
            Select a Job
          </h2>

          <p className="text-gray-500 mt-2">
            Click any job from the left side to view details.
          </p>

        </CardBody>
      </Card>
    );
  }

  const saved = savedJobs.includes(job.id);
    return (
    <Card>

      <CardBody className="p-6">

        <div className="flex justify-between items-start">

          <div>

            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold ${job.logoBg}`}
            >
              {job.logo}
            </div>

            <h2 className="text-3xl font-bold mt-5">
              {job.title}
            </h2>

            <h3 className="text-xl text-gray-600 mt-1">
  {job.companyName}
</h3>

          </div>

          <Button
            variant={saved ? "secondary" : "outline"}
            onClick={() => onSave(job.id)}
          >
            <Bookmark
              className="mr-2"
              size={18}
            />

            {saved ? "Saved" : "Save"}
          </Button>

        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-8">

          <div className="flex items-center gap-2">
            <MapPin size={18} />
            {job.location}
          </div>

         <div className="flex items-center gap-2">
  <Briefcase size={18} />
  {job.jobType}
</div>

          <div className="flex items-center gap-2">
  <DollarSign size={18} />
  {job.salaryRange}
</div>

          <div className="flex items-center gap-2">
  <Calendar size={18} />
  {job.createdAt
    ? new Date(job.createdAt).toLocaleDateString()
    : "-"}
</div>

        </div>

        <div className="mt-8">

          <h3 className="text-xl font-semibold mb-3">
            Job Description
          </h3>

          <p className="text-gray-600 leading-7">
            {job.description}
          </p>

        </div>

        <div className="mt-8">

          <h3 className="text-xl font-semibold mb-3">
            Requirements
          </h3>

          <ul className="space-y-3">

            {job.requirements?.map((item, index) => (

              <li
                key={index}
                className="flex items-start gap-2"
              >
                <CheckCircle
                  size={18}
                  className="text-green-600 mt-1"
                />

                <span>{item}</span>

              </li>

            ))}

          </ul>

        </div>
                <div className="mt-8">

          <h3 className="text-xl font-semibold mb-3">
            Benefits
          </h3>

          <ul className="space-y-3">

            {job.benefits?.map((item, index) => (

              <li
                key={index}
                className="flex items-start gap-2"
              >
                <CheckCircle
                  size={18}
                  className="text-green-600 mt-1"
                />

                <span>{item}</span>

              </li>

            ))}

          </ul>

        </div>

        <div className="mt-10 border-t pt-6 flex justify-end">

          <Button
            size="lg"
            onClick={() => onApply(job)}
          >
            Apply Now
          </Button>

        </div>

      </CardBody>

    </Card>
  );
}