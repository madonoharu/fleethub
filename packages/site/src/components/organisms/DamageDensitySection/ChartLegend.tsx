import React from "react";
import { cn } from "../../../styles";

export interface LegendRow {
  /** 表示の on/off を覚えるための名前。 */
  id: string;
  label: string;
  /** 塗りの見本。棒の系列に付ける。 */
  fill?: string | undefined;
  /** 線の見本。累計確率に付ける。 */
  line?: string | undefined;
}

/** 凡例に取っておく高さ。中身で高さが変わると図が伸び縮みして見づらい。 */
export const LEGEND_HEIGHT = 22;

/**
 * 凡例の1項目。押すとその系列を消せることが分かるよう、
 * ホバーで下線を出す。カーソルの形だけでは気付けない。
 */
const LegendItem = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    {...props}
    className={cn(
      "flex items-center gap-1.5 cursor-pointer [border-bottom:1px_solid_transparent] [&:hover]:[border-bottom-color:currentColor]",
      className,
    )}
  />
);

interface Props {
  rows: LegendRow[];
  hidden: ReadonlySet<string>;
  onToggle: (id: string) => void;
}

/**
 * 凡例。どの表示でも、必ず1行で出す。
 *
 * 攻撃種類の数や比較の有無で項目が増減しても図の高さを変えないよう、
 * 折り返さず高さも固定する。押すとその系列を消せる。
 */
const ChartLegend: React.FC<Props> = ({ rows, hidden, onToggle }) => (
  <div className="flex flex-nowrap justify-center items-center gap-3 h-[22px] overflow-hidden text-[0.75rem] whitespace-nowrap">
    {rows.map((row) => (
      <LegendItem
        key={row.id}
        role="button"
        tabIndex={0}
        aria-pressed={!hidden.has(row.id)}
        onClick={() => onToggle(row.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onToggle(row.id);
        }}
        className={hidden.has(row.id) ? "opacity-35" : "opacity-100"}
      >
        <svg width={row.line ? 22 : 10} height={10} aria-hidden>
          {row.fill && <rect width={10} height={10} fill={row.fill} />}
          {row.line && (
            <line x1={row.fill ? 12 : 0} x2={22} y1={5} y2={5} stroke={row.line} strokeWidth={2} />
          )}
        </svg>
        <span>{row.label}</span>
      </LegendItem>
    ))}
  </div>
);

export default ChartLegend;
