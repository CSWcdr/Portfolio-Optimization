import React, { useState } from "react";
import Select from "react-select";

const StockSearch = ({setSelectedStocks}) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);

  const fetchStocks = async (inputValue) => {
    if (!inputValue) return;

    try {
      const response = await fetch(`http://localhost:${import.meta.env.VITE_PORT}/search?q=${inputValue}`);
      const data = await response.json();

      if (data.results && data.results.quotes) {
        setOptions(
          data.results.quotes.map((stock) => ({
            label: `${stock.shortname} (${stock.symbol})`,
            value: stock.symbol,
          }))
        );
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };

  const loadStaticStockOptions = () => {
    const staticStocks = [
      { shortname: "Apple Inc.", symbol: "AAPL" },
      { shortname: "Microsoft Corporation", symbol: "MSFT" },
      { shortname: "Tesla Inc.", symbol: "TSLA" },
      { shortname: "AT&T Inc.", symbol: "T" },
      { shortname: "Amazon.com Inc.", symbol: "AMZN" },
      { shortname: "Alphabet Inc. (Class A)", symbol: "GOOGL" },
      { shortname: "NVIDIA Corporation", symbol: "NVDA" },
      { shortname: "Meta Platforms Inc.", symbol: "META" },
      { shortname: "Netflix Inc.", symbol: "NFLX" },
      { shortname: "Intel Corporation", symbol: "INTC" },
      { shortname: "Adobe Inc.", symbol: "ADBE" },
      { shortname: "PayPal Holdings Inc.", symbol: "PYPL" },
      { shortname: "Berkshire Hathaway Inc.", symbol: "BRK-B" },
      { shortname: "Coca-Cola Company", symbol: "KO" }
    ];
  
    setOptions(
      staticStocks.map((stock) => ({
        label: `${stock.shortname} (${stock.symbol})`,
        value: stock.symbol,
      }))
    );
  };
  

  return (
    <div style={{ width: "400px", margin: "50px auto", color: "black" }}>
      <h2 className="text-white">Search for Stocks</h2>
      <Select
        options={options}
        onInputChange={(value) => {
          setQuery(value);
          // fetchStocks(value);
          loadStaticStockOptions(); 
        }}
        onChange={(selectedOption) => {
          // Update the selectedStocks state by adding the new selection(s)
          setSelectedStocks((prevState) => {
            // Combine previous state with the new selected options, then filter out duplicates based on the value (stock symbol)
            const updatedStocks = [...prevState, ...selectedOption];
          
            // Remove duplicates by ensuring each stock symbol is unique
            return updatedStocks.filter(
              (stock, index, self) =>
                index === self.findIndex((t) => t.value === stock.value)
            );
          });
          
        }}
        placeholder="Search for a stock..."
        isClearable
        isSearchable
        isMulti
      />
      
    </div>
  );
};

export default StockSearch;
