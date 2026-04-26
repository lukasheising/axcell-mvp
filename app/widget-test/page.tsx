import Sidebar from "../components/Sidebar";
import ChatWidget from "../components/ChatWidget";

export default function WidgetTestPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10">
        <h1 className="text-4xl font-bold mb-4">Widget Test</h1>
        <p className="text-gray-400 mb-8">
          Test the first customer-facing chat flow.
        </p>

        <ChatWidget />
      </div>
    </main>
  );
}
