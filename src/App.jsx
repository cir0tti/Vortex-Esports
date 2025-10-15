import React, { useEffect, useRef, Suspense, useState } from "react";
import HighlightsShowcase from "./HighlightsShowcase";
import { motion, useAnimation, useInView } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";


gsap.registerPlugin(ScrollTrigger);

// 🌈 Estilos globales (manténlos o transpórtalos a tu CSS global)
const globalStyles = `
  :root {
    --neon-blue: #00bfff;
    --neon-purple: #7a00ff;
    --vortex-black: #05050a;
  }
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: radial-gradient(circle at 20% 20%, #060013, #0b0615 60%, #000);
    font-family: "Poppins", sans-serif;
  }
  .glow-text {
    text-shadow: 0 0 20px rgba(0,191,255,0.8), 0 0 30px rgba(122,0,255,0.5);
  }
  .glass {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(10px);
  }
  .cursor {
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    mix-blend-mode: screen;
    transform: translate(-50%, -50%);
  }
  .nav-item::after {
    content: "";
    display: block;
    height: 2px;
    background: linear-gradient(90deg, var(--neon-blue), var(--neon-purple));
    width: 0;
    transition: width 0.3s;
  }
  .nav-item:hover::after {
    width: 100%;
  }

  /* Pequeños refinamientos para galerías y cards */
  .card-hover:hover { transform: translateY(-6px); box-shadow: 0 10px 30px rgba(10,10,30,0.6); }
  .rounded-lg-smooth { border-radius: 18px; }
`;

/* ---------- 3D scene (rings + sparkles) ---------- */
function ThreeScene({ mouse }) {
  const group = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.z += 0.003;
      group.current.rotation.x = Math.sin(t * 0.2) * 0.12;
      group.current.rotation.y = (mouse.current.x - 0.5) * 0.6;
    }
  });

  return (
    <group ref={group}>
      {[...Array(12).keys()].map((i) => {
        const radius = 1.6 + i * 0.2;
        const thickness = 0.04 + i * 0.008;
        const rot = i * 0.28;
        return (
          <mesh key={i} rotation={[rot * 0.6, rot, 0]}>
            <torusGeometry args={[radius, thickness, 16, 80]} />
            <meshStandardMaterial
              transparent
              opacity={0.85 - i * 0.05}
              emissive={new THREE.Color(i % 2 === 0 ? "#7A00FF" : "#00BFFF")}
              emissiveIntensity={0.7 + i * 0.03}
              color={"#05050a"}
              metalness={0.7}
              roughness={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
      <Sparkles count={75} size={4} scale={[12, 6, 10]} />
    </group>
  );
}

/* ------------------ MAIN APP ------------------ */
export default function App() {
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const cursorRef = useRef();
  const logoRef = useRef();
  const scrollContainer = useRef();
  const [loaded, setLoaded] = useState(false);

  // inject styles, cursor, preloader timeline
useEffect(() => {
  // Estilo global inyectado
  const style = document.createElement("style");
  style.innerHTML = globalStyles;
  document.head.appendChild(style);

  // Seguimiento del mouse
  const onMove = (e) => {
    mouse.current.x = e.clientX / window.innerWidth;
    mouse.current.y = e.clientY / window.innerHeight;
    if (cursorRef.current) {
      cursorRef.current.style.left = e.clientX + "px";
      cursorRef.current.style.top = e.clientY + "px";
    }
  };
  window.addEventListener("mousemove", onMove);

  // Preloader animación con GSAP
  setLoaded(false);
  gsap.registerPlugin(ScrollTrigger);

  // Eliminamos las partículas flotantes y la estela luminosa del logo
  // Y también eliminamos el fondo pulsante

  // Creamos una animación de preloader
  const preloader = gsap.timeline({ defaults: { ease: "power3.out" } });

  preloader
    .set(".preloader", { opacity: 1, pointerEvents: "all" }) // Aseguramos que el preloader sea visible
    .fromTo(
      ".preloader-logo",
      { opacity: 0, scale: 0.6, rotateY: 25, filter: "blur(12px)" }, // Estado inicial del logo
      {
        opacity: 1,
        scale: 1.1,
        rotateY: 0,
        filter: "blur(0px)",
        duration: 2,
        ease: "expo.out", // Efecto de rebote suave
      }
    )
    .to(
      ".preloader-logo",
      {
        scale: 1.15,
        duration: 1.2,
        yoyo: true, // Efecto de rebote
        repeat: 1, // Lo repite una vez
        ease: "sine.inOut",
      },
      "-=1"
    )
    .to(".preloader", {
      opacity: 0, // Fondo del preloader se desvanece
      duration: 1.5,
      ease: "power2.inOut",
    })
    // Aparece el contenido principal
    .to(
      ".main-content",
      {
        opacity: 1,
        duration: 1.6,
        ease: "power2.out",
        onStart: () => setLoaded(true),
      },
      "-=0.8"
    );

  // Animación para el contenido principal después del preloader
  gsap.from(".main-content", {
    opacity: 0,
    y: 50, // Mueve el contenido desde abajo
    duration: 1.2,
    ease: "power2.out",
  });

  // Limpiamos el estilo global y el evento
  return () => {
    window.removeEventListener("mousemove", onMove); // Limpiamos el event listener
    if (style.parentNode) style.parentNode.removeChild(style); // Eliminamos los estilos inyectados
  };
}, []);



  // smooth scroll + reveal after load
useEffect(() => {
  if (!loaded) return;

  const lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1.3,
  });

  function raf(time) {
    lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Configura GSAP con Lenis
  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value);
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
  });

  ScrollTrigger.addEventListener("refresh", () => ScrollTrigger.update());
  ScrollTrigger.refresh();

  return () => {
    lenis.destroy();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
}, [loaded]);



  useEffect(() => {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = "/favicon.png"; // ubicado en public/logo.png
    document.head.appendChild(favicon);

    return () => {
      document.head.removeChild(favicon);
    };
  }, []);

  // tiny logo rotation
  useEffect(() => {
    if (logoRef.current) {
      gsap.to(logoRef.current, { rotation: 360, duration: 30, repeat: -1, ease: "none" });
    }
  }, []);

// 🎠 Scroll horizontal (desktop) + swipe táctil (mobile mejorado)
useEffect(() => {
  if (!loaded) return;
  const container = scrollContainer.current;
  if (!container) return;

  gsap.registerPlugin(ScrollTrigger);
  let mm = gsap.matchMedia();

  // 💻 DESKTOP → scroll horizontal con pin suave
  mm.add("(min-width: 1024px)", () => {
    const totalScroll = container.scrollWidth - window.innerWidth;

    gsap.to(container, {
      x: -totalScroll,
      ease: "none",
      scrollTrigger: {
        trigger: "#galeria",
        start: "top top",
        end: `+=${totalScroll}`,
        scrub: 2,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  });

  // 📱 MOBILE → scroll táctil horizontal real
  mm.add("(max-width: 1023px)", () => {
    // 💧 Limpieza completa de estilos GSAP
    gsap.set(container, { clearProps: "all" });
    ScrollTrigger.getAll().forEach((t) => t.kill());

    // 🧭 Configuración del scroll horizontal real
    container.style.overflowX = "auto";
    container.style.overflowY = "hidden";
    container.style.scrollBehavior = "smooth";
    container.style.scrollSnapType = "x mandatory";
    container.style.webkitOverflowScrolling = "touch";

    // 💫 Scroll con arrastre suave (inercia)
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    let velocity = 0;
    let momentumID;

    const stopMomentum = () => cancelAnimationFrame(momentumID);

    const startMomentum = () => {
      const step = () => {
        container.scrollLeft += velocity;
        velocity *= 0.95; // desaceleración progresiva
        if (Math.abs(velocity) > 0.3) momentumID = requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const onTouchStart = (e) => {
      isDragging = true;
      stopMomentum();
      startX = e.touches[0].pageX;
      scrollLeft = container.scrollLeft;
    };

    const onTouchMove = (e) => {
      if (!isDragging) return;
      const x = e.touches[0].pageX;
      const walk = (startX - x);
      container.scrollLeft = scrollLeft + walk;
      velocity = walk - velocity * 0.2;
    };

    const onTouchEnd = () => {
      isDragging = false;
      startMomentum();
    };

    container.addEventListener("touchstart", onTouchStart);
    container.addEventListener("touchmove", onTouchMove);
    container.addEventListener("touchend", onTouchEnd);

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    };
  });

  return () => mm.revert();
}, [loaded]);


  return (
    <div className="min-h-screen text-white overflow-x-hidden relative">
      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="cursor w-[30px] h-[30px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,191,255,0.7), rgba(122,0,255,0.25) 60%, transparent)",
          zIndex: 9999,
        }}
      />

      {/* Preloader (mantén como lo tenías) */}
      {!loaded && (
        <div className="preloader fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-black via-[#0a0013] to-[#05050a] text-center">
          <img
            src="/logo.png"
            alt="logo"
            className="preloader-logo w-56 h-56 mb-8 drop-shadow-[0_0_25px_rgba(122,0,255,0.8)]"
          />
          <h2 className="preloader-text text-3xl md:text-4xl font-extrabold glow-text tracking-[0.3em] text-white">

          </h2>
        </div>
      )}

      
{/* ✅ HEADER CENTRADO Y COMPACTO */}
{loaded && (
  <header className="fixed top-0 left-0 w-full z-50 bg-[#0b0615]/70 backdrop-blur-lg border-b border-white/10">
    <div className="max-w-6xl mx-auto flex items-center justify-center px-6 py-3 gap-12">
      
      {/* 🔹 Left menu */}
      <ul className="hidden md:flex items-center gap-8 text-sm uppercase font-semibold tracking-wide">
        {["Esports", "Noticias", ""].map((item) => (
          <li
            key={item}
            className="nav-item cursor-pointer hover:text-cyan-300 transition"
          >
            {item}
          </li>
        ))}
      </ul>

      {/* 🌀 Logo grande al centro */}
      <div className="flex items-center justify-center">
        <img
          src="/logohear.png"
          alt="logo"
          className="w-28 h-28 object-contain drop-shadow-[0_0_25px_rgba(122,0,255,0.6)]"
        />
      </div>

      {/* 🔹 Right menu */}
      <ul className="hidden md:flex items-center gap-8 text-sm uppercase font-semibold tracking-wide">
        {["Club", "Studios", "Tienda"].map((item) => (
          <li
            key={item}
            className="nav-item cursor-pointer hover:text-cyan-300 transition"
          >
            {item}
          </li>
        ))}
      </ul>

      {/* 🍔 Hamburguesa solo en móviles */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-gray-300 cursor-pointer hover:text-cyan-300 transition md:hidden absolute right-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </div>
  </header>
)}



{/* 🌌 HERO VORTEX BEYOND - Ultra Visual */}
<header className="relative flex flex-col items-center justify-center overflow-hidden text-white pt-40 md:pt-48 pb-32 mt-10 select-none">

  {/* ✨ Capa base - Gradientes dinámicos + movimiento parallax */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#040406] via-[#070A13] to-[#0B0016]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,255,0.1),transparent_70%),radial-gradient(circle_at_70%_80%,rgba(255,0,255,0.1),transparent_70%)] blur-3xl animate-pulse-slow"></div>
  </div>

  {/* 🌀 Círculo de energía central */}
  <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,rgba(0,255,255,0.1),rgba(122,0,255,0.15),rgba(0,255,255,0.1))] animate-spin-slower blur-3xl opacity-60"></div>

  {/* ✨ Partículas dinámicas con movimiento aleatorio */}
  <div className="absolute inset-0 pointer-events-none">
    {[...Array(25)].map((_, i) => (
      <span
        key={i}
        className="absolute block w-[3px] h-[3px] bg-cyan-300 rounded-full animate-star"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
          animationDuration: `${4 + Math.random() * 4}s`,
          opacity: Math.random(),
        }}
      />
    ))}
  </div>

  {/* ⚡ Halo energético que sigue al mouse */}
  <div id="vortex-halo" className="pointer-events-none absolute inset-0"></div>

  {/* 🌠 Contenido principal */}
  <div className="relative z-10 max-w-7xl w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

    {/* 🧩 Lado izquierdo: texto + acciones */}
    <div className="text-left space-y-8">
      <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 shadow-lg hover:shadow-cyan-500/20 transition">
        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
        <span className="text-sm uppercase tracking-[0.2em] text-gray-300">Official</span>
        <h2 className="font-bold text-cyan-300 tracking-wide">VORTEX ESPORTS</h2>
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 bg-[length:300%_300%] animate-gradient-text drop-shadow-[0_0_40px_rgba(0,191,255,0.45)]">
          El Núcleo del
        </span>
        <span className="block text-white animate-fade-up">Gaming Competitivo</span>
      </h1>

<p className="text-gray-300 max-w-md md:max-w-lg leading-relaxed text-lg animate-fade-in-slow">
  Donde la precisión se encuentra con la estrategia.  
  <span className="text-cyan-400 font-semibold">Vortex</span> redefine el juego competitivo en <span className="text-pink-400 font-semibold">VALORANT</span> con tecnología, reflejos y visión de futuro.  
  Esto no es solo un equipo — es una fuerza digital imparable.
</p>

      <div className="flex flex-wrap gap-5 pt-4">
        <button className="relative px-8 py-3 rounded-full border border-cyan-400 text-cyan-300 font-semibold overflow-hidden group transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(0,191,255,0.3)]">
          <span className="absolute inset-0 bg-cyan-400/20 translate-y-full group-hover:translate-y-0 transition-all duration-500"></span>
          <span className="relative z-10">VER MÁS</span>
        </button>

        <button className="relative px-8 py-3 rounded-full bg-gradient-to-r from-[#7A00FF] via-[#5700E0] to-[#00BFFF] text-white font-semibold shadow-[0_0_30px_rgba(122,0,255,0.5)] hover:brightness-125 hover:scale-110 active:scale-95 transition-all duration-300">
          <span className="relative z-10">UNIRSE AL CLUB</span>
        </button>
      </div>

      {/* 🧠 Stats cards con glow dinámico */}
      <div className="mt-12 flex flex-wrap gap-6 text-sm text-gray-300">
        {[
          { tag: "TSM", title: "Próximo Match", desc: "VS RED RAZE — 12:00 UTC", glow: "from-cyan-400" },
          { tag: "PR", title: "Última Victoria", desc: "Vortex Invitational", glow: "from-purple-400" },
        ].map((card, i) => (
          <div
            key={i}
            className={`relative group rounded-2xl p-5 flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 hover:scale-105 hover:shadow-[0_0_25px_rgba(0,191,255,0.3)] transition-all duration-300`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-gradient-to-br ${card.glow} to-transparent text-white group-hover:rotate-[360deg] transition-transform duration-700`}>
              {card.tag}
            </div>
            <div>
              <div className="font-semibold">{card.title}</div>
              <div className="text-xs text-gray-400">{card.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* 💫 Imagen lateral animada con reflejo */}
    <div className="relative flex justify-center group">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,191,255,0.3)] transition-transform duration-700 group-hover:scale-[1.05] group-hover:rotate-[1deg]">
        <img
          src="https://i.postimg.cc/qqtcdyR0/Airbrush-BG-CHANGER-1760213274746.png"
          alt="Vortex Character"
          className="w-[420px] h-[560px] object-cover transition-transform duration-[2000ms] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,191,255,0.2),transparent_70%)] blur-2xl animate-pulse-slow"></div>
      </div>
      <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-[radial-gradient(circle,rgba(122,0,255,0.25),transparent_70%)] blur-3xl animate-pulse-slow"></div>
    </div>

  </div>
</header>



<HighlightsShowcase />


{/* SECTION: GALERÍA */}
<section id="galeria" className="relative bg-[#05010a] text-white overflow-hidden py-12">
  <div className="w-full relative">
    {/* Título */}
    <div className="text-center mb-8 px-6">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-wide text-white flex justify-center items-center gap-2">
        <span className="text-purple-500 text-3xl">{'>'}</span> Galería
      </h2>
      <p className="text-gray-400 mt-2 text-sm sm:text-base">
        Momentos capturados, emociones reales. Desliza para ver más →
      </p>
    </div>

    {/* Scroll container */}
    <div
      ref={scrollContainer}
      className="flex gap-8 px-6 sm:px-10 pb-8 overflow-x-auto overflow-y-hidden
                 snap-x snap-mandatory scrollbar-hide scroll-smooth
                 touch-pan-x cursor-grab active:cursor-grabbing
                 w-full"
      style={{
        WebkitOverflowScrolling: "touch",
        overscrollBehaviorX: "contain",
        overscrollBehaviorY: "none",
        touchAction: "pan-x",
      }}
    >
      {[
        { src: "/images/galeria1.jpg", title: "Torneo LATAM" },
        { src: "/images/galeria2.jpg", title: "Entrenamiento" },
        { src: "/images/galeria3.jpg", title: "Finales 2025" },
        { src: "/images/galeria4.jpg", title: "Team Meeting" },
        { src: "/images/galeria5.jpg", title: "Fan Event" },
        { src: "/images/galeria6.jpg", title: "Media Day2" },
        { src: "/images/galeria7.jpg", title: "Media Day3" },
      ].map((item, index) => (
        <div
          key={index}
          className="relative flex-shrink-0 w-[280px] sm:w-[340px] md:w-[400px] lg:w-[460px]
                     h-[360px] sm:h-[420px] md:h-[460px]
                     rounded-2xl overflow-hidden glass card-hover
                     shadow-[0_0_40px_#7a00ff50] group snap-center
                     transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_0_70px_#7a00ff80]"
        >
          {/* Imagen */}
          <img
            src={item.src}
            alt={item.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/placeholder.jpg";
            }}
            className="w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110"
          />

          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end items-center
                          bg-gradient-to-t from-[#05010a]/80 to-transparent
                          opacity-0 group-hover:opacity-100 transition-all duration-500
                          pointer-events-none">
            <img
              src="/logosinnombre.png"
              alt="Logo"
              className="absolute top-3 left-3 w-16 sm:w-20 md:w-24 drop-shadow-[0_0_25px_rgba(122,0,255,0.6)] pointer-events-auto"
            />
            <h3 className="mb-6 text-white font-bold text-lg sm:text-xl tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none">
              {item.title}
            </h3>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


{/* 🌌 SECTION: NOTICIAS */}
<section className="reveal container mx-auto px-6 py-20">
  {/* 🔹 Título principal */}
  <div className="max-w-7xl mx-auto mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
      <h2 className="text-4xl md:text-5xl font-semibold tracking-wide text-white flex items-center gap-3">
        <span className="text-purple-500 text-3xl">{'>'}</span> Noticias
      </h2>
      <p className="text-gray-400 mt-2 text-sm md:text-base">
        Las últimas novedades del equipo <span className="text-purple-400 font-semibold">Vortex Esports</span>.
      </p>
    </div>
    <a className="glass text-sm uppercase text-gray-300 px-5 py-2 rounded-full hover:scale-105 hover:text-white transition-all duration-300">
      Todas las noticias
    </a>
  </div>

  {/* 📰 Grid de Cards */}
  <div className="max-w-7xl mx-auto grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10">
    {[
      {
        id: 1,
        title: "Vortex domina el torneo nacional de VALORANT 🏆",
        desc: "Una actuación impecable lleva a Vortex a la cima, consolidándose como uno de los mejores equipos del país.",
        date: "Oct 10, 2025",
        image: "https://admin.esports.gg/wp-content/uploads/2024/01/Patch_Notes_Highlights_8_0-1.jpg",
      },
      {
        id: 2,
        title: "Nuevo fichaje refuerza el roster principal 💥",
        desc: "Con reflejos de acero y precisión quirúrgica, el nuevo Duelista promete revolucionar el meta del equipo.",
        date: "Oct 07, 2025",
        image: "https://cdn.images.express.co.uk/img/dynamic/143/1200x712/4898567.jpg",
      },
      {
        id: 3,
        title: "Entrenamientos de alto rendimiento en Chile 🇨🇱",
        desc: "El equipo viaja al sur para un bootcamp intensivo con los mejores coaches de la escena profesional.",
        date: "Oct 03, 2025",
        image: "https://news.codashop.com/ph/wp-content/uploads/sites/5/2023/08/Champions-2023-Bundle.jpg",
      },
    ].map((news) => (
      <div
        key={news.id}
        className="group glass rounded-2xl overflow-hidden border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
      >
        {/* 🖼 Imagen principal */}
        <div className="relative overflow-hidden">
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-64 object-cover transition-transform duration-[1500ms] group-hover:scale-110 brightness-[0.9]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
        </div>

        {/* 📄 Contenido */}
        <div className="p-6 flex flex-col gap-3">
          <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 group-hover:scale-[1.03] transition-transform duration-300">
            {news.title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">{news.desc}</p>
        </div>

        {/* 📅 Footer */}
        <div className="px-6 pb-5 mt-auto flex items-center justify-between text-sm text-gray-400 border-t border-white/10 pt-4">
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10m-11 6h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {news.date}
          </span>
          <a className="glass px-4 py-2 rounded-full text-xs text-gray-200 hover:bg-purple-500/20 hover:text-white transition-all duration-300">
            Leer
          </a>
        </div>
      </div>
    ))}
  </div>
</section>


      {/* Footer */}
      <footer className="py-10 bg-gradient-to-t from-black via-[#120018]/20 to-transparent">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <div className="mb-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div>© {new Date().getFullYear()} VORTEX ESPORTS • All Rights Reserved</div>
              <div className="flex items-center gap-4">
                <img src="/logo.png" alt="logo" className="w-12 h-12 object-contain" />
                <div className="flex gap-3">
                  {["D","T","X"].map(i => (
                    <a key={i} className="glass w-10 h-10 rounded-full flex items-center justify-center">{i}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">Sponsors: Logitech • HTC • Twitch • GEICO • HyperX</div>
        </div>
      </footer>
      </div>
  );
}
