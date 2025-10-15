// components/HighlightsShowcase.jsx
import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

/**
 * HighlightsShowcase
 * Props:
 *  - title: string
 *  - subtitle: string
 *  - items: [{ img: string, title: string, desc: string }]
 *
 * Tailwind required + framer-motion installed.
 */

export default function HighlightsShowcase({
  title = "MOMENTOS",
  subtitle = "Highlights del universo Vortex",
  items = [
    {
      img: "https://i.postimg.cc/KcBBsDpM/Valorant-Sentinels-Ten-ZDay7-VCTStage2-Masters-1024x576.jpg",
      title: "Momento Épico #1",
      desc: "Jugada destacada que cambió la partida.",
    },
    {
      img: "https://www.esports.net/wp-content/uploads/2021/05/Chronicle-Valorant.jpg",
      title: "Momento Épico #2",
      desc: "Coordinación perfecta del equipo.",
    },
    {
      img: "https://gameriv.com/wp-content/uploads/2024/03/KC-N4RRATE.jpg",
      title: "Momento Épico #3",
      desc: "Clutch final inolvidable.",
    },
  ],
}) {
  const containerRef = useRef(null);
  const controls = useAnimation();

  // Particle layer (simple, performant)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const particles = [];
    const count = Math.min(28, Math.max(12, Math.floor(window.innerWidth / 60)));

    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className =
        "particle pointer-events-none absolute rounded-full opacity-0.9 blur-sm transform-gpu";
      const size = 2 + Math.random() * 8;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `${Math.random() * 100}%`;
      el.style.background =
        Math.random() > 0.5 ? "rgba(0,191,255,0.14)" : "rgba(165,94,255,0.12)";
      el.style.animationDelay = `${Math.random() * 6}s`;
      el.style.transition = "transform 0.8s ease, opacity 0.8s ease";
      container.appendChild(el);
      particles.push(el);
    }

    // subtle floating loop
    let rafId;
    function floatLoop() {
      particles.forEach((p, i) => {
        const tx = (Math.sin((Date.now() / 1000) + i) * 6);
        const ty = (Math.cos((Date.now() / 1200) + i) * 8);
        p.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        p.style.opacity = 0.55 + Math.abs(Math.sin((Date.now() / 1000) + i)) * 0.45;
      });
      rafId = requestAnimationFrame(floatLoop);
    }
    rafId = requestAnimationFrame(floatLoop);

    // cleanup
    return () => {
      cancelAnimationFrame(rafId);
      particles.forEach((p) => p.remove());
    };
  }, []);

  // Entrance animation trigger
  useEffect(() => {
    controls.start({ opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } });
  }, [controls]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden py-20 px-5 sm:px-8 lg:px-12 text-white select-none"
      aria-labelledby="highlights-title"
    >
      {/* BACKDROP */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(800px 400px at 10% 10%, rgba(0,191,255,0.06), transparent 10%), radial-gradient(700px 350px at 90% 90%, rgba(165,94,255,0.05), transparent 12%), linear-gradient(180deg,#04040a 0%, #070716 60%)",
        }}
      />

      {/* Decorative neon rings (subtle) */}
      <div aria-hidden className="absolute -left-32 -top-24 w-[420px] h-[420px] rounded-full opacity-20 blur-3xl bg-gradient-to-tr from-cyan-400/40 to-purple-500/20 animate-rotate-slow" />
      <div aria-hidden className="absolute -right-28 -bottom-28 w-[320px] h-[320px] rounded-full opacity-18 blur-3xl bg-gradient-to-bl from-pink-400/20 to-cyan-300/18 animate-rotate-reverse-slow" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={controls}
            className="space-y-2"
          >
            <h2
              id="highlights-title"
              className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#00bfff,#9a4dff 45%, #ff6fbf)",
                textShadow: "0 8px 40px rgba(0,0,0,0.6)",
              }}
            >
              {title}
            </h2>
            <p className="text-gray-300/80 uppercase text-sm tracking-wider">{subtitle}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-3"
          >
            <a
              href="#"
              className="group inline-flex items-center gap-3 rounded-full px-4 py-2 border border-cyan-400/30 backdrop-blur-sm hover:scale-105 transform transition"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(0,191,255,0.6)]" />
              <span className="text-xs uppercase tracking-widest text-cyan-200">Ver todos</span>
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/6 hover:bg-white/8 transition text-xs"
              title="Comparte"
            >
              Compartir
            </a>
          </motion.div>
        </div>

        {/* GRID */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {items.map((it, idx) => (
            <motion.article
              key={idx}
              whileHover={{ scale: 1.02, y: -6 }}
              className="relative group rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-b from-black/60 via-black/30 to-transparent shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
              style={{ minHeight: 220 }}
            >
              {/* image */}
              <div
                className="relative w-full h-48 sm:h-56 md:h-60 overflow-hidden"
                onPointerMove={(e) => {
                  // small tilt effect (css transform on image)
                  const el = e.currentTarget.querySelector("img");
                  if (!el) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  const tx = (x - 0.5) * 8;
                  const ty = (y - 0.5) * 8;
                  el.style.transform = `scale(1.08) rotateX(${ty}deg) rotateY(${tx}deg)`;
                }}
                onPointerLeave={(e) => {
                  const el = e.currentTarget.querySelector("img");
                  if (el) el.style.transform = "scale(1) rotateX(0) rotateY(0)";
                }}
              >
                <img
                  src={it.img}
                  alt={it.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 will-change-transform"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
                {/* subtle center glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-48 h-48 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 bg-[radial-gradient(ellipse_at_center,rgba(0,191,255,0.08),transparent_40%)]" />
                </div>
              </div>

              {/* content */}
              <div className="p-5 sm:p-6 flex flex-col gap-3">
                <h3 className="text-lg sm:text-xl font-semibold leading-tight">
                  <span className="bg-clip-text text-transparent" style={{
                    backgroundImage: "linear-gradient(90deg,#9be7ff,#b28cff)"
                  }}>
                    {it.title}
                  </span>
                </h3>
                <p className="text-sm text-gray-200/85 line-clamp-3">{it.desc}</p>

                <div className="mt-3 flex items-center gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-widest border border-cyan-400/30 backdrop-blur-md hover:scale-105 transition transform shadow-[0_6px_18px_rgba(0,191,255,0.06)]"
                  >
                    Ver Clip
                  </button>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      aria-label="like"
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-white/4 hover:bg-white/6 transition"
                    >
                      ❤
                    </button>
                    <button
                      aria-label="menu"
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-white/4 hover:bg-white/6 transition"
                    >
                      ⋯
                    </button>
                  </div>
                </div>
              </div>

              {/* bottom neon line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 opacity-80 transform-gpu" />
            </motion.article>
          ))}
        </motion.div>

        {/* CTA Footer pequeño */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-gray-300/80 max-w-xl">
            ¿Quieres destacar tu clip? Subé tu video o etiqueta a Vortex y lo agregamos aquí.
          </p>

          <div className="flex items-center gap-3">
            <a className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/12 border border-white/8 text-sm hover:scale-105 transition" href="#">
              Subir clip
            </a>
            <a className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/6 text-sm hover:bg-white/8 transition" href="#">
              Ver más
            </a>
          </div>
        </motion.div>
      </div>

      {/* Small inline styles for custom animations (Tailwind + custom CSS) */}
      <style>{`
        /* rotate slow utilities */
        .animate-rotate-slow { animation: rotate-slow 24s linear infinite; transform-origin: center; }
        .animate-rotate-reverse-slow { animation: rotate-reverse-slow 28s linear infinite; transform-origin: center; }
        @keyframes rotate-slow { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        @keyframes rotate-reverse-slow { from { transform: rotate(360deg);} to { transform: rotate(0deg);} }

        /* Particle style (created in JS) */
        .particle { will-change: transform, opacity; }

        /* tiny viewport helpers */
        @media (max-width: 640px) {
          /* tighten spacing on small screens */
        }

        /* line-clamp fallback if plugin missing */
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </section>
  );
}
