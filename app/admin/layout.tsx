import Link from "next/link";
import AdminLogoutButton from "@/components/AdminLogoutButton";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: "D" },
  { name: "Pedidos", href: "/admin/orders", icon: "P" },
  { name: "POS", href: "/admin/pos", icon: "POS" },
  { name: "Inventario", href: "/admin/inventory", icon: "I" },
  { name: "Productos", href: "/admin/products", icon: "PR" },
  {
    name: "Promociones",
    href: "/admin/promotions",
    icon: "%",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/admin"
            className="shrink-0 text-xl font-bold tracking-tight text-white"
          >
            Hanami Admin
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="hidden text-sm font-medium text-zinc-400 transition hover:text-white sm:block"
            >
              Ver tienda
            </Link>

            <AdminLogoutButton />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-zinc-800 bg-zinc-950 md:block">
          <nav className="sticky top-0 p-4">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Administración
            </p>

            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-[10px] font-bold text-zinc-400">
                    {item.icon}
                  </span>

                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1 bg-zinc-950">
          {children}
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="border-t border-zinc-800 bg-zinc-950 md:hidden">
        <nav className="mx-auto flex max-w-7xl overflow-x-auto px-4 py-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-w-fit items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
            >
              <span className="flex h-6 min-w-6 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 px-1 text-[9px] font-bold text-zinc-400">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}