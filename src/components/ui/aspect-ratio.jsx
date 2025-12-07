"use client";

// Importa los componentes base de Radix UI para mantener la relación de aspecto.
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

// Componente AspectRatio.
function AspectRatio(props) {
  // Retorna el componente raíz de Radix, que fuerza a su hijo a mantener una proporción específica (ej. 16:9).
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

// Exporta el componente.
export { AspectRatio };
