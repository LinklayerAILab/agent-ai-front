// Global ambient declarations. This file MUST stay a script file
// (no top-level import/export), otherwise `declare module` below
// stops applying globally.

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Swiper's css subpath exports ship no type declarations; these are
// side-effect-only imports (e.g. `import "swiper/css"` in Home.tsx).
declare module 'swiper/css';
declare module 'swiper/css/navigation';
