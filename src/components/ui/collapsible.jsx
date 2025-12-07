"use client";

// Importa los componentes base de Radix UI para la funcionalidad de colapsado/expansión.
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

// Componente Collapsible raíz: Contenedor principal que gestiona el estado (abierto/cerrado).
function Collapsible({
  ...props
}) {
  // Retorna el Root de Radix, que se encarga de la lógica central.
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

// Componente CollapsibleTrigger: El botón o elemento que alterna el estado de expansión.
function CollapsibleTrigger({
  ...props
}) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

// Componente CollapsibleContent: El contenido que se muestra o se oculta.
function CollapsibleContent({
  ...props
}) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      // Nota: La animación de entrada/salida (mostrar/ocultar) debe definirse mediante CSS en las props o en la hoja de estilos global.
      {...props}
    />
  );
}

// Exporta los tres subcomponentes necesarios.
export { Collapsible, CollapsibleTrigger, CollapsibleContent };