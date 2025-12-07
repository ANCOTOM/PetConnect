// "use client";

import * as React from "react";
// Importa el componente raíz de Toggle de Radix UI.
import * as TogglePrimitive from "@radix-ui/react-toggle";
// Importa la función cva y el tipo VariantProps para manejar las variantes de estilo.
import { cva } from "class-variance-authority";

// Importa una función de utilidad para concatenar clases condicionalmente.
import { cn } from "./utils";

// Define las clases base y las variantes para el componente Toggle.
const toggleVariants = cva(
  // Clases base aplicadas a todos los toggles
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    // Define variantes de estilo (default y outline)
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      // Define variantes de tamaño (default, sm, lg)
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    // Define las variantes por defecto que se aplicarán si no se especifican.
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// Define el componente Toggle.
// Se eliminaron las anotaciones de tipo de TypeScript para las props.
function Toggle({
  className,
  variant,
  size,
  ...props
}) {
  // Renderiza el componente raíz de Radix UI.
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      // Combina las clases generadas por toggleVariants con cualquier className adicional.
      className={cn(toggleVariants({ variant, size, className }))}
      // Pasa todas las demás props al componente TogglePrimitive.Root.
      {...props}
    />
  );
}

// Exporta el componente Toggle y la función toggleVariants para su uso en otros archivos.
export { Toggle, toggleVariants };