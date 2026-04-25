import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-zinc-900 text-white p-6 fixed left-0 top-0">
      <h1 className="text-2xl font-bold mb-10">Axcell</h1>

      <nav className="flex flex-col gap-4">
        <Link href="/" className="text-gray-300 hover:text-white">
          Dashboard
        </Link>

        <Link href="/settings" className="text-gray-300 hover:text-white">
          Company Settings
        </Link>

        <Link href="/knowledge" className="text-gray-300 hover:text-white">
          Knowledge Base
        </Link>

        <Link href="/conversations" className="text-gray-300 hover:text-white">
          Conversations
        </Link>

        <Link href="/cases" className="text-gray-300 hover:text-white">
          Cases
        </Link>
      </nav>
    </div>
  );
}
