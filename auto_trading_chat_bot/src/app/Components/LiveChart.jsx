"use client";
import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import Link from 'next/link';

export default function LiveCandlestick() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [chartType, setChartType] = useState("candlestick");
  const [timeframe, setTimeframe] = useState("1D");
  const [selectedCrypto, setSelectedCrypto] = useState("BTCUSDT");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coin, setCoin] = useState("Bitcoin");
  const [amount, setAmount] = useState("");
  const [trades, setTrades] = useState("");
  const [isSequential, setIsSequential] = useState(false);
  const [isParallel, setIsParallel] = useState(false);

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
    if (!chartContainerRef.current) return; // ✅ Prevent creating chart if ref is null

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { backgroundColor: "#ffffff", textColor: "#000000" },
      grid: { vertLines: { color: "#e5e7eb" }, horzLines: { color: "#e5e7eb" } },
      priceScale: { borderColor: "#d1d5db" },
      timeScale: { borderColor: "#d1d5db" },
    });

    chartRef.current = chart;

    const loadSeries = async () => {
      const intervalMap = { "1D": "1h", "1M": "1d", "3M": "1w", "1Y": "1w" };
      const data = await fetchHistoricalData(intervalMap[timeframe], selectedCrypto);

      if (!chart) return; // ✅ Prevent error if chart is not initialized

      if (chartType === "candlestick") {
        seriesRef.current = chart.addCandlestickSeries({
          upColor: "#10b981",
          downColor: "#ef4444",
          borderVisible: false,
          wickUpColor: "#10b981",
          wickDownColor: "#ef4444",
        });
      } else {
        seriesRef.current = chart.addAreaSeries({
          topColor: "rgba(33, 150, 243, 0.3)",
          bottomColor: "rgba(33, 150, 243, 0.1)",
          lineColor: "rgba(33, 150, 243, 1)",
        });
      }

      if (seriesRef.current) {
        seriesRef.current.setData(
          chartType === "candlestick"
            ? data
            : data.map(({ time, close }) => ({ time, value: close }))
        );
      }
    };

    loadSeries();

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedCrypto.toLowerCase()}@kline_1m`);
    const isMounted = { current: true };

    ws.onmessage = (event) => {
      if (!isMounted.current || !seriesRef.current) return;

      const data = JSON.parse(event.data);
      const kline = data.k;
      const candlestick = {
        time: kline.t / 1000,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
      };

      seriesRef.current.update(
        chartType === "candlestick"
          ? candlestick
          : { time: candlestick.time, value: candlestick.close }
      );
    };

    return () => {
      isMounted.current = false;
      ws.close();
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null; // ✅ Cleanup to avoid referencing an undefined object
    };
  }, [timeframe, selectedCrypto, chartType]);

  const handleTradeClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleLaunchTrade = () => {
    alert(`Trade Launched: ${coin}, Amount: ${amount}, Trades: ${trades}, Sequential: ${isSequential}, Parallel: ${isParallel}`);
    setIsModalOpen(false);
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="flex justify-between w-full p-4">
        <div>
          {["1D", "1M", "3M", "1Y"].map((tf) => (
            <button key={tf} onClick={() => setTimeframe(tf)} className={`px-4 py-2 m-1 ${timeframe === tf ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
              {tf}
            </button>
          ))}
        </div>
        <div>
          <button onClick={() => setChartType(chartType === "candlestick" ? "area" : "candlestick")} className="px-4 py-2 m-1 bg-gray-200">
            {chartType === "candlestick" ? "Area Chart" : "Candlestick"}
          </button>
          <Link href="/full_chart_view">
            <button className="px-4 py-2 m-1 bg-gray-200">Go to Full Chart View</button>
          </Link>
        </div>
      </div>

      <div className="flex justify-center space-x-4 p-4">
        {[{ name: "Bitcoin", symbol: "BTCUSDT" }, { name: "Ethereum", symbol: "ETHUSDT" }, { name: "Solana", symbol: "SOLUSDT" }].map(({ name, symbol }) => (
          <button key={symbol} onClick={() => setSelectedCrypto(symbol)} className={`px-4 py-2 rounded-lg ${selectedCrypto === symbol ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
            {name}
          </button>
        ))}
      </div>

      <div ref={chartContainerRef} style={{ height: "400px", width: "100%" }} className="w-full bg-white rounded-lg shadow-lg" />

      <button onClick={handleTradeClick} className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600">
        Trade &gt;
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Launch Trade</h3>
            <input type="number" className="w-full p-2 border" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
            <div className="flex justify-between mt-4">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-300">Close</button>
              <button onClick={handleLaunchTrade} className="px-4 py-2 bg-blue-500 text-white">Launch Trade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
