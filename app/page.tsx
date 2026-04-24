import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10">
        <h1 className="text-5xl font-bold mb-4">Dashboard</h1>
        <p className="text-xl text-gray-300 mb-10">
          AI customer service overview
        </p>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Live Calls</h2>
            <p>0 active calls</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Resolved Cases</h2>
            <p>0 today</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Escalations</h2>
            <p>0 pending</p>
          </div>
        </div>
      </div>
    </main>
  );
}