import React, { useState } from "react";
import Button from "../../components/common/Button";
import Card, { CardBody } from "../../components/common/Card";

export default function ApplyJobModal({
  open,
  job,
  onClose,
  onSubmit,
}) {
  const [coverLetter, setCoverLetter] = useState("");

  if (!open || !job) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!coverLetter.trim()) {
      alert("Please enter a cover letter.");
      return;
    }

    onSubmit({
      jobId: job.id,
      coverLetter,
    });

    setCoverLetter("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <Card className="w-full max-w-2xl">

        <CardBody className="p-6">

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-2xl font-bold">
              Apply for {job.title}
            </h2>

            <button
              onClick={onClose}
              className="text-2xl"
            >
              ×
            </button>

          </div>

          <form onSubmit={handleSubmit}>
                        <div className="mb-6">

              <label className="block font-semibold mb-2">
                Cover Letter
              </label>

              <textarea
                rows={8}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write your cover letter here..."
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-700 outline-none resize-none"
              />

            </div>

            <div className="flex justify-end gap-3">

              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button
                type="submit"
              >
                Submit Application
              </Button>

            </div>

          </form>

        </CardBody>

      </Card>

    </div>
  );
}