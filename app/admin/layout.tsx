import Link from "next/link";
import AdminLogoutButton from "@/components/AdminLogoutButton";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: "D",
  },
  {
    name: "Pedidos",
    href: "/admin/orders",
    icon: "P",
  },
  {
    name: "POS",
    href: "/admin/pos",
    icon: "POS",
  },
  {
    name: "Inventario",
    href: "/admin/inventory",
    icon: "I",
  },
  {
    name: "Productos",
    href: "/admin/products",
    icon: "PR",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/admin"
            className="shrink-0 text-xl font-bold tracking-tight text-gray-900"
          >
            Hanami Admin
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 sm:block"
            >
              Ver tienda
            </Link>

            <AdminLogoutButton />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white md:block">
          <nav className="sticky top-0 p-4">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Administracion
            </p>

            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500">
                    {item.icon}
                  </span>

                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          {children}
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white md:hidden">
        <nav className="mx-auto flex max-w-7xl overflow-x-auto px-4 py-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-w-fit items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-gray-100 px-1 text-[9px] font-bold text-gray-500">
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