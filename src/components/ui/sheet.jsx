"use client";

import * as React from "react";
// Importa los componentes base de Dialog (usados para Sheet) de Radix UI.
import * as SheetPrimitive from "@radix-ui/react-dialog";
// Importa el ícono de cierre.
import { XIcon } from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Sheet raíz: Contenedor que gestiona el estado (abierto/cerrado).
function Sheet({ ...props }) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

// Componente SheetTrigger: El botón que abre el panel.
function SheetTrigger({
  ...props
}) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

// Componente SheetClose: El botón o elemento que cierra el panel (usado implícitamente en Content).
function SheetClose({
  ...props
}) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

// Componente SheetPortal: Asegura que el contenido se renderice fuera del árbol DOM.
function SheetPortal({
  ...props
}) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

// Componente SheetOverlay: La capa de fondo semitransparente que bloquea el contenido.
function SheetOverlay({
  className,
  ...props
}) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        // Posicionamiento fijo, z-index y color de fondo.
        "fixed inset-0 z-50 bg-black/50",
        // Animación de entrada/salida: fade-in/fade-out.
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

// Componente SheetContent: El panel deslizante con el contenido.
function SheetContent({
  className,
  children,
  side = "right", // Dirección desde la que se desliza ('top', 'right', 'bottom', 'left').
  ...props
}) {
  return (
    <SheetPortal>
      {/* El overlay se renderiza dentro del portal antes que el contenido. */}
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          // Estilos base: fondo, z-index, sombra y animación base.
          "bg-background fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
          // Lógica de posición y animación basada en la propiedad 'side'.
          // Side: Right
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          // Side: Left
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          // Side: Top
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          // Side: Bottom
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className,
        )}
        {...props}
      >
        {children}
        {/* Botón de cierre posicionado en la esquina. */}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          {/* Texto invisible para lectores de pantalla. */}
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

// Componente SheetHeader: Contenedor para el título y descripción (encabezado).
function SheetHeader({ className, ...props }) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

// Componente SheetFooter: Contenedor para botones o acciones (pie).
function SheetFooter({ className, ...props }) {
  return (
    <div
      data-slot="sheet-footer"
      // Se empuja hacia abajo (mt-auto) y añade padding.
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

// Componente SheetTitle: Título accesible del panel.
function SheetTitle({
  className,
  ...props
}) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

// Componente SheetDescription: Descripción accesible del panel.
function SheetDescription({
  className,
  ...props
}) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

// Exporta todos los subcomponentes.
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
