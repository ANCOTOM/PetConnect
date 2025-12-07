"use client";

import * as React from "react";
// Importa los componentes base de Radix UI para crear un área de desplazamiento (scroll).
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente principal ScrollArea. Envuelve el contenido y la barra de desplazamiento.
function ScrollArea({ className, children, ...props }) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      // Aplica 'relative' y las clases externas pasadas.
      className={cn("relative", className)}
      {...props}
    >
      {/* Viewport: El contenedor visible donde se muestra el contenido. */}
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        // Clases que definen el tamaño completo, esquinas redondeadas y estilos de foco.
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {/* Aquí se inyecta el contenido que se desplaza. */}
        {children}
      </ScrollAreaPrimitive.Viewport>
      {/* Agrega la barra de desplazamiento predeterminada. */}
      <ScrollBar />
      {/* Corner: Maneja el área donde se encuentran las barras horizontal y vertical. */}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

// Componente de la barra de desplazamiento (el riel y el pulgar).
function ScrollBar({ className, orientation = "vertical", ...props }) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      // Clases para el tamaño y orientación de la barra (vertical por defecto).
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      {/* Thumb: El "pulgar" que el usuario arrastra. */}
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        // Estilo del pulgar (color de borde, forma redondeada).
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

// Exporta los dos componentes principales.
export { ScrollArea, ScrollBar };
