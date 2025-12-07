"use client";

import * as React from "react";
// Importa todos los componentes base de Radix UI para el menú contextual.
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
// Importa íconos para elementos checked, submenús y radio buttons.
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente ContextMenu: El contenedor raíz para la lógica del menú.
function ContextMenu({
  ...props
}) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

// Componente ContextMenuTrigger: El elemento que, al hacer clic derecho, abre el menú.
function ContextMenuTrigger({
  ...props
}) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

// Componente ContextMenuGroup: Contenedor para agrupar ítems relacionados.
function ContextMenuGroup({
  ...props
}) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

// Componente ContextMenuPortal: Renderiza el contenido del menú fuera del árbol DOM del trigger (en el body).
function ContextMenuPortal({
  ...props
}) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

// Componente ContextMenuSub: Envuelve un submenú.
function ContextMenuSub({
  ...props
}) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

// Componente ContextMenuRadioGroup: Contenedor para un grupo de ítems de radio.
function ContextMenuRadioGroup({
  ...props
}) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

// Componente ContextMenuSubTrigger: Ítem que abre un submenú.
function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        // Estilos de foco y estado abierto, padding opcional (inset) y tamaño de íconos.
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      {/* Ícono de flecha que indica que hay un submenú. */}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

// Componente ContextMenuSubContent: El contenido del submenú (la caja flotante).
function ContextMenuSubContent({
  className,
  ...props
}) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        // Estilos de fondo, borde, sombra y transiciones/animaciones de entrada/salida.
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

// Componente ContextMenuContent: El contenido principal del menú contextual (la caja flotante).
function ContextMenuContent({
  className,
  ...props
}) {
  return (
    // Usa Portal para asegurar que el menú se renderice en la capa superior de la aplicación.
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          // Estilos y animaciones similares a SubContent. También maneja la altura máxima y el scroll.
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

// Componente ContextMenuItem: Una opción de acción clickable dentro del menú.
function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        // Estilos de foco, cursor, padding opcional (inset) y manejo del estado deshabilitado.
        "focus:bg-accent focus:text-accent-foreground",
        // Estilos para la variante destructiva.
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

// Componente ContextMenuCheckboxItem: Una opción con un estado checked/unchecked.
function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        // Estilos y padding para dejar espacio al indicador de check.
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      {/* Contenedor del ícono de check. Posicionado absoluto a la izquierda. */}
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {/* CORREGIDO: ItemIndicator con etiqueta de cierre explícita. */}
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

// Componente ContextMenuRadioItem: Una opción de selección única dentro de un RadioGroup.
function ContextMenuRadioItem({
  className,
  children,
  ...props
}) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        // Estilos y padding para dejar espacio al indicador de radio.
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {/* Contenedor del ícono de radio. Posicionado absoluto a la izquierda. */}
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {/* CORREGIDO: ItemIndicator con etiqueta de cierre explícita. */}
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

// Componente ContextMenuLabel: Texto de etiqueta que no es clickable (título o separador semántico).
function ContextMenuLabel({
  className,
  inset,
  ...props
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        // Estilos de texto (foreground) y padding (inset) para alineación.
        "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

// Componente ContextMenuSeparator: Línea horizontal para separar grupos de ítems.
function ContextMenuSeparator({
  className,
  ...props
}) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

// Componente ContextMenuShortcut: Texto para mostrar el atajo de teclado asociado a un ítem.
function ContextMenuShortcut({
  className,
  ...props
}) {
  return (
    <span
      data-slot="context-menu-shortcut"
      // Alinea el texto a la derecha (ml-auto) y usa estilo de texto silenciado.
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

// Exporta todos los subcomponentes.
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};