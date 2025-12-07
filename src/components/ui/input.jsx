import * as React from "react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Input: Campo de entrada de texto genérico.
function Input({ className, type, ...props }) {
  return (
    <input
      type={type} // Tipo de input (text, email, password, file, etc.).
      data-slot="input"
      className={cn(
        // Estilos base: Flex, ancho completo, altura, borde, redondeado, padding, fondo.
        "border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none",
        // Estilos de texto y placeholder.
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        // Estilos para inputs de tipo 'file'.
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // Estilos para estado deshabilitado.
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Estilos de modo oscuro (fondo semitransparente).
        "dark:bg-input/30",
        // Estilos para pantallas medianas (md:text-sm).
        "md:text-sm",
        
        // Estilos de Foco (focus-visible): Aplica borde y un anillo de sombra (ring) para accesibilidad.
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",

        // Estilos de Error (aria-invalid): Cambia el borde y aplica un anillo destructivo si el campo es inválido.
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

// Exporta el componente.
export { Input };
