import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10">
        <h1 className="text-5xl font-bold mb-4">Dashboard</h1>
        <p className="text-xl text-gray-300 mb-10">
          AI receptionist overview for window cleaning companies
        </p>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">
              Missed Calls Captured
            </h2>
            <p>0 today</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">New Leads</h2>
            <p>0 today</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Booking Requests</h2>
            <p>0 today</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Urgent Cases</h2>
            <p>0 pending</p>
          </div>
        </div>
      </div>
    </main>
  );
}
