import * as React from "react";
// Slot: Permite que el componente se renderice como su hijo (funcionalidad 'asChild').
import { Slot } from "@radix-ui/react-slot";
// cva: Función clave para definir y aplicar clases CSS condicionales basadas en variantes.
import { cva } from "class-variance-authority";

// Función de utilidad para combinar clases CSS (ej. cn('clase-a', props.className)).
import { cn } from "./utils";

// Define las variantes de estilo y comportamiento del Badge.
const badgeVariants = cva(
  // Clases CSS base: aplican estilos de diseño, tamaño, tipografía y accesibilidad por defecto.
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      // Definición de las variaciones de estilo (colores, fondos).
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    // Variante aplicada por defecto.
    defaultVariants: {
      variant: "default",
    },
  },
);

// Componente principal para mostrar etiquetas o insignias.
function Badge({ className, variant, asChild = false, ...props }) {
  // Decide qué elemento renderizar: 'span' o el Slot si asChild es verdadero.
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      // Combina las clases de la variante seleccionada con las clases externas.
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

// Exporta el componente y las variantes de estilo (útil para otros componentes).
export { Badge, badgeVariants };