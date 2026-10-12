"use client";

import { FormEvent, useState } from "react";

const requestTypes = [
  {
    value: "marketing_unsubscribe",
    label: "Retirar mi consentimiento para marketing",
  },
  {
    value: "access",
    label: "Solicitar acceso a mis datos",
  },
  {
    value: "rectification",
    label: "Solicitar corrección de mis datos",
  },
  {
    value: "deletion",
    label: "Solicitar eliminación de mis datos",
  },
  {
    value: "objection",
    label: "Oponerme a un tratamiento de mis datos",
  },
  {
    value: "portability",
    label: "Solicitar portabilidad de mis datos",
  },
];

export default function PrivacyPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requestType, setRequestType] = useState(
    "marketing_unsubscribe"
  );
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const response = await fetch(
        "/api/privacy/requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            requestType,
            message,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "No se pudo enviar la solicitud."
        );
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setRequestType(
        "marketing_unsubscribe"
      );
      setMessage("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar la solicitud."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="mb-10">
          <a
            href="/"
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            ← Volver a Hanami
          </a>

          <h1 className="mt-6 text-4xl font-bold tracking-tight">
            Privacidad y datos personales
          </h1>

          <p className="mt-4 text-lg leading-8 text-neutral-600">
            En Hanami nos importa que tengas claridad
            sobre qué información recopilamos, para qué
            la utilizamos y cómo puedes ejercer tus
            derechos.
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold">
              ¿Qué datos podemos recopilar?
            </h2>

            <p className="mt-3 leading-7 text-neutral-700">
              Cuando realizas un pedido podemos solicitar
              información como tu nombre, teléfono,
              correo electrónico, información relacionada
              con tu pedido y el local donde realizaste
              la compra.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              ¿Para qué utilizamos tus datos?
            </h2>

            <p className="mt-3 leading-7 text-neutral-700">
              Utilizamos la información necesaria para
              gestionar tus pedidos, comunicarnos contigo
              respecto de una compra y mantener registros
              asociados a nuestros servicios.
            </p>

            <p className="mt-3 leading-7 text-neutral-700">
              Si otorgas tu consentimiento para
              comunicaciones de marketing, también
              podremos utilizar tu correo electrónico para
              enviarte promociones, novedades y beneficios
              de Hanami.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              Marketing y consentimiento
            </h2>

            <p className="mt-3 leading-7 text-neutral-700">
              El consentimiento para recibir comunicaciones
              comerciales es independiente de la posibilidad
              de realizar compras en Hanami.
            </p>

            <p className="mt-3 leading-7 text-neutral-700">
              Puedes retirar tu consentimiento en cualquier
              momento. Para hacerlo, selecciona la opción
              correspondiente en el formulario de esta página.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              Tus derechos
            </h2>

            <p className="mt-3 leading-7 text-neutral-700">
              Puedes solicitar, según corresponda, acceso,
              corrección, eliminación, oposición o
              portabilidad de tus datos personales, además
              de retirar tu consentimiento para comunicaciones
              de marketing.
            </p>

            <p className="mt-3 leading-7 text-neutral-700">
              Las solicitudes serán revisadas y procesadas
              de acuerdo con la normativa aplicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              Solicitud sobre tus datos
            </h2>

            <p className="mt-3 leading-7 text-neutral-700">
              Completa el siguiente formulario. La
              información será utilizada para identificar
              y gestionar tu solicitud.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-7"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Nombre
                </label>

                <input
                  id="name"
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Correo electrónico
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium"
                >
                  Teléfono
                </label>

                <input
                  id="phone"
                  type="tel"
                  maxLength={30}
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div>
                <label
                  htmlFor="requestType"
                  className="mb-2 block text-sm font-medium"
                >
                  ¿Qué necesitas?
                </label>

                <select
                  id="requestType"
                  required
                  value={requestType}
                  onChange={(event) =>
                    setRequestType(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
                >
                  {requestTypes.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium"
                >
                  Detalles adicionales
                </label>

                <textarea
                  id="message"
                  maxLength={3000}
                  rows={5}
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  className="w-full resize-y rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
                  placeholder="Cuéntanos brevemente qué necesitas."
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  Tu solicitud fue recibida correctamente.
                  La revisaremos y te contactaremos cuando
                  corresponda.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Enviando..."
                  : "Enviar solicitud"}
              </button>
            </form>
          </section>

          <section className="border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-semibold">
              Contacto
            </h2>

            <p className="mt-3 leading-7 text-neutral-700">
              Si necesitas comunicarte con Hanami por
              asuntos relacionados con privacidad o datos
              personales, puedes utilizar este formulario
              para dejar registrada tu solicitud.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}