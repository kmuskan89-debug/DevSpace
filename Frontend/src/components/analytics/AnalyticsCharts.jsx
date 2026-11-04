import React, { useState } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

/**
 * Donut / Pie Chart for Categorical Distributions (Status, Priority, Type)
 */
export function DonutChart({
  data = [],
  title = '',
  totalLabel = 'Total',
  size = 170,
  strokeWidth = 22,
  emptyMessage = 'No distribution data available'
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const validData = data.filter((d) => typeof d.value === 'number' && d.value > 0);
  const total = validData.reduce((acc, d) => acc + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-44 border border-dashed border-[#E8E8E5] dark:border-[#353535] rounded-lg">
        <AlertCircle className="w-5 h-5 text-[#999999] dark:text-[#666666] mb-1.5" />
        <p className="text-xs text-[#777777] dark:text-[#A0A0A0] font-medium">{emptyMessage}</p>
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 p-1">
      {/* SVG Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-[#F1F1EF] dark:text-[#2A2A2A]"
          />
          {validData.map((item, index) => {
            const percentage = item.value / total;
            const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += circumference * percentage;
            const isHovered = hoveredIdx === index;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color || '#252525'}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Summary Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-lg font-bold font-mono text-[#252525] dark:text-[#F2F2F2] leading-tight">
            {hoveredIdx !== null ? validData[hoveredIdx].value : total}
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#777777] dark:text-[#A0A0A0]">
            {hoveredIdx !== null ? validData[hoveredIdx].label : totalLabel}
          </span>
        </div>
      </div>

      {/* Legend with Values & Percentages */}
      <div className="space-y-1 min-w-[130px] w-full sm:w-auto">
        {title && (
          <h5 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0] my-0 mb-1.5">
            {title}
          </h5>
        )}
        {validData.map((item, i) => {
          const pct = Math.round((item.value / total) * 100);
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between text-xs px-2 py-1 rounded-md transition-colors cursor-pointer ${
                isHovered
                  ? 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] font-semibold'
                  : 'text-[#555555] dark:text-[#B0B0B0] hover:bg-[#F7F7F5] dark:hover:bg-[#242424]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] ml-2 shrink-0">
                <span className="text-[#252525] dark:text-[#F2F2F2] font-medium">{item.value}</span>
                <span className="text-[#999999] dark:text-[#666666] w-7 text-right">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Horizontal Progress Comparison Bar Chart
 */
export function HorizontalBarChart({
  items = [],
  emptyMessage = 'No distribution data'
}) {
  if (!items || items.length === 0) {
    return <p className="text-xs text-[#777777] dark:text-[#A0A0A0] py-4 text-center">{emptyMessage}</p>;
  }

  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const percentage = Math.round((item.value / maxValue) * 100);

        return (
          <div key={i} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#252525] dark:text-[#F2F2F2] truncate max-w-[200px]">
                {item.label}
              </span>
              <span className="font-mono text-[#777777] dark:text-[#A0A0A0] text-[11px]">
                {item.value} {item.unit || ''}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F1F1EF] dark:bg-[#2A2A2A] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color || '#252525'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 14-Day Velocity & Completion Trend Chart
 */
export function TrendLineChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-44 border border-dashed border-[#E8E8E5] dark:border-[#353535] rounded-lg">
        <AlertCircle className="w-5 h-5 text-[#999999] dark:text-[#666666] mb-1.5" />
        <p className="text-xs text-[#777777] dark:text-[#A0A0A0] font-medium">No trend data available for this range</p>
      </div>
    );
  }

  const height = 150;
  const width = 480;
  const padding = 26;

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.completed || 0, d.created || 0)),
    3
  );

  const getX = (idx) => padding + (idx / Math.max(1, data.length - 1)) * (width - 2 * padding);
  const getY = (val) => height - padding - (val / maxVal) * (height - 2 * padding);

  const completedPoints = data.map((d, i) => `${getX(i)},${getY(d.completed || 0)}`).join(' ');
  const createdPoints = data.map((d, i) => `${getX(i)},${getY(d.created || 0)}`).join(' ');

  return (
    <div className="space-y-3">
      {/* Legend Header */}
      <div className="flex items-center justify-between text-xs pb-1">
        <span className="font-semibold text-[#252525] dark:text-[#F2F2F2]">14-Day Velocity Trend</span>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-[#15803D] dark:text-[#34D399]">
            <span className="w-2 h-2 rounded-full bg-[#15803D] dark:bg-[#34D399]" />
            <span>Completed</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#777777] dark:text-[#A0A0A0]">
            <span className="w-2 h-2 rounded-full bg-[#777777] dark:text-[#A0A0A0]" />
            <span>Created</span>
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible">
          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = height - padding - ratio * (height - 2 * padding);
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="currentColor"
                  className="text-[#E8E8E5] dark:text-[#303030]"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-[#999999] dark:fill-[#666666] font-mono"
                >
                  {Math.round(ratio * maxVal)}
                </text>
              </g>
            );
          })}

          {/* Created Line (dashed muted) */}
          <polyline
            fill="none"
            stroke="currentColor"
            className="text-[#999999] dark:text-[#666666]"
            strokeWidth="1.8"
            strokeDasharray="4 4"
            points={createdPoints}
          />

          {/* Completed Line (solid green) */}
          <polyline
            fill="none"
            stroke="currentColor"
            className="text-[#15803D] dark:text-[#34D399]"
            strokeWidth="2.2"
            strokeLinecap="round"
            points={completedPoints}
          />

          {/* Interactive dots & hover column */}
          {data.map((d, i) => {
            const x = getX(i);
            const yComp = getY(d.completed || 0);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={height - padding}
                    stroke="currentColor"
                    className="text-[#CCCCCC] dark:text-[#555555]"
                    strokeDasharray="2 2"
                  />
                )}
                <circle
                  cx={x}
                  cy={yComp}
                  r={isHovered ? 4.5 : 3}
                  className="fill-[#15803D] dark:fill-[#34D399] transition-all"
                />
                {/* Axis Labels */}
                {i % 2 === 0 && (
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    className="text-[9px] fill-[#999999] dark:fill-[#666666] font-mono"
                  >
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="mt-2 p-2 rounded-md bg-[#F7F7F5] dark:bg-[#1A1A1A] border border-[#E8E8E5] dark:border-[#353535] text-xs flex items-center justify-between font-mono">
            <span className="text-[#252525] dark:text-[#F2F2F2] font-semibold">
              {data[hoveredIdx].date} ({data[hoveredIdx].label})
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[#15803D] dark:text-[#34D399] font-medium">
                Completed: {data[hoveredIdx].completed}
              </span>
              <span className="text-[#777777] dark:text-[#A0A0A0]">
                Created: {data[hoveredIdx].created}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Sprint Burndown Chart
 * Plots Ideal (linearly decreasing committed work) vs Actual remaining work based on real completed dates
 */
export function BurndownChart({ burndown }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  if (!burndown || !burndown.hasBurndown) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-48 border border-dashed border-[#E8E8E5] dark:border-[#353535] rounded-lg space-y-2">
        <HelpCircle className="w-6 h-6 text-[#999999] dark:text-[#666666] mx-auto" />
        <h5 className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
          Burndown Tracking Unavailable
        </h5>
        <p className="text-xs text-[#777777] dark:text-[#A0A0A0] max-w-sm mx-auto leading-relaxed">
          {burndown?.reason || 'Burndown tracking requires an active sprint with estimated story points.'}
        </p>
      </div>
    );
  }

  const data = burndown.data || [];
  if (data.length === 0) {
    return (
      <p className="text-xs text-[#777777] dark:text-[#A0A0A0] py-6 text-center">
        No burndown data points recorded for this sprint cycle.
      </p>
    );
  }

  const height = 160;
  const width = 500;
  const padding = 30;

  const maxPoints = Math.max(
    ...data.map((d) => Math.max(d.ideal || 0, d.actual !== null ? d.actual : 0)),
    burndown.initialCommitment?.storyPoints || 1
  );

  const getX = (idx) => padding + (idx / Math.max(1, data.length - 1)) * (width - 2 * padding);
  const getY = (val) => height - padding - (val / maxPoints) * (height - 2 * padding);

  const actualData = data.filter((d) => d.actual !== null);
  const idealPoints = data.map((d, i) => `${getX(i)},${getY(d.ideal || 0)}`).join(' ');
  const actualPoints = actualData.map((d, i) => `${getX(i)},${getY(d.actual || 0)}`).join(' ');

  return (
    <div className="space-y-3">
      {/* Legend Header */}
      <div className="flex flex-wrap items-center justify-between text-xs gap-2 pb-1">
        <span className="font-semibold text-[#252525] dark:text-[#F2F2F2]">
          Story Points Burndown
        </span>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-[#777777] dark:text-[#A0A0A0]">
            <span className="w-3.5 h-0.5 bg-[#999999] border-b border-dashed" />
            <span>Ideal Burndown</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#252525] dark:text-[#F2F2F2]">
            <span className="w-2 h-2 rounded-full bg-[#252525] dark:bg-[#F2F2F2]" />
            <span>Actual Remaining</span>
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = height - padding - ratio * (height - 2 * padding);
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="currentColor"
                  className="text-[#E8E8E5] dark:text-[#303030]"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-[#999999] dark:fill-[#666666] font-mono"
                >
                  {Math.round(ratio * maxPoints)} pts
                </text>
              </g>
            );
          })}

          {/* Ideal line (dashed) */}
          <polyline
            fill="none"
            stroke="currentColor"
            className="text-[#999999] dark:text-[#666666]"
            strokeWidth="1.8"
            strokeDasharray="4 4"
            points={idealPoints}
          />

          {/* Actual line (solid) */}
          {actualData.length > 0 && (
            <polyline
              fill="none"
              stroke="currentColor"
              className="text-[#252525] dark:text-[#F2F2F2]"
              strokeWidth="2.2"
              strokeLinecap="round"
              points={actualPoints}
            />
          )}

          {/* Actual data dots */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredDay === i;
            const hasActual = d.actual !== null;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredDay(i)}
                onMouseLeave={() => setHoveredDay(null)}
                className="cursor-pointer"
              >
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={height - padding}
                    stroke="currentColor"
                    className="text-[#CCCCCC] dark:text-[#555555]"
                    strokeDasharray="2 2"
                  />
                )}
                {hasActual && (
                  <circle
                    cx={x}
                    cy={getY(d.actual)}
                    r={isHovered ? 4.5 : 3}
                    className="fill-[#252525] dark:fill-[#F2F2F2] transition-all"
                  />
                )}
                {/* Day Labels */}
                {(i === 0 || i === data.length - 1 || i % 3 === 0) && (
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    className="text-[9px] fill-[#999999] dark:fill-[#666666] font-mono"
                  >
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredDay !== null && data[hoveredDay] && (
          <div className="mt-2 p-2 rounded-md bg-[#F7F7F5] dark:bg-[#1A1A1A] border border-[#E8E8E5] dark:border-[#353535] text-xs flex items-center justify-between font-mono">
            <span className="text-[#252525] dark:text-[#F2F2F2] font-semibold">
              Day {data[hoveredDay].day} ({data[hoveredDay].label})
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[#777777] dark:text-[#A0A0A0]">
                Ideal: {data[hoveredDay].ideal} pts
              </span>
              <span className="text-[#252525] dark:text-[#F2F2F2] font-bold">
                Actual: {data[hoveredDay].actual !== null ? `${data[hoveredDay].actual} pts` : 'Pending'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default {
  DonutChart,
  HorizontalBarChart,
  TrendLineChart,
  BurndownChart
};
