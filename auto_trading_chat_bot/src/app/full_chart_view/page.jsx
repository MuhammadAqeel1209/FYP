"use client";

import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function LiveCandlestick() {
  const chartContainerRef = useRef(null);
  const candlestickSeriesRef = useRef(null);

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

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#10b981", // Tailwind green-500
      downColor: "#ef4444", // Tailwind red-500
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Fetch historical data for the past year
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(
          "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=365"
        );
        const data = await response.json();

        const formattedData = data.map((item) => ({
          time: item[0] / 1000, // Convert milliseconds to seconds
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
        }));

        candlestickSeries.setData(formattedData);
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    };

    fetchHistoricalData();

    // Connect to Binance WebSocket for real-time data
    const ws = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const kline = data.k; // Kline data
      const candlestick = {
        time: kline.t / 1000, // Convert milliseconds to seconds
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
      };

      // Update the chart with real-time data
      candlestickSeries.update(candlestick);
    };

    // Resize chart on window resize
    const resizeChart = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });
    };
    window.addEventListener("resize", resizeChart);

    return () => {
      ws.close();
      chart.remove();
      window.removeEventListener("resize", resizeChart);
    };
  }, []);

  return (
    <div className="flex items-center justify-center bg-gray-100 w-screen h-screen">
      <div
        ref={chartContainerRef}
        className="w-full h-full bg-white rounded-lg shadow-lg"
      />
    </div>
  );
}
