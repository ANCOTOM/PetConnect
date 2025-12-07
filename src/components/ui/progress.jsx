"use client";

import * as React from "react";
// Importa los componentes base de Progress de Radix UI.
import * as ProgressPrimitive from "@radix-ui/react-progress";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Progress: Muestra el progreso de una tarea.
function Progress({
  className,
  value, // El valor de progreso (0 a 100).
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      // Estilos base de la barra: fondo, altura, ancho completo, esquinas redondeadas.
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      // Props de accesibilidad (max, value).
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        // Estilos del indicador: color principal, altura completa, transición suave.
        className="bg-primary h-full w-full flex-1 transition-all"
        // Lógica clave: Mueve el indicador horizontalmente (transform: translateX) para simular el llenado.
        // Si el valor es 50, se mueve -(100 - 50)% = -50%, dejando visible el 50% derecho.
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

// Exporta el componente.
export { Progress };
