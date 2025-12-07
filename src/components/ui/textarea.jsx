"use client";

import * as React from "react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Textarea: Un área de texto multilínea estilizada.
function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Estilos base: Diseño de caja (flex), ancho completo, altura mínima.
        "flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base md:text-sm",
        // Colores y fondos: Fondo de entrada y borde por defecto.
        "bg-input-background border-input dark:bg-input/30",
        // Comportamiento: Deshabilita la capacidad de redimensionamiento manual por el usuario.
        "resize-none",
        // Texto de placeholder.
        "placeholder:text-muted-foreground",
        // Transiciones y Foco: Transición suave, quita el outline nativo y aplica un anillo/borde al enfocar.
        "transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50",
        // Estado de Deshabilitado.
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Estado de Error (aria-invalid): Cambia el borde y añade un anillo de color destructivo.
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

// Exporta el componente.
export { Textarea };
