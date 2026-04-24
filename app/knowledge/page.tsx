import Sidebar from "../components/Sidebar";

export default function KnowledgePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10 max-w-5xl">
        <h1 className="text-4xl font-bold mb-4">Knowledge Base</h1>
        <p className="text-gray-400 mb-8">
          Information the AI should use when answering customers.
        </p>

        <div className="space-y-6">
          <textarea className="w-full bg-zinc-900 p-4 rounded-xl h-32" placeholder="Shipping policy" />
          <textarea className="w-full bg-zinc-900 p-4 rounded-xl h-32" placeholder="Return policy" />
          <textarea className="w-full bg-zinc-900 p-4 rounded-xl h-32" placeholder="Refund policy" />
          <textarea className="w-full bg-zinc-900 p-4 rounded-xl h-32" placeholder="Product FAQ" />
          <textarea className="w-full bg-zinc-900 p-4 rounded-xl h-32" placeholder="General FAQ" />

          <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold">
            Save knowledge base
          </button>
        </div>
      </div>
    </main>
  );
}