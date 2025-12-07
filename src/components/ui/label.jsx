"use client";

import * as React from "react";
// Importa el componente base de Label de Radix UI.
import * as LabelPrimitive from "@radix-ui/react-label";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Label: Representa la etiqueta de un campo de formulario.
function Label({
  className,
  ...props
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        // Estilos base: Flexbox para alinear contenido, tamaño de fuente y peso.
        "flex items-center gap-2 text-sm leading-none font-medium select-none",
        // Manejo del estado deshabilitado cuando el Label está dentro de un grupo (group-data-[disabled]).
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        // Manejo del estado deshabilitado del elemento asociado (peer-disabled).
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      // Props estándar, incluyendo 'htmlFor' para la accesibilidad.
      {...props}
    />
  );
}

// Exporta el componente.
export { Label };
