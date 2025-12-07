// El componente no interactúa con el DOM fuera de React, pero mantiene la directiva por convención.
"use client";

import * as React from "react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Skeleton: Muestra un placeholder gris que pulsa para indicar que el contenido está cargando.
function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // Estilo base: color de acento, bordes redondeados y la animación de pulso.
        "bg-accent animate-pulse rounded-md",
        className,
      )}
      {...props}
    />
  );
}

// Exporta el componente.
export { Skeleton };
