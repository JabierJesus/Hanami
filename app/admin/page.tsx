import Link from "next/link";

const adminSections = [
  {
    title: "Pedidos",
    description:
      "Revisa pedidos nuevos, prepara pedidos y actualiza su estado.",
    href: "/admin/orders",
    icon: "🧾",
    action: "Ver pedidos",
  },
  {
    title: "Inventario",
    description:
      "Controla el stock de cada producto en cada local.",
    href: "/admin/inventory",
    icon: "📦",
    action: "Ver inventario",
  },
  {
    title: "Productos",
    description:
      "Administra productos, precios, categorías, imágenes y disponibilidad.",
    href: "/admin/products",
    icon: "🍡",
    action: "Ver productos",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Hanami
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
            Administración
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Gestiona los pedidos, productos e inventario de Hanami
            desde un solo lugar.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-800 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-2xl">
                  {section.icon}
                </div>

                <span className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-zinc-300">
                  →
                </span>
              </div>

              <h2 className="mt-6 text-xl font-bold text-white">
                {section.title}
              </h2>

              <p className="mt-2 min-h-[48px] text-sm leading-6 text-zinc-400">
                {section.description}
              </p>

              <p className="mt-5 text-sm font-semibold text-zinc-200">
                {section.action} →
              </p>
            </Link>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-white">
                Centro de administración
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Más herramientas para Hanami se irán agregando aquí.
              </p>
            </div>

            <span className="w-fit rounded-full border border-green-900/50 bg-green-950/50 px-3 py-1 text-xs font-semibold text-green-400">
              Sistema activo
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}