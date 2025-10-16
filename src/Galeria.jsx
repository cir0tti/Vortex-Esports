import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, MotionConfig } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

export default function Galeria() {
  const scrollContainer = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [isGrab, setIsGrab] = useState(false);

  const images = [
    { src: "/images/galeria1.jpg", title: "Torneo LATAM" },
    { src: "/images/galeria2.jpg", title: "Entrenamiento" },
    { src: "/images/galeria3.jpg", title: "Finales 2025" },
    { src: "/images/galeria4.jpg", title: "Team Meeting" },
    { src: "/images/galeria5.jpg", title: "Fan Event" },
    { src: "/images/galeria6.jpg", title: "Media Day 2" },
    { src: "/images/galeria7.jpg", title: "Media Day 3" },
  ];

  // --- GSAP animations (parallax + entrance) ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax for images
      gsap.utils.toArray(".galeria-card img").forEach((img) => {
        gsap.to(img, {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: img,
            start: "left center",
            end: "right center",
            scrub: 0.8,
            horizontal: true, // important to allow horizontal scrub in some setups
          },
        });
      });

      // Fade + scale on appear (container-triggered)
      gsap.from(".galeria-card", {
        opacity: 0,
        scale: 0.95,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scrollContainer.current,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    }, scrollContainer);

    return () => ctx.revert();
  }, []);

  // --- Pointer drag to scroll (desktop + touch) ---
  useEffect(() => {
    const el = scrollContainer.current;
    if (!el) return;

    const onPointerDown = (e) => {
      isDragging.current = true;
      setIsGrab(true);
      el.classList.add("select-none");
      startX.current = e.pageX ?? e.touches?.[0]?.pageX;
      scrollLeft.current = el.scrollLeft;
    };

    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      const x = e.pageX ?? e.touches?.[0]?.pageX;
      const dx = x - startX.current;
      el.scrollLeft = scrollLeft.current - dx;
    };

    const endDrag = () => {
      isDragging.current = false;
      setIsGrab(false);
      el.classList.remove("select-none");
    };

    // Pointer events
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);

    // Touch fallback
    el.addEventListener("touchstart", onPointerDown, { passive: true });
    el.addEventListener("touchmove", onPointerMove, { passive: true });
    el.addEventListener("touchend", endDrag);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);

      el.removeEventListener("touchstart", onPointerDown);
      el.removeEventListener("touchmove", onPointerMove);
      el.removeEventListener("touchend", endDrag);
    };
  }, []);

  // --- Tilt card on mouse move (desktop) ---
  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;

    const onMouseMove = (e) => {
      // find hovered card
      const card = e.target.closest(".galeria-card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      const rotY = (px - 0.5) * 10; // -5 .. 5
      const rotX = (0.5 - py) * 8; // -4 .. 4
      gsap.to(card, { rotateY: rotY, rotateX: rotX, scale: 1.02, transformPerspective: 800, ease: "power3.out", duration: 0.4 });
      gsap.to(card.querySelector("img"), { scale: 1.06, duration: 0.6, ease: "power3.out" });
    };

    const onMouseLeave = (e) => {
      const card = e.target.closest(".galeria-card");
      if (!card) return;
      gsap.to(card, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.6, ease: "power3.out" });
      gsap.to(card.querySelector("img"), { scale: 1, duration: 0.8, ease: "power3.out" });
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // --- Helpers: keyboard arrows for accessibility ---
  const handleKey = (e) => {
    const el = scrollContainer.current;
    if (!el) return;
    const step = el.clientWidth * 0.6;
    if (e.key === "ArrowRight") {
      el.scrollBy({ left: step, behavior: "smooth" });
    } else if (e.key === "ArrowLeft") {
      el.scrollBy({ left: -step, behavior: "smooth" });
    }
  };

  return (
    <MotionConfig transition={{ duration: 0.6, ease: "easeOut" }}>
      <section
        id="galeria"
        className="relative bg-[#05010a] text-white overflow-hidden"
        aria-label="Galería de imágenes"
      >
        {/* Sutil background gradient para profundidad */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-10 top-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-900/30 to-transparent blur-3xl" />
          <div className="absolute right-0 bottom-0 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-fuchsia-800/20 to-transparent blur-2xl" />
        </div>

        {/* Título fijo */}
        <div className="sticky top-0 pt-24 pb-6 z-20 bg-[#05010a]/80 backdrop-blur-md">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-3xl font-normal tracking-wide flex items-center gap-3">
              <span className="text-purple-400 text-3xl">{">"}</span>
              <span>Galería</span>
            </h2>
            <p className="text-gray-400 mt-1 text-sm flex items-center gap-2">
              Momentos capturados, emociones reales.
              <motion.span
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="ml-2 text-purple-400"
                aria-hidden
              >
                → desliza
              </motion.span>
            </p>
          </div>
        </div>

        {/* Contenedor scroll horizontal */}
        <div className="w-full">
          <div
            ref={scrollContainer}
            className={`
              flex gap-8 px-6 py-12
              overflow-x-auto w-max
              snap-x snap-mandatory
              touch-pan-x scroll-smooth
              md:cursor-grab ${isGrab ? "cursor-grabbing" : ""}
              scrollbar-hide
            `}
            role="list"
            tabIndex={0}
            onKeyDown={handleKey}
            aria-label="Galería horizontal. Usa flechas o desliza para navegar."
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {images.map((item, i) => (
              <article
                key={i}
                className="
                  galeria-card
                  relative flex-shrink-0
                  w-[360px] h-[460px]
                  rounded-2xl overflow-hidden
                  shadow-[0_8px_40px_rgba(122,0,255,0.14)]
                  bg-gradient-to-b from-[#0b0710] to-[#08050a]
                  group snap-center
                  sm:w-[300px] sm:h-[400px]
                  xs:w-[260px] xs:h-[340px]
                "
                role="listitem"
                aria-label={item.title}
              >
                {/* Imagen */}
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 will-change-transform"
                  draggable={false}
                />

                {/* Neon overlay + title */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* logo top-left */}
                  <img
                    src="/logosinnombre.png"
                    alt=""
                    aria-hidden
                    className="absolute w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_25px_rgba(122,0,255,0.6)]"
                    style={{ top: 8, left: 8 }}
                  />

                  {/* bottom caption */}
                  <div className="absolute left-0 right-0 bottom-0 p-4 backdrop-blur-sm/0">
                    <div className="w-full bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl px-4 py-3">
                      <h3 className="text-white font-bold text-lg tracking-wide drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-300 mt-1">Ver momento</p>
                    </div>
                  </div>

                  {/* subtle neon border */}
                  <div className="absolute inset-0 pointer-events-none rounded-2xl border border-transparent group-hover:border-purple-600/30 transition-colors duration-400" />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Paginación de puntos (indicador) */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-30">
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  // snap to card
                  const el = scrollContainer.current;
                  if (!el) return;
                  const card = el.children[idx];
                  if (!card) return;
                  const left = card.offsetLeft - (el.clientWidth - card.clientWidth) / 2;
                  el.scrollTo({ left, behavior: "smooth" });
                }}
                className="w-2 h-2 rounded-full bg-white/30 hover:bg-white/60"
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
