"use client";

import * as React from "react";
// Importa los componentes base de la librería de gráficos Recharts.
import * as RechartsPrimitive from "recharts";

// Función de utilidad para combinar clases CSS.
import { cn } from "./utils";

// Definición de selectores CSS para los temas claro y oscuro.
// Se usa para generar estilos dinámicos.
const THEMES = { light: "", dark: ".dark" };


// Contexto para compartir la configuración (config) entre el contenedor y los subcomponentes.
const ChartContext = React.createContext(null);

// Hook personalizado para acceder a la configuración del gráfico.
function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    // Error si el hook no se usa dentro del contenedor.
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

// Componente ChartContainer: Inicializa el contexto, el ID y envuelve ResponsiveContainer.
function ChartContainer({ id, className, children, config, ...props }) {
  // Genera un ID único para la hoja de estilos dinámica.
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        // Clases base para el contenedor, incluyendo estilos para elementos SVG internos de Recharts.
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        {/* Genera la hoja de estilos dinámica para los colores de las series (temas). */}
        <ChartStyle id={chartId} config={config} />
        {/* ResponsiveContainer de Recharts para manejo del tamaño. */}
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// Componente ChartStyle: Genera una etiqueta <style> con variables CSS para los colores de las series.
const ChartStyle = ({ id, config }) => {
  // Filtra las configuraciones que tienen color o tema.
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      // Inserta el CSS generado.
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    // Obtiene el color específico para el tema actual o el color por defecto.
    const color =
      itemConfig.theme?.[theme] ||
      itemConfig.color;
    // Define la variable CSS '--color-{key}'.
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

// Componente Tooltip de Recharts renombrado.
const ChartTooltip = RechartsPrimitive.Tooltip;

// Componente ChartTooltipContent: Contenido personalizado para el Tooltip.
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}) {
  const { config } = useChart();

  // Lógica para formatear y obtener la etiqueta del tooltip (memoizada).
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? config[label]?.label || label
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        // Estilo del contenedor del tooltip (fondo, borde, sombra).
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload.fill || item.color;

          return (
            <div
              key={item.dataKey}
              className={cn(
                // Diseño de cada fila de dato en el tooltip.
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center",
              )}
            >
              {/* Renderiza el valor formateado si se proporciona un formatter. */}
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {/* Muestra el ícono personalizado si existe en la configuración. */}
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    // Muestra el indicador de color (punto, línea o guiones).
                    !hideIndicator && (
                      <div
                        className={cn(
                          // Clases base y condicionales para el indicador.
                          "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          },
                        )}
                        style={
                          {
                            // Asigna el color dinámico al indicador.
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          }
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      // Contenedor del nombre y valor del dato.
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center",
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      {/* Nombre de la serie o etiqueta. */}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {/* Valor numérico del dato. */}
                    {item.value && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Componente Legend de Recharts renombrado.
const ChartLegend = RechartsPrimitive.Legend;

// Componente ChartLegendContent: Contenido personalizado para la Leyenda.
function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        // Diseño flex del contenedor de la leyenda.
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className={cn(
              // Diseño de cada elemento de la leyenda (ícono + etiqueta).
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3",
            )}
          >
            {/* Muestra el ícono personalizado o el cuadrado de color. */}
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {/* Etiqueta de la serie. */}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

// Función Helper: Busca la configuración de una serie (label, icon, color) a partir del payload de Recharts.
function getPayloadConfigFromPayload(
  config,
  payload,
  key,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey = key;

  if (
    key in payload &&
    typeof payload[key] === "string"
  ) {
    configLabelKey = payload[key];
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[
      key
    ];
  }

  // Retorna la configuración de la clave encontrada.
  return configLabelKey in config
    ? config[configLabelKey]
    : config[key];
}

// Exporta los componentes públicos.
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
