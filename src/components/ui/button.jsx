import * as React from "react";
// Slot: Permite que el componente se renderice como su hijo (funcionalidad 'asChild').
import { Slot } from "@radix-ui/react-slot";
// cva: Función clave para definir y aplicar clases CSS condicionales basadas en variantes.
import { cva } from "class-variance-authority";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Define las variantes de estilo y comportamiento del botón.
const buttonVariants = cva(
  // Clases CSS base: aplican estilos de diseño, accesibilidad, manejo de íconos y foco.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      // Definición de las variaciones de estilo (colores, fondos).
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // Definición de las variaciones de tamaño (altura, padding).
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md", // Para botones que solo contienen un ícono.
      },
    },
    // Variantes por defecto si no se especifican.
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// Componente Button principal. Se usa forwardRef para permitir el acceso a la ref del elemento DOM.
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  // Decide qué elemento renderizar: 'button' o el Slot si asChild es verdadero.
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      // Combina las clases base, las variantes seleccionadas y las clases externas (className).
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref} // Pasa la referencia al elemento DOM.
      {...props}
    />
  );
});

// Asigna un nombre para depuración de React.
Button.displayName = "Button";

// Exporta el componente Button y la utilidad de variantes para uso externo.
export { Button, buttonVariants };