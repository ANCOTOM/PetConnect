"use client";

// Importa el hook para obtener el tema actual (light/dark/system).
import { useTheme } from "next-themes";
// Importa el componente Toaster base de Sonner y su tipo de props.
import { Toaster as Sonner } from "sonner";

// Componente ToasterWrapper: envuelve el Toaster de Sonner y aplica estilos.
function Toaster({ ...props }) {
  // Obtiene el tema actual de la aplicación.
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      // Pasa el tema actual al componente Sonner.
      theme={theme}
      className="toaster group"
      style={
        {
          // Define variables CSS personalizadas para que Sonner utilice los colores del tema local.
          // Esto asegura que las notificaciones se vean bien en modo claro/oscuro.
          "--normal-bg": "var(--popover)", // Fondo de la notificación.
          "--normal-text": "var(--popover-foreground)", // Color del texto.
          "--normal-border": "var(--border)", // Borde de la notificación.
        }
      }
      {...props}
    />
  );
}

// Exporta el componente.
export { Toaster };
