// app/jobdetail/[jobId]/page.jsx (Server Component)

import { notFound } from "next/navigation";
import JobDetailClient from "./JobDetailClient";

async function getJobData(jobId) {
  const apiUrl = `http://localhost:8000/api/v1/developer/jobs/jobdetail/${jobId}`;
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 404) return { notFound: true };
      const errorBody = await res.text();
      console.error(`Job Fetch Error ${res.status}:`, errorBody);
      return { error: `Failed to load job data (${res.status})` };
    }
    const result = await res.json();
    return { job: result.data || null };
  } catch (error) {
    console.error("Error fetching job:", error);
    return { error: "An error occurred while fetching job data." };
  }
}

const Page = async ({ params }) => {
  const jobId = params.jobId;
  if (!jobId) notFound();

  const jobResult = await getJobData(jobId);
  if (jobResult.notFound) notFound();

  if (jobResult.error || !jobResult.job) {
    return (
      <div className="container mx-auto p-10 text-center text-red-500">
        Error: {jobResult.error || "Job details could not be loaded."}
      </div>
    );
  }

  return <JobDetailClient job={jobResult.job} />;
};

export default Page;
