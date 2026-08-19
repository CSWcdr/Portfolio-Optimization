import React from "react";
import { useState } from "react";
import axios from "axios";
import StockSearch from "../components/StockSearch";
import { ArrowRight } from "lucide-react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function SentimentBasedAllocation() {
	const [selectedStocks, setSelectedStocks] = useState([]);
	const [result, setResult] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleAnalyze = async () => {
		if (selectedStocks.length === 0) return;
		setIsLoading(true);
		console.log(`selected stocks are ${selectedStocks}`);
		
		const tickers = selectedStocks.map((stock: any) => stock?.value);
		console.log(`selected tickers are ${tickers}`);

		try {
			const response = await axios.post(
				`http://localhost:${
					import.meta.env.VITE_PORT
				}/sentiment-optimized-allocation`,
				{ tickers }
			);
			setResult(response.data);
		} catch (error) {
			console.error("Error fetching sentiment-based allocation:", error);
		}
		setIsLoading(false);
	};

	const pieData = result?.allocation && {
		labels: Object.keys(result.allocation),
		datasets: [
			{
				data: (Object.values(result.allocation) as number[]).map((v) =>
					parseFloat((v * 100).toFixed(2))
				),
				backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
				borderWidth: 1,
			},
		],
	};

	return (
		<div className="flex flex-col items-center p-8 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen space-y-6 text-white">
			<h1 className="text-4xl font-bold">
				Sentiment-Based Portfolio Optimizer
			</h1>

			<div className="w-full max-w-lg">
				<StockSearch setSelectedStocks={setSelectedStocks} />
			</div>

			<button
				className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all space-x-2"
				onClick={handleAnalyze}
			>
				<span>
					{isLoading ? "Analyzing..." : "Run Sentiment Allocation"}
				</span>
				<ArrowRight className="h-5 w-5" />
			</button>

			{result && (
				<div className="w-full max-w-4xl space-y-8 mt-6">
					{/* Allocation Pie Chart */}
					<div className="bg-gray-800 p-6 rounded-lg shadow-md">
						<h2 className="text-2xl font-semibold mb-4">
							Allocation Breakdown
						</h2>
						{pieData && <Pie data={pieData} />}
						<ul className="mt-4 space-y-1 text-gray-300">
							{Object.entries(result.allocation).map(
								([stock, weight]) => (
									<li key={stock}>
										{stock}:{" "}
										<span className="text-white font-semibold">
											{((weight as number) * 100).toFixed(
												2
											)}
											%
										</span>
									</li>
								)
							)}
						</ul>
					</div>

					{/* Sentiment Scores and BL Returns */}
					<div className="flex flex-col md:flex-row gap-6">
						<div className="flex-1 bg-gray-800 p-4 rounded-lg shadow-md">
							<h3 className="text-lg font-semibold">
								Sentiment Scores
							</h3>
							<ul className="mt-2 space-y-1 text-gray-300">
								{Object.entries(result.sentiment_scores).map(
									([stock, score]) => (
										<li key={stock}>
											{stock}:{" "}
											<span className="text-white">
												{(score as number).toFixed(3)}
											</span>
										</li>
									)
								)}
							</ul>
						</div>
						<div className="flex-1 bg-gray-800 p-4 rounded-lg shadow-md">
							<h3 className="text-lg font-semibold">
								Black–Litterman Returns
							</h3>
							<ul className="mt-2 space-y-1 text-gray-300">
								{Object.entries(
									result.black_litterman_returns
								).map(([stock, val]) => (
									<li key={stock}>
										{stock}:{" "}
										<span className="text-white">
											{((val as number) * 100).toFixed(2)}%
										</span>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Portfolio Metrics */}
					<div className="bg-gray-800 p-4 rounded-lg shadow-md">
						<h3 className="text-xl font-semibold mb-2">
							Portfolio Metrics
						</h3>
						<ul className="space-y-1 text-gray-300">
							{Object.entries(result.metrics).map(
								([metric, val]) => (
									<li key={metric}>
										{metric}:{" "}
										<span className="text-white">
											{((val as number) * 100).toFixed(2)}%
										</span>
									</li>
								)
							)}
						</ul>
					</div>

					{/* Explanation */}
					<div className="bg-gray-800 p-4 rounded-lg shadow-md">
						<h3 className="text-xl font-semibold mb-2">
							Explanation
						</h3>
						<p className="text-gray-300">{result.explanation}</p>
					</div>

					{/* LLM Interpretation (if any) */}
					{result.llm_interpretation && (
						<div className="bg-gray-800 p-4 rounded-lg shadow-md">
							<h3 className="text-xl font-semibold mb-2">
								LLM Interpretation
							</h3>
							<p className="text-gray-300 whitespace-pre-wrap">
								{result.llm_interpretation}
							</p>
						</div>
					)}

					{/* Pareto Plot */}
					<div className="bg-gray-800 p-4 rounded-lg shadow-md">
						<h3 className="text-xl font-semibold mb-2">
							Pareto Front
						</h3>
						<img
							src={`data:image/png;base64,${result.pareto_plot_base64}`}
							alt="Pareto Front Plot"
							className="w-full rounded-lg"
						/>
					</div>
				</div>
			)}
		</div>
	);
}

export default SentimentBasedAllocation;
