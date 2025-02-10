import React from 'react'
import LiveCharts from "../app/Components/LiveChart";

function Chart() {
  return (
    <div>
      <div className="text-center my-12">
      <h1 className="text-3xl font-bold mb-8">Live BTC/USDT Price Chart</h1>
      <LiveCharts />
    </div>
    </div>
  )
}

export default Chart
