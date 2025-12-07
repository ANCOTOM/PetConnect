"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
// Ya no se importa VariantProps de type, se usa solo en el contexto para inferir valores por defecto.

import { cn } from "./utils";
import { toggleVariants } from "./toggle";

// Contexto: Almacena las variantes (tamaño y variante) definidas en el componente padre.
const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
});

// Componente ToggleGroup: Contenedor principal para el grupo de botones.
function ToggleGroup({
  className,
  variant, // Props para variante de estilo.
  size, // Props para tamaño.
  children,
  ...props
}) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        // Contenedor Flex.
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        className,
      )}
      {...props}
    >
      {/* Proveedor de Contexto: Pasa la variante y el tamaño a todos los ítems hijos. */}
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

// Componente ToggleGroupItem: Botón individual dentro del grupo.
function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}) {
  // Obtiene las propiedades de variante y tamaño del contexto.
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      // Usa las propiedades del contexto, cayendo en las props locales si el contexto está vacío.
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        // Aplica las clases base del botón de alternancia.
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        // Estilos específicos para ítems de grupo: anulan bordes, manejan bordes redondeados.
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10",
        // Estilos específicos para la variante 'outline'.
        "data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };