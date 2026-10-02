"use client";

import { useEffect, useState } from "react";

const promotions = [
  {
    image: "/images/promos/promo-1.jpg",
    alt: "Promoción Hanami 1",
  },
  {
    image: "/images/promos/promo-2.jpg",
    alt: "Promoción Hanami 2",
  },
  {
    image: "/images/promos/promo-3.jpg",
    alt: "Promoción Hanami 3",
  },
];

export default function PromoCarousel() {
  const [current, setCurrent] = useState(0);

  const previous = () => {
    setCurrent((current) =>
      current === 0 ? promotions.length - 1 : current - 1
    );
  };

  const next = () => {
    setCurrent((current) =>
      current === promotions.length - 1 ? 0 : current + 1
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((current) =>
        current === promotions.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const getIndex = (offset: number) => {
    return (current + offset + promotions.length) % promotions.length;
  };

  return (
    <section className="overflow-hidden px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative flex min-h-[420px] items-center justify-center sm:min-h-[540px]">

          {/* Left secondary promotion */}
          <div className="absolute left-[-25%] hidden w-[58%] max-w-2xl opacity-55 transition-all duration-500 md:block lg:left-[-12%]">
            <div className="overflow-hidden rounded-3xl shadow-lg">
              <img
                src={promotions[getIndex(-1)].image}
                alt={promotions[getIndex(-1)].alt}
                className="block aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>

          {/* Right secondary promotion */}
          <div className="absolute right-[-25%] hidden w-[58%] max-w-2xl opacity-55 transition-all duration-500 md:block lg:right-[-12%]">
            <div className="overflow-hidden rounded-3xl shadow-lg">
              <img
                src={promotions[getIndex(1)].image}
                alt={promotions[getIndex(1)].alt}
                className="block aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>

          {/* Main promotion */}
          <div className="relative z-10 w-full max-w-4xl -translate-y-3 transition-all duration-500 sm:-translate-y-6">
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              <img
                src={promotions[current].image}
                alt={promotions[current].alt}
                className="block aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>

          {/* Previous */}
          <button
            type="button"
            onClick={previous}
            aria-label="Promoción anterior"
            className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl text-[#3A211B] shadow-lg transition hover:scale-105 hover:bg-white sm:left-4 sm:h-14 sm:w-14"
          >
            ←
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente promoción"
            className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl text-[#3A211B] shadow-lg transition hover:scale-105 hover:bg-white sm:right-4 sm:h-14 sm:w-14"
          >
            →
          </button>
        </div>

        {/* Dots */}
        <div className="mt-5 flex justify-center gap-2">
          {promotions.map((promotion, index) => (
            <button
              key={promotion.image}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Ver promoción ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                current === index
                  ? "w-8 bg-[#3A211B]"
                  : "w-2.5 bg-[#3A211B]/20 hover:bg-[#3A211B]/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}