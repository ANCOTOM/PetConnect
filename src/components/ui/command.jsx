"use client";

import * as React from "react";
// Importa el componente base de la biblioteca `cmdk` para la paleta de comandos.
import { Command as CommandPrimitive } from "cmdk";
// Ícono de búsqueda de Lucide.
import { SearchIcon } from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";
// Importa los subcomponentes de Dialog (Modal) para envolver la paleta.
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

// Componente Command raíz: El contenedor principal de la lógica de búsqueda.
function Command({ className, ...props }) {
  return (
    <CommandPrimitive
      data-slot="command"
      // Clases base para el estilo del contenedor.
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  );
}

// Componente CommandDialog: Combina el Command con el Dialog para crear una paleta de comandos modal.
function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}) {
  return (
    <Dialog {...props}>
      {/* Oculta la cabecera del Dialog visualmente (sr-only) para accesibilidad. */}
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {/* Contenido del Dialog: Sin padding y con overflow oculto. */}
      <DialogContent className="overflow-hidden p-0">
        {/* Componente Command: Contenedor con estilos específicos para la paleta de comandos. */}
        <Command
          // Sobreescribe estilos internos de cmdk: cabeceras, entradas, ítems, etc.
          className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// Componente CommandInput: El campo de entrada de texto con el ícono de búsqueda.
function CommandInput({ className, ...props }) {
  return (
    <div
      data-slot="command-input-wrapper"
      // Contenedor que alinea el ícono y el input.
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      {/* Ícono de búsqueda. */}
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      {/* Input de la primitiva cmdk. */}
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

// Componente CommandList: El contenedor para los resultados de la búsqueda.
function CommandList({ className, ...props }) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      // Limita la altura y permite el desplazamiento.
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

// Componente CommandEmpty: Se muestra cuando no hay resultados de búsqueda.
function CommandEmpty({ ...props }) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  );
}

// Componente CommandGroup: Agrupa ítems bajo una cabecera.
function CommandGroup({ className, ...props }) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      // Estilos para el contenedor del grupo y su cabecera.
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

// Componente CommandSeparator: Una línea divisoria entre grupos o ítems.
function CommandSeparator({ className, ...props }) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

// Componente CommandItem: Un resultado individual o acción dentro de la paleta.
function CommandItem({ className, ...props }) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      // Estilos de selección, íconos, cursor y manejo de estados deshabilitados.
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

// Componente CommandShortcut: Texto alineado a la derecha para atajos de teclado.
function CommandShortcut({ className, ...props }) {
  return (
    <span
      data-slot="command-shortcut"
      // Alinea a la derecha y usa un estilo de texto silenciado (muted).
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

// Exporta todos los subcomponentes para su uso modular.
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};