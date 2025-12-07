"use client";

import * as React from "react";
// Importa los componentes base de Radix UI para la funcionalidad del diálogo modal.
import * as DialogPrimitive from "@radix-ui/react-dialog";
// Ícono de "cerrar" (X) de Lucide.
import { XIcon } from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Dialog raíz: Contenedor que gestiona el estado de apertura/cierre.
function Dialog({
  ...props
}) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

// Componente DialogTrigger: El botón o elemento que abre el modal.
function DialogTrigger({
  ...props
}) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

// Componente DialogPortal: Permite que el contenido del modal se renderice fuera del árbol DOM (generalmente en el body).
function DialogPortal({
  ...props
}) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

// Componente DialogClose: Un elemento que cierra el modal al hacer clic (no siempre el ícono de la X).
function DialogClose({
  ...props
}) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

// Componente DialogOverlay: La capa de fondo semitransparente que se superpone a la página.
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        // Animación de entrada/salida (fade-in/fade-out).
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        // Posicionamiento fijo, alto z-index y color de fondo.
        "fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Componente DialogContent: El contenedor principal de la ventana modal flotante.
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    // Renderiza el contenido dentro del Portal y con el Overlay.
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        className={cn(
          // Animación de entrada/salida (fade, zoom y duración).
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          // Posicionamiento centralizado fijo (top/left 50% + translate -50%).
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        {/* Botón de cierre integrado dentro del Content (generalmente el ícono X). */}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

// Componente DialogHeader: Contenedor para el título y la descripción del modal.
function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      // Estilos para la alineación del texto (centrado en móvil, izquierda en sm+).
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

// Componente DialogFooter: Contenedor para botones de acción en la parte inferior.
function DialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      // Estilos para la disposición de los botones (reverse en móvil, a la derecha en sm+).
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

// Componente DialogTitle: El título del modal.
function DialogTitle({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

// Componente DialogDescription: Texto descriptivo o auxiliar debajo del título.
function DialogDescription({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

// Exporta todos los subcomponentes del Dialog.
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};