"use client";
import { useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { getApiUsageStats, formatApiUsageStats } from "@/services/statService";
import { PieChart, Activity, Clock, TrendingUp } from "lucide-react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Define types for chart data
interface DailyUsageData {
  date: string;
  calls: number;
}
interface HourlyUsageData {
  formattedHour: string;
  calls: number;
}
interface StatusCodeData {
  statusCode: string;
  count: number;
}
interface MethodData {
  method: string;
  count: number;
}
interface EndpointData {
  endpoint: string;
  count: number;
  percentage: number;
}
interface ApiStats {
  dailyUsageChart: DailyUsageData[];
  hourlyUsageChart: HourlyUsageData[];
  statusCodeChart: StatusCodeData[];
  methodsChart: MethodData[];
  topEndpoints: EndpointData[];
  totalCalls: number;
  successRate: number;
  errorRate: number;
  averageResponseTime: number;
}

export default function StatisticsChart() {
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stats = await getApiUsageStats();
        const formatted = formatApiUsageStats(stats);
         const fixedTopEndpoints: EndpointData[] = (formatted.topEndpoints || []).map(
          (ep: { endpoint: string; count: number; percentage: string }) => ({
            endpoint: ep.endpoint || '',
            count: typeof ep.count === 'string' ? Number(ep.count) : (ep.count ?? 0),
            percentage: typeof ep.percentage === 'string' ? Number(ep.percentage) : (ep.percentage ?? 0),
          })
        );
        setApiStats({
          ...formatted,
          topEndpoints: fixedTopEndpoints,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch API usage stats"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Chart configs
  const dailyOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 220,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#0ea5e9"], // cyan-500
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: apiStats?.dailyUsageChart.map((d: DailyUsageData) => d.date) || [],
      labels: { rotate: -45 },
    },
    yaxis: { title: { text: "API Calls" } },
    grid: { yaxis: { lines: { show: true } } },
    tooltip: { enabled: true },
    legend: { show: false },
  };
  const dailySeries = [
    {
      name: "API Calls",
      data: apiStats?.dailyUsageChart.map((d: DailyUsageData) => d.calls) || [],
    },
  ];

  const hourlyOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 180,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#38bdf8"], // cyan-400
    plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: apiStats?.hourlyUsageChart.map((d: HourlyUsageData) => d.formattedHour) || [],
    },
    yaxis: { title: { text: "API Calls" } },
    grid: { yaxis: { lines: { show: true } } },
    tooltip: { enabled: true },
    legend: { show: false },
  };
  const hourlySeries = [
    {
      name: "API Calls",
      data: apiStats?.hourlyUsageChart.map((d: HourlyUsageData) => d.calls) || [],
    },
  ];

  const statusOptions: ApexOptions = {
    chart: {
      type: "pie",
      height: 220,
      fontFamily: "Outfit, sans-serif",
    },
    labels: apiStats?.statusCodeChart.map((s: StatusCodeData) => s.statusCode) || [],
    colors: ["#0ea5e9", "#facc15", "#ef4444", "#64748B"], // cyan, yellow, red, gray
    legend: { show: true, position: "bottom" },
    tooltip: { enabled: true },
  };
  const statusSeries = apiStats?.statusCodeChart.map((s: StatusCodeData) => s.count) || [];

  const methodOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 180,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#0ea5e9", "#38bdf8", "#facc15", "#ef4444"], // cyan, cyan-light, yellow, red
    plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: apiStats?.methodsChart.map((m: MethodData) => m.method) || [],
    },
    yaxis: { title: { text: "API Calls" } },
    grid: { yaxis: { lines: { show: true } } },
    tooltip: { enabled: true },
    legend: { show: false },
  };
  const methodSeries = [
    {
      name: "API Calls",
      data: apiStats?.methodsChart.map((m: MethodData) => m.count) || [],
    },
  ];

  // Summary cards
  const summaryCards =
    apiStats && !loading && !error && (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl bg-cyan-50 dark:bg-cyan-900/20 p-4 flex items-center gap-4">
          <Activity className="w-8 h-8 text-cyan-500" />
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {apiStats.totalCalls}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total API Calls
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-cyan-100 dark:bg-cyan-800/20 p-4 flex items-center gap-4">
          <TrendingUp className="w-8 h-8 text-cyan-600" />
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {apiStats.successRate}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Success Rate
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 flex items-center gap-4">
          <PieChart className="w-8 h-8 text-red-500" />
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {apiStats.errorRate}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Error Rate
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 p-4 flex items-center gap-4">
          <Clock className="w-8 h-8 text-yellow-500" />
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {apiStats.averageResponseTime} ms
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Avg. Response Time
            </div>
          </div>
        </div>
      </div>
    );

  // Top endpoints table
  const endpointsTable = apiStats && (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] mt-6">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/40">
            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
              Endpoint
            </th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
              Calls
            </th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
              % of Total
            </th>
          </tr>
        </thead>
        <tbody>
          {apiStats.topEndpoints.map((ep: EndpointData) => (
            <tr
              key={ep.endpoint}
              className="border-t border-gray-100 dark:border-gray-800"
            >
              <td className="px-4 py-2 font-mono text-blue-700 dark:text-blue-300">
                {ep.endpoint}
              </td>
              <td className="px-4 py-2">{ep.count}</td>
              <td className="px-4 py-2">{ep.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full max-w-none rounded-2xl border border-gray-200 bg-white px-0 pb-8 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-0 sm:pt-6">
      <div className="mb-6 px-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          API Usage Dashboard
        </h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Comprehensive API usage and performance metrics
        </p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400 animate-pulse">
          Loading API usage data...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-48 text-red-500 dark:text-red-400">
          {error}
        </div>
      ) : (
        <>
          {summaryCards}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 px-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] p-4">
              <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-2">
                Daily API Calls
              </h4>
              <ReactApexChart
                options={dailyOptions}
                series={dailySeries}
                type="area"
                height={220}
              />
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] p-4">
              <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-2">
                Hourly API Calls
              </h4>
              <ReactApexChart
                options={hourlyOptions}
                series={hourlySeries}
                type="bar"
                height={180}
              />
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] p-4">
              <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-2">
                Status Codes
              </h4>
              <ReactApexChart
                options={statusOptions}
                series={statusSeries}
                type="pie"
                height={220}
              />
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] p-4">
              <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-2">
                HTTP Methods
              </h4>
              <ReactApexChart
                options={methodOptions}
                series={methodSeries}
                type="bar"
                height={180}
              />
            </div>
          </div>
          <div className="px-6">{endpointsTable}</div>
        </>
      )}
    </div>
  );
}
