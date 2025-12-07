"use client";

import * as React from "react";
// Importa Slot de Radix UI para permitir renderizar como otro componente (asChild).
import { Slot } from "@radix-ui/react-slot";
// Importa cva y VariantProps para manejar variantes de estilo.
import { VariantProps, cva } from "class-variance-authority";
// Importa el ícono de panel izquierdo (típicamente usado para el toggle).
import { PanelLeftIcon } from "lucide-react";

// Importa hooks y componentes locales necesarios.
import { useIsMobile } from "./use-mobile";
import { cn } from "./utils";
import { Button } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Skeleton } from "./skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

// --- Constantes de Configuración ---
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días
const SIDEBAR_WIDTH = "16rem"; // Ancho expandido de escritorio
const SIDEBAR_WIDTH_MOBILE = "18rem"; // Ancho en móvil
const SIDEBAR_WIDTH_ICON = "3rem"; // Ancho colapsado (solo ícono)
const SIDEBAR_KEYBOARD_SHORTCUT = "b"; // Atajo: Ctrl/Cmd + B

// --- Contexto y Hook ---

// Define el contexto para compartir el estado del sidebar a los subcomponentes.
const SidebarContext = React.createContext(null);

// Hook para acceder al estado del sidebar.
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

// --- SidebarProvider ---

// Componente proveedor de estado y lógica del sidebar.
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // Estado interno para el modo de escritorio, controlable externamente.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;

  // Función para establecer el estado y guardar en cookie.
  const setOpen = React.useCallback(
    (value) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // Guarda el estado en una cookie para persistencia.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Función para alternar el estado (usa openMobile si es móvil, open si es escritorio).
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Manejador de atajo de teclado (Cmd/Ctrl + B).
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // Determina el estado como string para clases Tailwind.
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {/* TooltipProvider para manejar los tooltips de los íconos colapsados. */}
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              // Pasa las constantes de ancho como variables CSS.
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            }
          }
          className={cn(
            // Contenedor principal de la aplicación.
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

// --- Sidebar ---

// Componente principal de la barra lateral.
function Sidebar({
  side = "left", // Lado del que se desliza ('left' o 'right').
  variant = "sidebar", // Estilo ('sidebar', 'floating', 'inset').
  collapsible = "offcanvas", // Comportamiento al colapsar ('offcanvas', 'icon', 'none').
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  // Caso: No colapsable. Renderiza la barra fija.
  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className,
        )}
        {...props}
      />
    );
  }

  // Caso: Móvil. Usa el componente Sheet (Drawer).
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          // Oculta el botón de cierre por defecto de Sheet.
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              // Usa el ancho específico para móvil.
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            }
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Caso: Escritorio (Desktop).
  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* 1. Sidebar Gap: Elemento que reserva espacio en el flujo del layout. */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          // Se colapsa a 0 si es 'offcanvas'.
          "group-data-[collapsible=offcanvas]:w-0",
          // Se ajusta al ancho de ícono si es 'icon' (con ajustes para 'floating'/'inset').
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      {/* 2. Sidebar Container: El contenedor flotante del contenido del sidebar. */}
      <div
        data-slot="sidebar-container"
        className={cn(
          // Fijo, en el borde y animado.
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          // Posicionamiento para 'offcanvas' (fuera de pantalla).
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Ajusta el ancho y padding para modo ícono.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        {/* 3. Sidebar Inner: El contenido con estilos de borde/sombra para 'floating'. */}
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Subcomponentes y Elementos de Interacción ---

// Botón para abrir/cerrar el sidebar (visible en la aplicación principal).
function SidebarTrigger({
  className,
  onClick,
  ...props
}) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

// Rail: Área sensible al ratón para alternar/redimensionar (solo visible en escritorio).
function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1} // No enfocable con tabulación, solo con clic/ratón.
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        // Posicionamiento absoluto y tamaño para el hit area.
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear sm:flex",
        // Ajuste de posición según el lado.
        "group-data-[side=left]:-right-4 group-data-[side=right]:left-0",
        // Línea divisoria vertical (pseudo-elemento 'after').
        "after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border",
        // Cursores de redimensionamiento según el lado y estado.
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        // Estilos para modo 'offcanvas'.
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      {...props}
    />
  );
}

// SidebarInset: Contenido principal de la aplicación cuando el sidebar usa el estilo 'inset'.
function SidebarInset({ className, ...props }) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        // Estilos condicionales para el diseño 'inset' (márgenes y sombra).
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}

// SidebarInput: Input de búsqueda/filtrado estilizado para el sidebar.
function SidebarInput({
  className,
  ...props
}) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  );
}

// SidebarHeader: Sección de encabezado de la barra lateral.
function SidebarHeader({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

// SidebarFooter: Sección de pie de página de la barra lateral (generalmente ajustes/usuario).
function SidebarFooter({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

// SidebarSeparator: Separador estilizado para usar dentro del sidebar.
function SidebarSeparator({
  className,
  ...props
}) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      // Usa color de borde específico y añade margen horizontal.
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  );
}

// SidebarContent: El área principal y desplazable del contenido del sidebar.
function SidebarContent({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        // Flex para ocupar el espacio restante, overflow-auto para scroll.
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto",
        // Oculta el overflow si está en modo ícono.
        "group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

// --- Componentes de Grupo ---

// SidebarGroup: Contenedor para agrupar elementos relacionados (con label y acciones opcionales).
function SidebarGroup({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

// SidebarGroupLabel: Título del grupo. Se oculta si el sidebar está colapsado en modo ícono.
function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        // Estilos de texto, tamaño y foco.
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Transición para colapso a ícono (desaparece).
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

// SidebarGroupAction: Botón de acción para el grupo (ej. Añadir nuevo ítem).
function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        // Botón absoluto posicionado en la esquina superior derecha del grupo.
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Aumenta el área de clic en móvil.
        "after:absolute after:-inset-2 md:after:hidden",
        // Se oculta si está colapsado en modo ícono.
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

// SidebarGroupContent: El área real de las listas o contenido dentro de un grupo.
function SidebarGroupContent({
  className,
  ...props
}) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

// --- Componentes de Menú ---

// SidebarMenu: Lista (ul) que contiene los ítems principales.
function SidebarMenu({ className, ...props }) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

// SidebarMenuItem: Contenedor (li) para un botón de menú principal.
function SidebarMenuItem({ className, ...props }) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

// Definición de variantes de estilo para SidebarMenuButton.
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    compoundVariants: [
      // Estilo específico para el modo ícono, forzando tamaño y padding.
      {
        collapsible: "icon",
        className: "group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// SidebarMenuButton: Botón de navegación principal.
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip, // Puede ser string o props de TooltipContent.
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  // Si se proporciona un tooltip, envuelve el botón en un Tooltip.
  if (tooltip) {
    let tooltipProps = typeof tooltip === "string" ? { children: tooltip } : tooltip;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          // Muestra el tooltip SÓLO si está colapsado y NO es móvil.
          hidden={state !== "collapsed" || isMobile}
          {...tooltipProps}
        />
      </Tooltip>
    );
  }

  return button;
}

// SidebarMenuAction: Botón de acción asociado a un ítem de menú (ej. borrar/editar).
function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        // Posicionamiento absoluto a la derecha del botón.
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Ajuste de top basado en el tamaño del botón.
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        // Aumenta el área de clic en móvil.
        "after:absolute after:-inset-2 md:after:hidden",
        // Se oculta si está colapsado en modo ícono.
        "group-data-[collapsible=icon]:hidden",
        // Lógica de visibilidad al pasar el ratón/activo.
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

// SidebarMenuBadge: Indicador numérico o de estado asociado a un ítem de menú.
function SidebarMenuBadge({
  className,
  ...props
}) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        // Posicionamiento absoluto a la derecha del botón.
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        // Ajuste de top basado en el tamaño del botón.
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        // Se oculta si está colapsado en modo ícono.
        "group-data-[collapsible=icon]:hidden",
        // Cambia de color al hacer hover o si está activo.
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

// SidebarMenuSkeleton: Placeholder de carga para los ítems de menú.
function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}) {
  // Calcula un ancho de barra aleatorio para simular datos reales.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            // Usa la variable CSS con el ancho calculado.
            "--skeleton-width": width,
          }
        }
      />
    </div>
  );
}

// SidebarMenuSub: Lista anidada (ul) para submenús.
function SidebarMenuSub({ className, ...props }) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        // Márgenes y borde izquierdo para indicar anidamiento.
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        // Se oculta si está colapsado en modo ícono.
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

// SidebarMenuSubItem: Contenedor (li) para un botón de submenú.
function SidebarMenuSubItem({
  className,
  ...props
}) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

// SidebarMenuSubButton: Botón/Enlace de navegación dentro del submenú.
function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        // Estilos base y hover/active.
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        // Estilos de estado activo.
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        // Tamaños de fuente condicionales.
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        // Se oculta si está colapsado en modo ícono.
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

// Exporta todos los componentes y el hook.
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};