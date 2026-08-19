import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/commons/Button";
import ReactApexChart from "react-apexcharts";
import { motion } from "framer-motion";

const sectorOptions = [
	{ value: "basic-materials", label: "Basic Materials" },
	{ value: "communication-services", label: "Communication Services" },
	{ value: "consumer-cyclical", label: "Consumer Cyclical" },
	{ value: "consumer-defensive", label: "Consumer Defensive" },
	{ value: "energy", label: "Energy" },
	{ value: "financial-services", label: "Financial Services" },
	{ value: "healthcare", label: "Healthcare" },
	{ value: "industrials", label: "Industrials" },
	{ value: "real-estate", label: "Real Estate" },
	{ value: "technology", label: "Technology" },
	{ value: "utilities", label: "Utilities" },
];

const getRatingColor = (rating) => {
	switch (rating) {
		case "Strong Buy":
			return "#28a745";
		case "Buy":
			return "#007bff";
		case "Hold":
			return "#ffc107";
		default:
			return "#6c757d";
	}
};

function SectorWiseFundAllocation() {
	const [selectedSector, setSelectedSector] = useState(null);
	const [topIndustries, setTopIndustries] = useState({});
	const [loading, setLoading] = useState(false);
	const [treeMapData, setTreeMapData] = useState(null);

	const fetchTopIndustries = async () => {
		if (!selectedSector) return;
		setLoading(true);
		try {
			const response = await axios.post(
				`http://localhost:${import.meta.env.VITE_PORT}/top-industries`,
				{ sector: selectedSector.value }
			);
			setTopIndustries(response.data.industry);
		} catch (error) {
			console.error("Error fetching top industries:", error);
		}
		setLoading(false);
	};

	useEffect(() => {
		if (!topIndustries) return;

		const newTreeMapData = {
			series: [
				{
					data: Object.entries(topIndustries.name || {}).map(
						([key, companyName]) => {
							const rating = topIndustries["rating"][key];
							const marketWeight =
								topIndustries["market weight"][key];

							return {
								x: companyName,
								y: marketWeight * 1000000,
								fillColor: getRatingColor(rating),
							};
						}
					),
				},
			],
			options: {
				chart: {
					type: "treemap",
					height: 400,
					background: "transparent",
				},
				plotOptions: {
					treemap: {
						enableShades: true,
						depth: 2,
						flat: false,
					},
				},
				title: {
					text: `Top Companies in ${
						selectedSector ? selectedSector.label : "Sector"
					}`,
					style: {
						color: "#ffffff",
						fontSize: "20px",
						fontWeight: "bold",
					},
				},
				tooltip: {
					shared: true,
					intersect: false,
					custom: function ({ seriesIndex, dataPointIndex, w }) {
						const data =
							w.config.series[seriesIndex].data[dataPointIndex];
						return `<div class="apexcharts-tooltip-title text-black font-bold">${data.x}</div>
								<div class="text-black px-2 mt-2">Market Weight: ${(
									(data.y / 1000000) *
									100
								).toFixed(2)}%</div>
								<div class="text-black px-2 mb-2">Rating: ${
									topIndustries.rating[
										Object.entries(topIndustries.name).find(
											(item) => item[1] === data.x
										)[0]
									]
								}</div>`;
					},
				},
			},
		};

		setTreeMapData(newTreeMapData);
	}, [topIndustries]);

	return (
		<div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-10 space-y-10">
			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="text-4xl font-extrabold tracking-tight"
			>
				Sector-Wise Fund Allocation
			</motion.h1>

			<div className="flex space-x-4">
				<Select
					options={sectorOptions}
					placeholder="Select a Sector"
					className="w-80 text-black shadow-lg"
					value={selectedSector}
					onChange={setSelectedSector}
				/>
				<Button
					className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg rounded-lg shadow-lg transition-all"
					onClick={fetchTopIndustries}
					disabled={loading || !selectedSector}
				>
					{loading ? "Loading..." : "Find Top Industries"}
					<ArrowRight className="ml-2 h-5 w-5" />
				</Button>
			</div>

			{Object.keys(topIndustries).length > 0 && (
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="p-6 w-full max-w-5xl bg-gray-900 border border-gray-700 shadow-lg rounded-xl"
				>
					<h2 className="text-2xl font-semibold mb-4 text-white text-center">
						Top Sector-Wise Companies
					</h2>

					<div className="w-full h-96">
						<ReactApexChart
							options={treeMapData.options}
							series={treeMapData.series}
							type="treemap"
							height={350}
						/>
					</div>

					<div className="overflow-x-auto mt-6">
						<table className="min-w-full border border-gray-700 rounded-lg shadow-lg text-gray-300">
							<thead>
								<tr className="bg-gray-800 text-white">
									<th className="border border-gray-700 px-6 py-3">
										Symbol
									</th>
									<th className="border border-gray-700 px-6 py-3">
										Company Name
									</th>
									<th className="border border-gray-700 px-6 py-3">
										Rating
									</th>
									<th className="border border-gray-700 px-6 py-3">
										Market Weight
									</th>
								</tr>
							</thead>
							<tbody>
								{Object.entries(topIndustries.name).map(
									([key, companyName]) => {
										const rating =
											topIndustries.rating[key];
										const marketWeight =
											topIndustries["market weight"][key];

										return (
											<tr
												key={key}
												className="hover:bg-gray-800 transition-all"
											>
												<td className="border border-gray-700 px-6 py-3 text-center">
													{key}
												</td>
												<td className="border border-gray-700 px-6 py-3 text-center">
													{companyName}
												</td>
												<td
													className="border border-gray-700 px-6 py-3 text-center font-bold"
													style={{
														color: getRatingColor(
															rating
														),
													}}
												>
													{rating}
												</td>
												<td className="border border-gray-700 px-6 py-3 text-center">
													{(
														marketWeight * 100
													).toFixed(2)}
													%
												</td>
											</tr>
										);
									}
								)}
							</tbody>
						</table>
					</div>
				</motion.div>
			)}
		</div>
	);
}

export default SectorWiseFundAllocation;
