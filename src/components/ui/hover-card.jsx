"use client";

import * as React from "react";
// Importa todos los componentes base de Radix UI para la funcionalidad de la tarjeta flotante.
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente HoverCard: El contenedor raíz que gestiona el estado y la lógica de tiempo de espera.
function HoverCard({
  ...props
}) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

// Componente HoverCardTrigger: El elemento que, al pasar el ratón, activa la visualización del contenido.
function HoverCardTrigger({
  ...props
}) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

// Componente HoverCardContent: La caja flotante que contiene la información.
function HoverCardContent({
  className,
  align = "center", // Alineación predeterminada (centro respecto al Trigger).
  sideOffset = 4, // Separación predeterminada del Trigger.
  ...props
}) {
  return (
    // Usa Portal para asegurar que el contenido se renderice en la capa superior de la aplicación.
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          // Estilos de fondo, borde, sombra y dimensiones.
          "bg-popover text-popover-foreground",
          // Animación de entrada/salida (fade-in/fade-out y zoom).
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          // Animaciones de deslizamiento basadas en el lado de apertura (side).
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          // Posicionamiento, tamaño y estilo final.
          "z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

// Exporta los componentes principales.
export { HoverCard, HoverCardTrigger, HoverCardContent };
