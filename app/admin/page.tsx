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
    href: "/admin/invengory",
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
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Hanami
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
            Administración
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Gestiona los pedidos, productos e inventario de Hanami
            desde un solo lugar.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                  {section.icon}
                </div>

                <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-700">
                  →
                </span>
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-900">
                {section.title}
              </h2>

              <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-600">
                {section.description}
              </p>

              <p className="mt-5 text-sm font-semibold text-gray-900">
                {section.action} →
              </p>
            </Link>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Centro de administración
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Más herramientas para Hanami se irán agregando aquí.
              </p>
            </div>

            <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Sistema activo
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}