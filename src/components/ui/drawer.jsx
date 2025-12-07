"use client";

import * as React from "react";
// Importa los componentes base de la librería Vaul para la funcionalidad del cajón.
import { Drawer as DrawerPrimitive } from "vaul";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Drawer raíz: Contenedor que gestiona el estado y la configuración general.
function Drawer({
  ...props
}) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

// Componente DrawerTrigger: El botón o elemento que abre el cajón.
function DrawerTrigger({
  ...props
}) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

// Componente DrawerPortal: Permite que el contenido se renderice fuera del árbol DOM (en el body).
function DrawerPortal({
  ...props
}) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

// Componente DrawerClose: Un elemento que cierra el cajón.
function DrawerClose({
  ...props
}) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

// Componente DrawerOverlay: La capa de fondo semitransparente.
function DrawerOverlay({
  className,
  ...props
}) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        // Estilos de animación de entrada/salida (fade-in/fade-out).
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        // Posicionamiento fijo, alto z-index y color de fondo.
        "fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

// Componente DrawerContent: El contenedor principal del contenido del cajón.
function DrawerContent({
  className,
  children,
  ...props
}) {
  return (
    // Renderiza el contenido dentro del Portal y con el Overlay.
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          // Estilos para la dirección "top": se adjunta a la parte superior.
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          // Estilos para la dirección "bottom": se adjunta a la parte inferior (predeterminado).
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          // Estilos para la dirección "right": se adjunta a la derecha.
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          // Estilos para la dirección "left": se adjunta a la izquierda.
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className,
        )}
        {...props}
      >
        {/* Mango/indicador de arrastre (solo visible para cajones 'bottom'). */}
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

// Componente DrawerHeader: Contenedor para el título y la descripción en la parte superior del cajón.
function DrawerHeader({ className, ...props }) {
  return (
    <div
      data-slot="drawer-header"
      // Estilos de padding y gap.
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

// Componente DrawerFooter: Contenedor para botones de acción en la parte inferior del cajón.
function DrawerFooter({ className, ...props }) {
  return (
    <div
      data-slot="drawer-footer"
      // Se empuja hacia abajo (mt-auto) y se le añade padding.
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

// Componente DrawerTitle: El título principal del cajón.
function DrawerTitle({
  className,
  ...props
}) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

// Componente DrawerDescription: Texto descriptivo o auxiliar.
function DrawerDescription({
  className,
  ...props
}) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

// Exporta todos los subcomponentes del Drawer.
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};