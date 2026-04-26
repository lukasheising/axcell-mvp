import Script from "next/script";

const products = [
  "Nordic Rain Jacket",
  "Everyday Tote",
  "Merino Travel Scarf",
];

export default function EmbedDemoPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <header className="border-b border-zinc-200 px-8 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-2xl font-bold">Demo Webshop</h1>
          <nav className="flex gap-6 text-sm text-zinc-600">
            <span>Shop</span>
            <span>Shipping</span>
            <span>Returns</span>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-8 py-14">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          External storefront preview
        </p>
        <h2 className="mb-4 max-w-2xl text-5xl font-bold">
          A simple webshop page with the Axcell widget installed.
        </h2>
        <p className="max-w-2xl text-lg text-zinc-600">
          This page runs inside Next.js so local cookies work while still
          simulating a customer-facing storefront.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-8 pb-16">
        {products.map((product) => (
          <article
            key={product}
            className="rounded-xl border border-zinc-200 p-6"
          >
            <div className="mb-5 h-40 rounded-lg bg-zinc-100" />
            <h3 className="mb-2 text-lg font-semibold">{product}</h3>
            <p className="mb-5 text-sm text-zinc-600">
              Minimal demo product content for testing customer questions.
            </p>
            <button className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">
              Add to cart
            </button>
          </article>
        ))}
      </section>

      <Script src="/axcell-widget.js" strategy="afterInteractive" />
    </main>
  );
}
