"use client";

import * as React from "react";
// Importa todos los componentes base de Radix UI para el popover.
import * as PopoverPrimitive from "@radix-ui/react-popover";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Popover raíz: El contenedor principal que gestiona el estado (abierto/cerrado).
function Popover({
  ...props
}) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

// Componente PopoverTrigger: El elemento que, al hacer clic, abre/cierra el popover.
function PopoverTrigger({
  ...props
}) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

// Componente PopoverContent: La caja flotante que contiene el contenido del popover.
function PopoverContent({
  className,
  align = "center", // Alineación predeterminada respecto al Trigger.
  sideOffset = 4, // Separación predeterminada del Trigger.
  ...props
}) {
  return (
    // Usa Portal para renderizar el contenido en la capa superior de la aplicación.
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          // Estilos base: fondo, borde, sombra y dimensiones.
          "bg-popover text-popover-foreground z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          // Animación de entrada/salida (fade-in/fade-out y zoom).
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          // Animaciones de deslizamiento basadas en el lado de apertura (side).
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

// Componente PopoverAnchor: Elemento opcional para anclar el popover a otro elemento que no es el Trigger.
function PopoverAnchor({
  ...props
}) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

// Exporta todos los componentes.
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
