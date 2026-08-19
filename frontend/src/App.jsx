import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Router } from "react-router";
import { createChart, BaselineSeries } from "lightweight-charts";
import StockSearch from "./components/StockSearch";
import BestFundAllocation from "./pages/BestFundAllocation";
import SentimentBasedAllocation from "./pages/SentimentBasedAllocation";
import SectorWiseFundAllocation from "./pages/SectorWiseFundAllocation";
import Home from "./pages/Home";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			{/* Add additional routes here */}
			<Route path="/market-analysis" element={<BestFundAllocation />} />
			<Route path="/sector-allocation" element={<SectorWiseFundAllocation />} />
			<Route path="/portfolio-optimization" element={<SentimentBasedAllocation />} />
		</Routes>
	);
}

export default App;
