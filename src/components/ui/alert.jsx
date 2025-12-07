import * as React from "react";
// Slot: Permite que el componente actúe como su hijo (asChild).
import { Slot } from "@radix-ui/react-slot";
// cva: Función para definir variantes de clases CSS de forma condicional.
import { cva } from "class-variance-authority";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Define las variantes de estilo para el componente Badge.
const badgeVariants = cva(
  // Clases base aplicadas a todos los badges (diseño, accesibilidad, foco).
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      // Define los diferentes esquemas de color o apariencia.
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
    // Variante por defecto si no se especifica ninguna.
    defaultVariants: {
      variant: "default",
    },
  },
);

// Componente Badge principal.
function Badge({ className, variant, asChild = false, ...props }) {
  // Determina si renderiza como un 'span' o como el componente hijo (usando Slot).
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      // Combina las clases base, la variante seleccionada y las clases externas (className).
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

// Exporta el componente Badge y la utilidad de variantes para uso externo.
export { Badge, badgeVariants };
