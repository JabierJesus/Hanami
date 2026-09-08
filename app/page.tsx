export default function Home() {
  return (
    <main className="flex-1">
      <section className="flex min-h-[75vh] items-center justify-center px-6 text-center">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em]">
            HANAMI
          </p>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Mochis, taiyakis,
            <br />
            onigiris y mucho más.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600">
            Descubre nuestros sabores favoritos y haz tu pedido online.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/pedido"
              className="rounded-full bg-black px-8 py-3 font-medium text-white transition hover:opacity-80"
            >
              Pedir online
            </a>

            <a
              href="/menu"
              className="rounded-full border border-black px-8 py-3 font-medium transition hover:bg-black hover:text-white"
            >
              Ver menú
            </a>
          </div>
        </div>
      </section>

      <section className="border-y bg-gray-50 px-6 py-12 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em]">
          Promo de la semana
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          🍡 3 Mochis por $8.000
        </h2>

        <p className="mt-2 text-gray-600">
          Elige tus sabores favoritos.
        </p>
      </section>
    </main>
  );
}