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
          Virksomhedsindstillinger
        </Link>

        <Link href="/knowledge" className="text-gray-300 hover:text-white">
          Serviceopsætning
        </Link>

        <Link href="/new-request" className="text-gray-300 hover:text-white">
          Ny forespørgsel
        </Link>

        <Link href="/price-estimator" className="text-gray-300 hover:text-white">
          Prisberegner
        </Link>

        <Link href="/henvendelser" className="text-gray-300 hover:text-white">
          Henvendelser
        </Link>

        <Link href="/install" className="text-gray-300 hover:text-white">
          Installation
        </Link>
      </nav>
    </div>
  );
}
