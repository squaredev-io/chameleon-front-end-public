"use client";

import React from "react";
import { Text, View } from "@react-pdf/renderer";
import ReactPDFChart from "react-pdf-charts";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Scatter, ScatterChart, XAxis, YAxis } from "recharts";
import {
  cowLamenessContentTemplateFontStyles,
  pdfContentTailwind
} from "@/components/PDFReportGenerator/CowLamenessContentTemplate";

interface ScatterChartProps {
  data: Array<{ x: number; y: number; z?: number }>;
  height?: number;
  width?: number;
  xLabel?: string;
  yLabel?: string;
  xUnit?: string;
  yUnit?: string;
  fillColor?: string;
}

export const ScatterChartComponent: React.FC<ScatterChartProps> = (
  {
    data,
    height = 180,
    width = 180,
    xLabel = "x-axis",
    yLabel = "y-axis",
    xUnit = "",
    yUnit = "",
    fillColor = "#8884d8"
  }) => (
  <ReactPDFChart>
    <ScatterChart height={height} width={width}>
      <CartesianGrid />
      <XAxis type="number" dataKey="x" name={xLabel as string} unit={xUnit as string} />
      <YAxis type="number" dataKey="y" name={yLabel as string} unit={yUnit as string} />
      <Scatter name="Data Points" isAnimationActive={false} data={data} fill={fillColor} />
    </ScatterChart>
  </ReactPDFChart>
);

const PieChartDefaultColors = ["#FF8042", "#00C49F", "#FFBB28", "#0088FE"];

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  width?: number;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
}

export const PieChartComponent: React.FC<PieChartProps> = (
  {
    data,
    height = 108,
    width = 108,
    innerRadius = 32,
    outerRadius = 43,
    colors = PieChartDefaultColors
  }) => (
  data ? (
    <ReactPDFChart>
      <PieChart width={width} height={height}>
        <Pie
          isAnimationActive={false}
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius as number}
          outerRadius={outerRadius as number}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors && colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ReactPDFChart>
  ) : null
);

export interface PieChartLegendProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
}

export const PieChartLegend: React.FC<PieChartLegendProps> = (
  {
    data,
    colors = PieChartDefaultColors
  }) => (
  data ? (
    <View style={pdfContentTailwind("flex flex-row space-between items-center gap-4 mt-4")}>
      {
        data.map((entry, index) => (
          <View
            key={entry.name}
            style={pdfContentTailwind("flex flex-row space-between items-center")}
          >
            <View
              style={{
                width: 12,
                height: 12,
                marginRight: 4,
                gap: 4,
                backgroundColor: colors && colors[index % colors.length]
              }} />
            <Text style={cowLamenessContentTemplateFontStyles.subtitle}>{entry.name}</Text>
          </View>
        ))
      }
    </View>
  ) : null
);

export interface HistogramData {
  name: string;
  value: number;
}

interface HistogramProps {
  data: HistogramData[];
  width: number;
  height: number;
}

export const Histogram: React.FC<HistogramProps> = ({ data, width, height }) => {
  // Ensure data exists and is properly formatted
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <View style={{ height: 100 }}>
        <Text>No data available for histogram</Text>
      </View>
    );
  }

  // Create the most basic chart possible
  return (
    <ReactPDFChart>
      <BarChart
        width={width || 500}
        height={height || 250}
        data={data}
        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="name" />
        <YAxis />
        <Bar
          dataKey="value"
          fill="#8884d8"
          isAnimationActive={false}
          // Remove any extra props that might cause issues
        />
      </BarChart>
    </ReactPDFChart>
  );
};
