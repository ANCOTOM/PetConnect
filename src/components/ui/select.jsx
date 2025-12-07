"use client";

import * as React from "react";
// Importa los componentes base de Select de Radix UI.
import * as SelectPrimitive from "@radix-ui/react-select";
// Importa íconos para indicar selección y desplazamiento.
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Select raíz: Contenedor que gestiona el estado y la lógica del desplegable.
function Select({
  ...props
}) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

// Componente SelectGroup: Contenedor para agrupar ítems relacionados.
function SelectGroup({
  ...props
}) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

// Componente SelectValue: Placeholder y valor seleccionado visible en el Trigger.
function SelectValue({
  ...props
}) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

// Componente SelectTrigger: El botón que abre el desplegable.
function SelectTrigger({
  className,
  size = "default", // Propiedad para definir la altura (sm o default).
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // Estilos base: Flex, ancho completo, borde, fondo.
        "border-input dark:bg-input/30 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none",
        // Estilos de hover, placeholder, íconos.
        "data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground dark:hover:bg-input/50",
        // Estilos de foco y error (similares a Input).
        "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus-visible:ring-[3px]",
        // Estilos de estado deshabilitado y alturas por tamaño.
        "disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8",
        // Estilos de SelectValue e íconos anidados.
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      {/* Ícono de flecha que indica que es un desplegable. */}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

// Componente SelectContent: El contenedor de las opciones.
function SelectContent({
  className,
  children,
  position = "popper", // Determina el método de posicionamiento (popper es el más flexible).
  ...props
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // Estilos base, z-index y dimensiones máximas.
          "bg-popover text-popover-foreground relative z-50 min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md max-h-(--radix-select-content-available-height)",
          // Animaciones de entrada/salida (fade y zoom).
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          // Animaciones de deslizamiento basadas en el lado de apertura.
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          // Desplazamiento adicional si la posición es 'popper'.
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        {/* Botón de desplazamiento hacia arriba (si el contenido es largo). */}
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            // Ajusta el tamaño del viewport si la posición es 'popper'.
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        {/* Botón de desplazamiento hacia abajo. */}
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

// Componente SelectLabel: Etiqueta no clickable para agrupar ítems.
function SelectLabel({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      // Estilos de texto (pequeño y muted).
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  );
}

// Componente SelectItem: Una opción individual seleccionable.
function SelectItem({
  className,
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // Estilos base, foco, y cursor.
        "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none",
        // Estilos de estado deshabilitado.
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        // Estilos para íconos anidados.
        "[&_svg:not([class*='text'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      {/* Contenedor del ícono de check, posicionado a la derecha. */}
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      {/* Texto de la opción. */}
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

// Componente SelectSeparator: Línea divisoria entre ítems.
function SelectSeparator({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      // Línea de borde delgada.
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

// Componente SelectScrollUpButton: Botón visible si hay contenido oculto arriba.
function SelectScrollUpButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      // Centra el ícono y añade padding vertical.
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

// Componente SelectScrollDownButton: Botón visible si hay contenido oculto abajo.
function SelectScrollDownButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

// Exporta todos los subcomponentes.
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
