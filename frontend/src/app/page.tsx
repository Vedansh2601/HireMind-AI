export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          HireMind AI
        </h1>

        <p className="text-lg text-gray-600">
          AI-powered hiring platform for companies and candidates
        </p>

        <div className="mt-8 flex justify-center gap-4">
  <button className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition">
    Post a Job
  </button>

  <button className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition">
    Apply for Jobs
  </button>
</div>
      </div>
    </main>
  );
}