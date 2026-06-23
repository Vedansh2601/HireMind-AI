export default function JobsPage() {
  const jobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "TechCorp",
      location: "Remote",
      type: "Full-time",
    },
    {
      id: 2,
      title: "Backend Engineer",
      company: "BuildStack",
      location: "Bangalore, India",
      type: "Full-time",
    },
    {
      id: 3,
      title: "AI Engineer",
      company: "HireMind AI",
      location: "Remote",
      type: "Internship",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Available Jobs
        </h1>
        <p className="text-gray-600 mt-2">
          Explore opportunities and apply with AI-powered matching.
        </p>
      </div>

      {/* JOB LIST */}
      <div className="max-w-5xl mx-auto px-6 pb-16 grid gap-5">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition"
          >
            {/* TOP SECTION */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {job.title}
                </h2>
                <p className="text-gray-600">{job.company}</p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                {job.type}
              </span>
            </div>

            {/* DETAILS */}
            <p className="text-sm text-gray-500 mt-2">
              📍 {job.location}
            </p>

            {/* ACTION */}
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}