import React from "react";
import { scaleLinear } from "d3-scale";

//handle pattern

type Props = {
  margin: { top?: number; bottom?: number; left?: number };
  barHeight?: number;
  rExtent?: [number, number];
  oAccessor: (d: any) => string;
  oLabel: (d: any, o: string, r: number) => string | JSX.Element;
  rAccessor: (d: any) => number;
  bar?: (d: any, width: number | string | undefined) => JSX.Element;
  oPadding?: number;
  foregroundGraphics?: JSX.Element | JSX.Element[];
  data?: any[];
  onBarClick?: (id: string) => {} | React.Dispatch<string> | undefined | void;
};

export default function BarChart(props: Props) {
  const {
    data = [],
    rAccessor,
    oAccessor,
    margin = {} as Props["margin"],
    oLabel,
    bar,
    oPadding = 3,
    barHeight = 45,
    foregroundGraphics,
    onBarClick,
    rExtent
  } = props;

  const max = data.reduce((p, c) => {
    const r = rAccessor(c);
    if (r > p) p = r;
    return p;
  }, 0);

  const percentScale = scaleLinear()
    .domain(rExtent || [0, max || 1])
    .range([0, 100]);

  return (
    <div className="bar-chart relative">
      {foregroundGraphics && (
        <svg
          style={{
            position: "absolute",
            width: "100%",
            top: 0,
            height:
              (margin.top || 0) + (margin.bottom || 0) + barHeight * data.length
          }}
        >
          {foregroundGraphics}
        </svg>
      )}
      <div style={{ paddingTop: margin.top }}>
        {data.map(d => {
          const o = oAccessor(d);
          const r = rAccessor(d);
          return (
            <div
              className={`flex ${(onBarClick && "pointer") || ""}`}
              onClick={onBarClick && (() => onBarClick(d.id))}
              style={{
                height: barHeight,
                padding: oPadding
              }}
              key={o}
            >
              <div style={{ width: margin.left }}>
                {oLabel && oLabel(d, o, r)}
              </div>
              <div style={{ flexGrow: 1, height: "100%" }}>
                {bar && bar(d, `${Math.round(percentScale(r))}%`)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
