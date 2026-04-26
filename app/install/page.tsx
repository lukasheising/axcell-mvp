import Sidebar from "../components/Sidebar";

const installSnippet =
  '<script src="http://localhost:3000/axcell-widget.js"></script>';

export default function InstallPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Install Widget</h1>
        <p className="text-gray-400 mb-8">
          Paste this script before the closing body tag on the page where the
          chat widget should appear.
        </p>

        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-5 text-sm text-gray-100">
          <code>{installSnippet}</code>
        </pre>
      </div>
    </main>
  );
}
