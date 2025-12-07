"use client";

import * as React from "react";
// Importa los componentes base de Tabs de Radix UI.
import * as TabsPrimitive from "@radix-ui/react-tabs";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente Tabs: Contenedor raíz que gestiona el estado de las pestañas.
function Tabs({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      // Disposición vertical con espacio entre la lista y el contenido.
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

// Componente TabsList: Contenedor para los botones (triggers) de las pestañas.
function TabsList({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // Estilos de la lista: fondo sutil, tamaño, flexbox horizontal y padding interno.
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
        className,
      )}
      {...props}
    />
  );
}

// Componente TabsTrigger: Botón interactivo que activa una pestaña.
function TabsTrigger({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Estilos base: tamaño, padding, texto, transiciones y accesibilidad (focus).
        "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 focus-visible:border-ring focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        // Colores de estado activo (checked).
        "data-[state=active]:bg-card dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground",
        // Estilos para los iconos dentro del trigger.
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

// Componente TabsContent: Contenedor del contenido asociado a una pestaña (panel).
function TabsContent({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      // Estilos del contenido: ocupa el espacio restante y asegura que no tiene un outline feo al enfocar.
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

// Exporta todos los subcomponentes.
export { Tabs, TabsList, TabsTrigger, TabsContent };
