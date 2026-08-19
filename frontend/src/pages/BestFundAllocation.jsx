import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { createChart, BaselineSeries } from "lightweight-charts";
import { ArrowRight } from "lucide-react";
import StockSearch from "../components/StockSearch";
import { Button } from "../components/commons/Button";
// import { Pie } from "react-chartjs-2";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
// ChartJS.register(ArcElement, Tooltip, Legend);
function BestFundAllocation() {
	const [selectedStocks, setSelectedStocks] = useState([]);
	const [historicalData, setHistoricalData] = useState({});
	const [futurePrices, setFuturePrices] = useState({});
	const [activeStock, setActiveStock] = useState(null);
	const [allocations, setAllocations] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const chartContainerRef = useRef(null);
	let chart;

	useEffect(() => {
		if (activeStock && historicalData[activeStock]) {
			renderChart(activeStock);
		}
	}, [activeStock, historicalData, futurePrices]);

	const handleBestAllocation = async () => {
		setIsLoading(true);
		if (selectedStocks.length === 0) return;
		const tickers = selectedStocks.map((stock) => stock.value);
		try {
			const response = await axios.post(
				`http://localhost:${
					import.meta.env.VITE_PORT
				}/optimize-portfolio`,
				{ tickers }
			);
			console.log(response);

			setAllocations(response.data);
			setFuturePrices(response.data.FuturePrices);
		} catch (error) {
			console.error("Error optimizing portfolio:", error);
		}
		setIsLoading(false);
	};

	const fetchHistoricalData = async () => {
		if (selectedStocks.length === 0) return;

		const tickers = selectedStocks.map((stock) => stock.value);
		try {
			const response = await axios.post(
				`http://localhost:${import.meta.env.VITE_PORT}/historical-data`,
				{ tickers }
			);
			setHistoricalData(response.data);
			if (tickers.length > 0) setActiveStock(tickers[0]);
		} catch (error) {
			console.error("Error fetching historical data:", error);
		}
	};

	const renderChart = (ticker) => {
		if (chartContainerRef.current) {
			chartContainerRef.current.innerHTML = "";
			chart = createChart(chartContainerRef.current, {
				width: 1000,
				height: 500,
				layout: {
					background: { color: "#111827" }, // Deep dark gray for consistency
					textColor: "#E5E7EB", // Light gray text for readability
				},
				grid: {
					vertLines: { color: "#1F2937" }, // Subtle grid lines
					horzLines: { color: "#1F2937" },
				},
				crosshair: {
					vertLine: { color: "#4B5563", width: 1 }, // Softer crosshair lines
					horzLine: { color: "#4B5563", width: 1 },
				},
				timeScale: {
					borderColor: "#374151", // Slightly lighter border for time axis
				},
				rightPriceScale: {
					borderColor: "#374151",
				},
			});

			const lineSeries = chart.addSeries(BaselineSeries, {
				baseValue: { type: "price", price: 0 },
				topLineColor: "#3B82F6", // Blue for rising prices
				bottomLineColor: "#EF4444", // Red for declining prices
				lineWidth: 2,
			});

			if (historicalData[ticker]) {
				const chartData = historicalData[ticker].map((point) => ({
					time: point.date,
					value: point.close,
				}));
				lineSeries.setData(chartData);
			}

			if (futurePrices[ticker]) {
				const futureSeries = chart.addSeries(BaselineSeries, {
					baseValue: { type: "price", price: 0 },
					topLineColor: "#10B981", // Green for future projections
					bottomLineColor: "#F59E0B", // Amber for warning zones
					lineWidth: 2,
					lineStyle: 2, // Dashed future prices for distinction
				});

				const lastDate = historicalData[ticker]?.slice(-1)[0]?.date;
				const startDate = new Date(lastDate);
				const futureChartData = futurePrices[ticker].map(
					(point, index) => ({
						time: new Date(
							startDate.getTime() +
								(index + 1) * 24 * 60 * 60 * 1000
						)
							.toISOString()
							.split("T")[0],
						value: point,
					})
				);
				futureSeries.setData(futureChartData);
			}
		}
	};
	const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

	const formatAllocationData = (allocation) => {
		return Object.entries(allocation).map(([asset, value]) => ({
			name: asset,
			value: parseFloat((value * 100).toFixed(6)), // Convert to %
		}));
	};

	const PieChartCard = ({ title, data }) => (
		<div className="p-4">
			<h2 className="text-center font-semibold">{title}</h2>
			<PieChart width={300} height={250}>
				<Pie
					dataKey="value"
					isAnimationActive={false}
					data={data}
					cx="50%"
					cy="50%"
					outerRadius={80}
					label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
				>
					{data.map((_, index) => (
						<Cell
							key={`cell-${index}`}
							fill={COLORS[index % COLORS.length]}
						/>
					))}
				</Pie>
				<Tooltip />
				<Legend />
			</PieChart>
		</div>
	);

	return (
		<div className="flex flex-col items-center p-8 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen space-y-6 text-white">
			<h1 className="text-4xl font-extrabold tracking-tight">
				Portfolio Optimizer
			</h1>

			<div className="w-full max-w-lg">
				<StockSearch setSelectedStocks={setSelectedStocks} />
			</div>

			<button
				className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all"
				onClick={fetchHistoricalData}
			>
				Get Market Data
			</button>

			{selectedStocks.length > 0 && (
				<div className="flex flex-col flex-wrap justify-center gap-3 items-center mx-auto">
					<div className="flex gap-2 items-center">
						{selectedStocks.map((stock) => (
							<button
								key={stock.value}
								className={`px-4 py-2 rounded-lg font-medium transition-all shadow-md ${
									activeStock === stock.value
										? "bg-blue-700 text-white"
										: "bg-gray-700 hover:bg-gray-600"
								}`}
								onClick={() => setActiveStock(stock.value)}
							>
								{stock.label}
							</button>
						))}
					</div>
					<div
						ref={chartContainerRef}
						className="w-full max-w-5xl bg-gray-800 p-4 rounded-lg shadow-md"
					></div>
				</div>
			)}

			<button
				className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all space-x-2"
				onClick={handleBestAllocation}
			>
				<span>
					{isLoading
						? "Fetching optimized results ..."
						: "Find Best Allocation"}
				</span>
				<ArrowRight className="h-5 w-5" />
			</button>

			{allocations && (
				<div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg">
					<h2 className="text-2xl font-semibold text-white">
						Optimal Fund Allocation
					</h2>
					{Object.entries(allocations).map(
						([algo, data]) =>
							algo !== "FuturePrices" && (
								<div
									key={algo}
									className="mt-4 border-t border-gray-600 pt-4"
								>
									<h3 className="text-lg font-medium text-gray-300">
										{algo.toUpperCase()} Allocation
										(Confidence:{" "}
										{data.confidence.toFixed(2)}%)
									</h3>
									<ul className="mt-2 space-y-1 text-gray-400">
										{Object.entries(data.allocation).map(
											([stock, percentage]) => (
												<li
													key={stock}
													className="text-md"
												>
													{stock}:{" "}
													<span className="font-medium text-white">
														{(
															percentage * 100
														).toFixed(2)}
														%
													</span>
												</li>
											)
										)}
									</ul>
								</div>
							)
					)}
					<div className="mt-6">
						<h3 className="text-xl font-semibold text-white mb-2">
							Allocation Breakdown
						</h3>
						<div className="flex flex-wrap justify-center gap-4">
							<PieChartCard
								title="NSGA-II Allocation"
								data={formatAllocationData(
									allocations.nsga2.allocation
								)}
							/>
							<PieChartCard
								title="MOEA/D Allocation"
								data={formatAllocationData(
									allocations.moead.allocation
								)}
							/>
							<PieChartCard
								title="NSGA-III Allocation"
								data={formatAllocationData(
									allocations.nsga3.allocation
								)}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default BestFundAllocation;
