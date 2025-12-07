"use client";

import * as React from "react";
// Importa el componente base de Switch de Radix UI.
import * as SwitchPrimitive from "@radix-ui/react-switch";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Switch: Un interruptor de palanca para activar/desactivar opciones.
function Switch({
  className,
  ...props
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Contenedor (Root): Estilos base, tamaño, bordes, transiciones y accesibilidad (peer).
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        // Colores de estado: checked (activado) usa 'bg-primary'. unchecked (desactivado) usa 'bg-switch-background' (o 'bg-input/80' en dark mode).
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background dark:data-[state=unchecked]:bg-input/80",
        className,
      )}
      {...props}
    >
      {/* Pulgar (Thumb): El círculo móvil. */}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Estilos base: tamaño, forma circular, sombra y deshabilitación de eventos de ratón.
          "pointer-events-none block size-4 rounded-full ring-0 shadow-sm transition-transform",
          // Colores del pulgar: cambia según el estado y el modo oscuro.
          "bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground",
          // Animación de desplazamiento:
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

// Exporta el componente.
export { Switch };
