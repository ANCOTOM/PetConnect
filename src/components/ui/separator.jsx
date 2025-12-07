"use client";

import * as React from "react";
// Importa el componente base de Separator de Radix UI.
import * as SeparatorPrimitive from "@radix-ui/react-separator";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Separator: Una línea horizontal o vertical para dividir contenido.
function Separator({
  className,
  orientation = "horizontal", // Dirección del separador ('horizontal' o 'vertical').
  decorative = true, // Indica si el separador es solo visual (true) o tiene un significado semántico (false).
  ...props
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        // Estilos base: color de borde y evita que se encoja (shrink-0).
        "bg-border shrink-0",
        // Estilos condicionales: Si es horizontal, tiene altura mínima (h-px) y ancho completo.
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        // Si es vertical, tiene altura completa y ancho mínimo (w-px).
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

// Exporta el componente.
export { Separator };
