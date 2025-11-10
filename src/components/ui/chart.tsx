"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "./utils";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme != null || itemConfig.color != null,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const themeColor = itemConfig.theme?.[theme as "light" | "dark"];
    const color = themeColor ?? itemConfig.color;
    return color != null ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

type PrimitivePayload = Record<string, any>;

type TooltipContentProps = React.ComponentProps<"div"> & {
  active?: boolean;
  payload?: PrimitivePayload[];
  indicator?: "line" | "dot" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: React.ReactNode;
  labelFormatter?: (
    value: unknown,
    payload: PrimitivePayload[],
  ) => React.ReactNode;
  labelClassName?: string;
  formatter?: (...args: any[]) => React.ReactNode;
  color?: string;
  nameKey?: string;
  labelKey?: string;
};

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
}: TooltipContentProps) {
  const { config } = useChart();
  const payloadArray = React.useMemo(
    () => (payload as Array<Record<string, any>> | undefined) ?? [],
    [payload],
  );

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payloadArray.length) {
      return null;
    }

    const [item] = payloadArray;
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      labelKey == null && typeof label === "string"
        ? (config[label]?.label ?? label)
        : itemConfig?.label;

    if (labelFormatter != null) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payloadArray)}
        </div>
      );
    }

    if (value == null) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payloadArray,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (active !== true || !payloadArray.length) {
    return null;
  }

  const nestLabel = payloadArray.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payloadArray.map((item, index) => {
          const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor: string | undefined =
            (color as string | undefined) ??
            (item.payload?.fill as string | undefined) ??
            (item.color as string | undefined);

          return (
            <div
              key={item.dataKey as React.Key}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center",
              )}
            >
              {formatter != null &&
              item?.value !== undefined &&
              item.name != null ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
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
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center",
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label ?? item.name}
                      </span>
                    </div>
                    {item.value != null && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {(item.value as number).toLocaleString()}
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

const ChartLegend = RechartsPrimitive.Legend;

type LegendContentProps = React.ComponentProps<"div"> & {
  hideIcon?: boolean;
  payload?: PrimitivePayload[];
  verticalAlign?: "top" | "middle" | "bottom";
  nameKey?: string;
};

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: LegendContentProps) {
  const { config } = useChart();
  const legendItems = (payload as Array<Record<string, any>> | undefined) ?? [];

  if (!legendItems.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {legendItems.map((item) => {
        const key = `${nameKey ?? item.dataKey ?? "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value as React.Key}
            className={cn(
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3",
            )}
          >
            {itemConfig?.icon != null && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color as string,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: PrimitivePayload,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload: Record<string, unknown> | undefined =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? (payload.payload as Record<string, unknown>)
      : undefined;

  let configLabelKey: string = key;

  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key] as string;
  } else if (
    payloadPayload != null &&
    key in payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[key] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
