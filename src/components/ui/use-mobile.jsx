import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Asegúrate de que no hay nada entre 'useState' y el paréntesis que abre.
  const [isMobile, setIsMobile] = React.useState(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Función de callback (onChange)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Configura el listener y el valor inicial
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    // Función de limpieza
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
