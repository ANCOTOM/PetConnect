"use client";

import * as React from "react";
// Importa los componentes base de RadioGroup de Radix UI.
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
// Importa el ícono de círculo para indicar la selección.
import { CircleIcon } from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente RadioGroup raíz: Contenedor que gestiona la selección única del grupo.
function RadioGroup({
  className,
  ...props
}) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      // Usa grid para organizar los ítems verticalmente con un pequeño espacio.
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

// Componente RadioGroupItem: El botón de radio individual.
function RadioGroupItem({
  className,
  ...props
}) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        // Estilos base: forma circular, tamaño, borde y sombra.
        "border-input text-primary dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none",
        // Estilos de accesibilidad y foco (focus-visible): borde y anillo.
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        // Estilos para errores (aria-invalid): borde y anillo destructivo.
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // Estilos de estado deshabilitado.
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        // Contenedor del indicador de selección.
        className="relative flex items-center justify-center"
      >
        {/* Ícono de círculo (el punto de selección), centrado absolutamente. */}
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

// Exporta los componentes.
export { RadioGroup, RadioGroupItem };
