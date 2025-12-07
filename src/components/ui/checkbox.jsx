"use client";

import * as React from "react";
// Importa el componente base de Radix UI para la lógica del checkbox.
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
// Ícono de marca de verificación de Lucide.
import { CheckIcon } from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Checkbox principal que envuelve y estiliza CheckboxPrimitive.Root.
function Checkbox({ className, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Clases base: tamaño, forma, sombra y borde.
        "peer border bg-input-background dark:bg-input/30",
        // Estilos al estado 'checked': color de fondo primario y texto.
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        // Estilos de accesibilidad: anillo de foco, manejo de estado 'aria-invalid'.
        "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // Propiedades de tamaño, transición, y estados deshabilitados.
        "size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {/* Indicador: Contiene el ícono que se muestra cuando el checkbox está marcado. */}
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        // Asegura que el ícono esté centrado. transition-none evita animación de entrada/salida.
        className="flex items-center justify-center text-current transition-none"
      >
        {/* El ícono de marca de verificación. */}
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

// Exporta el componente.
export { Checkbox };