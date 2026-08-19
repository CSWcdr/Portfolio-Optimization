import React, { useState } from "react";
import {
	ArrowRight,
	BarChart3,
	Briefcase,
	LineChart,
	Menu,
	X,
} from "lucide-react";
import { Button } from "../components/commons/Button";
import { Link } from "react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/home/Card";
import HomeImage from "../assets/pexels-pixabay-534216.jpg";
import { motion } from "framer-motion";

function Home() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="flex flex-col h-screen  overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
			{/* Main Content */}
			<main className="flex-1 flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-10">
				<div className="flex flex-col justify-center space-y-6 max-w-lg">
					<motion.h1
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-5xl font-extrabold tracking-tight"
					>
						Professional Trading Solutions for Everyone
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="text-gray-300 text-lg"
					>
						Access advanced trading tools, real-time market
						analysis, and expert insights to maximize your trading
						potential.
					</motion.p>
				</div>

				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="hidden md:flex items-center justify-center w-[50%]"
				>
					<img
						src={HomeImage}
						alt="Trading dashboard preview"
						className="rounded-lg shadow-xl bg-cover"
					/>
				</motion.div>
			</main>

			{/* Services Section */}
			<section className="px-8 md:px-20 py-14 bg-gray-800">
				<div className="flex justify-center gap-10">
					<Card className="bg-gray-900 border border-gray-700 shadow-lg hover:scale-105 transition-transform p-6 rounded-xl">
						<CardHeader className="pb-2 flex flex-col items-center">
							<BarChart3 className="h-12 w-12 text-blue-500 mb-3" />
							<CardTitle className="text-xl font-bold">
								Market Analysis
							</CardTitle>
						</CardHeader>
						<CardContent className="text-center">
							<CardDescription className="text-gray-400 text-md">
								Real-time charts and technical analysis tools to
								make informed decisions.
							</CardDescription>
							<Link
								to="/market-analysis"
								className="text-sm text-blue-400 flex items-center justify-center mt-4 hover:underline"
							>
								Explore <ArrowRight className="ml-1 h-4 w-4" />
							</Link>
						</CardContent>
					</Card>

					<Card className="bg-gray-900 border border-gray-700 shadow-lg hover:scale-105 transition-transform p-6 rounded-xl">
						<CardHeader className="pb-2 flex flex-col items-center">
							<Briefcase className="h-12 w-12 text-blue-500 mb-3" />
							<CardTitle className="text-xl font-bold">
								Sector Allocation
							</CardTitle>
						</CardHeader>
						<CardContent className="text-center">
							<CardDescription className="text-gray-400 text-md">
								Analyze and optimize asset distribution across
								different sectors.
							</CardDescription>
							<Link
								to="/sector-allocation"
								className="text-sm text-blue-400 flex items-center justify-center mt-4 hover:underline"
							>
								Explore <ArrowRight className="ml-1 h-4 w-4" />
							</Link>
						</CardContent>
					</Card>

					<Card className="bg-gray-900 border border-gray-700 shadow-lg hover:scale-105 transition-transform p-6 rounded-xl">
						<CardHeader className="pb-2 flex flex-col items-center">
							<Briefcase className="h-12 w-12 text-blue-500 mb-3" />
							<CardTitle className="text-xl font-bold">
								Portfolio Optimization
							</CardTitle>
						</CardHeader>
						<CardContent className="text-center">
							<CardDescription className="text-gray-400 text-md">
								Use sentiment analysis to better optimize
								your portfolio allocation.
							</CardDescription>
							<Link
								to="/portfolio-optimization"
								className="text-sm text-blue-400 flex items-center justify-center mt-4 hover:underline"
							>
								Explore <ArrowRight className="ml-1 h-4 w-4" />
							</Link>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}

export default Home;
