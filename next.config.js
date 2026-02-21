@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --radius: 18px;
}

html {
  scroll-behavior: smooth;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background: rgba(0, 0, 0, 0.12);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

.shadow-soft {
  box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 18px 50px rgba(0,0,0,0.10);
}

.glass {
  background: rgba(255,255,255,0.70);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,0.65);
}

.glass-strong {
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.70);
}

.card-hover {
  transition: transform 240ms ease, box-shadow 240ms ease, filter 240ms ease;
}
.card-hover:hover {
  transform: translateY(-2px);
  filter: saturate(1.02);
  box-shadow: 0 1px 0 rgba(0,0,0,0.05), 0 24px 60px rgba(0,0,0,0.14);
}

.btn {
  border-radius: 14px;
  transition: transform 160ms ease, filter 160ms ease, background 160ms ease;
}
.btn:active {
  transform: scale(0.98);
}

module.exports = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "cdn.daraz.pk" },
      { protocol: "https", hostname: "i.daraz.pk" }
    ],
  },
};
