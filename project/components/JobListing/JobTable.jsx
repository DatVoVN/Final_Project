import React, { useState } from "react";
import JobTableRow from "./JobTableRow";
import ApplicantModal from "../Action/ApplicantModal";
import EditJobFormModal from "../Action/EditJobFormModal";
import JobDetailModal from "../Action/JobDetailModal";

const JobTable = ({ jobData, getStatus }) => {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [viewingJobId, setViewingJobId] = useState(null);

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tên tin đăng
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hạn nộp
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Số lượng Ứng tuyển
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobData.map((job) => (
              <JobTableRow
                key={job._id}
                job={job}
                getStatus={getStatus}
                onViewApplicants={(jobId) => setSelectedJobId(jobId)}
                setEditingJob={setEditingJob}
                onViewDetail={(jobId) => setViewingJobId(jobId)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {selectedJobId && (
        <div className="fixed inset-0 z-50 bg-opacity-10">
          <ApplicantModal
            jobId={selectedJobId}
            onClose={() => setSelectedJobId(null)}
          />
        </div>
      )}
      {viewingJobId && (
        <JobDetailModal
          jobId={viewingJobId}
          onClose={() => setViewingJobId(null)}
        />
      )}

      {editingJob && (
        <EditJobFormModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onUpdated={() => {
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
};

export default JobTable;
