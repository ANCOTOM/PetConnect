"use client";

import * as React from "react";
// Importa los componentes base de Radix UI para la barra de menú.
import * as MenubarPrimitive from "@radix-ui/react-menubar";
// Importa íconos para elementos checked, submenús y radio buttons.
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Menubar raíz: El contenedor principal de la barra de menú.
function Menubar({
  className,
  ...props
}) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        // Estilos de la barra: fondo, flexbox, altura, borde, padding y sombra.
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

// Componente MenubarMenu: Envuelve un Trigger y su Content (ej. el menú "Archivo").
function MenubarMenu({
  ...props
}) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

// Componente MenubarGroup: Contenedor para agrupar ítems relacionados dentro del Content.
function MenubarGroup({
  ...props
}) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

// Componente MenubarPortal: Renderiza el contenido del menú fuera del árbol DOM.
function MenubarPortal({
  ...props
}) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

// Componente MenubarRadioGroup: Contenedor para ítems de radio (selección única).
function MenubarRadioGroup({
  ...props
}) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  );
}

// Componente MenubarTrigger: El botón dentro de la barra que abre el Content.
function MenubarTrigger({
  className,
  ...props
}) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        // Estilos de foco y estado abierto (al hacer clic).
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        // Estilos base del botón.
        "flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
        className,
      )}
      {...props}
    />
  );
}

// Componente MenubarContent: El contenido desplegable (el menú en sí).
function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8, // Distancia vertical desde el Trigger.
  ...props
}) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          // Estilos base, z-index y dimensiones.
          "bg-popover text-popover-foreground z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md",
          // Animación de entrada/salida (fade y zoom).
          "data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          // Animaciones de deslizamiento basadas en el lado de apertura.
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    </MenubarPortal>
  );
}

// Componente MenubarItem: Una opción clickable dentro del menú.
function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        // Estilos de foco, cursor, y manejo de estado deshabilitado.
        "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        // Estilos para la variante destructiva.
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive",
        // Clases generales y padding opcional (inset).
        "[&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

// Componente MenubarCheckboxItem: Una opción con estado checked/unchecked.
function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        // Estilos de foco y padding para dejar espacio al indicador.
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      {/* Contenedor del ícono de check, posicionado a la izquierda. */}
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

// Componente MenubarRadioItem: Una opción de selección única dentro de un RadioGroup.
function MenubarRadioItem({
  className,
  children,
  ...props
}) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        // Estilos de foco y padding para dejar espacio al indicador.
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {/* Contenedor del ícono de radio, posicionado a la izquierda. */}
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          {/* Ícono de círculo que indica la selección. */}
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

// Componente MenubarLabel: Texto de etiqueta que no es clickable.
function MenubarLabel({
  className,
  inset,
  ...props
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        // Estilos de texto y padding opcional para alinear con ítems (inset).
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

// Componente MenubarSeparator: Línea horizontal para separar grupos de ítems.
function MenubarSeparator({
  className,
  ...props
}) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

// Componente MenubarShortcut: Texto para mostrar el atajo de teclado.
function MenubarShortcut({
  className,
  ...props
}) {
  return (
    <span
      data-slot="menubar-shortcut"
      // Alinea el texto a la derecha y usa estilo de texto silenciado.
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

// Componente MenubarSub: Envuelve un submenú (menú dentro de un menú).
function MenubarSub({
  ...props
}) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

// Componente MenubarSubTrigger: Ítem que abre un submenú.
function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        // Estilos de foco y estado abierto.
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        // Clases generales y padding opcional (inset).
        "flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      {/* Ícono de flecha para indicar el submenú, alineado a la derecha. */}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

// Componente MenubarSubContent: El contenido del submenú.
function MenubarSubContent({
  className,
  ...props
}) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        // Estilos y animaciones similares al MenubarContent.
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

// Exporta todos los subcomponentes.
export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};