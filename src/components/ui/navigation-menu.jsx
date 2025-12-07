"use client";

import * as React from "react";
// Importa todos los componentes base de Radix UI para el menú de navegación.
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
// Importa cva (Class Variance Authority) para crear variantes de clases reutilizables.
import { cva } from "class-variance-authority";
// Importa el ícono de flecha para los triggers.
import { ChevronDownIcon } from "lucide-react";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Componente NavigationMenu raíz: Contenedor principal que gestiona el estado y la animación.
function NavigationMenu({
  className,
  children,
  viewport = true, // Controla si se renderiza el Viewport (para mega-menús).
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport} // Propiedad para estilos condicionales en Content.
      className={cn(
        // Flexbox, centrado y restricción de ancho.
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {/* Condicionalmente renderiza el Viewport. */}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

// Componente NavigationMenuList: Contenedor para los ítems de navegación (los botones principales).
function NavigationMenuList({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      // Lista sin viñetas, flexbox, centrado y gap.
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

// Componente NavigationMenuItem: Contenedor para cada elemento del menú principal.
function NavigationMenuItem({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      // Posición relativa para anidar el Content.
      className={cn("relative", className)}
      {...props}
    />
  );
}

// Estilos de la variación para el Trigger (botón principal), usando cva.
const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium",
  // Estilos de hover, foco y estado abierto (data-[state=open]).
  "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50",
  // Estilos de accesibilidad (focus-visible).
  "focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1",
);

// Componente NavigationMenuTrigger: El botón que abre el contenido del menú.
function NavigationMenuTrigger({
  className,
  children,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      // Aplica los estilos definidos por cva.
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      {/* Ícono de flecha que rota 180 grados al abrirse el menú. */}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

// Componente NavigationMenuContent: El contenido desplegable (el mega-menú).
function NavigationMenuContent({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        // Animaciones de entrada/salida para el movimiento lateral (usando data-[motion]).
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52",
        // Posicionamiento en móvil (ancho completo) y escritorio (absoluto, ancho auto).
        "top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        // Estilos condicionales cuando NO se usa el Viewport (group-data-[viewport=false]).
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200",
        // Estilos para deshabilitar el anillo de foco en los links internos.
        "**:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

// Componente NavigationMenuViewport: El contenedor de animación y tamaño para el Content.
function NavigationMenuViewport({
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        // Posicionamiento absoluto debajo del menú.
        "absolute top-full left-0 isolate z-50 flex justify-center",
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          // Origen de animación, fondo, borde y sombra.
          "origin-top-center bg-popover text-popover-foreground relative mt-1.5 overflow-hidden rounded-md border shadow",
          // Animación de entrada/salida (zoom).
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90",
          // Altura y ancho dinámicos proporcionados por Radix y ajuste para móvil/escritorio.
          "h-[var(--radix-navigation-menu-viewport-height)] w-full md:w-[var(--radix-navigation-menu-viewport-width)]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

// Componente NavigationMenuLink: Un enlace dentro del Content.
function NavigationMenuLink({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        // Estilos de hover, foco y estado activo (data-[active=true]).
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        // Estilos base y de accesibilidad.
        "focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

// Componente NavigationMenuIndicator: El pequeño triángulo que apunta al Trigger abierto.
function NavigationMenuIndicator({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        // Animación de fade-in/fade-out.
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
        // Posicionamiento, z-index y overflow para recortar el triángulo.
        "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className,
      )}
      {...props}
    >
      {/* Elemento rotado para formar el triángulo. */}
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

// Exporta todos los componentes y la función de estilo.
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
