"use client";
import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import Link from 'next/link';

export default function LiveCandlestick() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null); // Single ref for the series
  const [chartType, setChartType] = useState("candlestick");
  const [timeframe, setTimeframe] = useState("1D");
  const [selectedCrypto, setSelectedCrypto] = useState("BTCUSDT");

  const fetchHistoricalData = async (interval, symbol) => {
    const endpoint = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=365`;
    const response = await fetch(endpoint);
    const data = await response.json();

    return data.map(([time, open, high, low, close]) => ({
      time: time / 1000,
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      close: parseFloat(close),
    }));
  };

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
      },
      grid: {
        vertLines: { color: "#e5e7eb" },
        horzLines: { color: "#e5e7eb" },
      },
      priceScale: {
        borderColor: "#d1d5db",
      },
      timeScale: {
        borderColor: "#d1d5db",
      },
    });

    chartRef.current = chart; // Store the chart reference here

    const loadSeries = async () => {
      if (!chartRef.current) return; // Ensure the chart is initialized

      const intervalMap = { "1D": "1h", "1M": "1d", "3M": "1w", "1Y": "1w" };
      const data = await fetchHistoricalData(intervalMap[timeframe], selectedCrypto);

      if (chartType === "candlestick") {
        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: "#10b981",
          downColor: "#ef4444",
          borderVisible: false,
          wickUpColor: "#10b981",
          wickDownColor: "#ef4444",
        });
        seriesRef.current.setData(data);
      } else {
        seriesRef.current = chartRef.current.addAreaSeries({
          topColor: "rgba(33, 150, 243, 0.3)",
          bottomColor: "rgba(33, 150, 243, 0.1)",
          lineColor: "rgba(33, 150, 243, 1)",
        });
        seriesRef.current.setData(data.map(({ time, close }) => ({ time, value: close })));
      }
    };

    loadSeries();

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedCrypto.toLowerCase()}@kline_1m`);
    const isMounted = { current: true };

    ws.onmessage = (event) => {
      if (!isMounted.current) return;

      const data = JSON.parse(event.data);
      const kline = data.k;
      const candlestick = {
        time: kline.t / 1000,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
      };

      if (seriesRef.current) {
        seriesRef.current.update(
          chartType === "candlestick"
            ? candlestick
            : { time: candlestick.time, value: candlestick.close }
        );
      }
    };

    return () => {
      isMounted.current = false;
      ws.close();
      chart.remove();
    };
  }, [timeframe, selectedCrypto, chartType]); // Include chartType in the dependency array

  return (
    <div className="relative flex flex-col items-center">
      <div className="flex justify-between w-full p-4">
        <div>
          {["1D", "1M", "3M", "1Y"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 m-1 ${timeframe === tf ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              {tf}
            </button>
          ))}
        </div>
        <div>
          <button
            onClick={() => setChartType(chartType === "candlestick" ? "area" : "candlestick")}
            className="px-4 py-2 m-1 bg-gray-200"
          >
            {chartType === "candlestick" ? "Area Chart" : "Candlestick"}
          </button>
          <Link href="/full_chart_view">
            <button className="px-4 py-2 m-1 bg-gray-200">Go to Full Chart View</button>
          </Link>
        </div>
      </div>

      <div className="flex justify-center space-x-4 p-4">
        {[{ name: "Bitcoin", symbol: "BTCUSDT" }, { name: "Ethereum", symbol: "ETHUSDT" }, { name: "Solana", symbol: "SOLUSDT" }].map(({ name, symbol }) => (
          <button
            key={symbol}
            onClick={() => setSelectedCrypto(symbol)}
            className={`px-4 py-2 rounded-lg ${selectedCrypto === symbol ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {name}
          </button>
        ))}
      </div>

      <div ref={chartContainerRef} style={{ height: "400px", width: "100%" }} className="w-full bg-white rounded-lg shadow-lg" />
    </div>
  );
}
