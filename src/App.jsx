import React, { useState } from 'react';
    import axios from 'axios';
    import { Line } from 'react-chartjs-2';
    import {
      Chart as ChartJS,
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend
    } from 'chart.js';

    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend
    );

    const API_KEY = '62534b144b09121f69fb386bb441321a';
    const BASE_URL = 'https://api.marketstack.com/v1';

    export default function App() {
      const [symbol, setSymbol] = useState('');
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);

      const fetchStockData = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log('Fetching data for symbol:', symbol);
          const response = await axios.get(`${BASE_URL}/eod`, {
            params: {
              access_key: API_KEY,
              symbols: symbol,
              date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              date_to: new Date().toISOString().split('T')[0]
            }
          });
          console.log('API Response:', response);
          if (!response.data || !response.data.data) {
            throw new Error('Invalid API response');
          }
          setData(response.data.data);
        } catch (err) {
          console.error('API Error:', err);
          setError(err.message || 'Failed to fetch data');
        } finally {
          setLoading(false);
        }
      };

      const predictInvestment = () => {
        if (!data) return null;
        
        const prices = data.map(d => d.close);
        const lastPrice = prices[prices.length - 1];
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        
        return lastPrice > avgPrice ? 'Hold/Buy' : 'Sell';
      };

      return (
        <div className="container">
          <h1>Stock Tracker & Investment Predictor</h1>
          <div className="search">
            <input
              type="text"
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            />
            <button onClick={fetchStockData} disabled={loading}>
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="error">
              <h3>Error:</h3>
              <p>{error}</p>
            </div>
          )}

          {!data && !loading && (
            <div className="instructions">
              <p>Enter a stock symbol (e.g., AAPL, MSFT, TSLA) to view its performance</p>
            </div>
          )}

          {data && (
            <div className="results">
              <h2>{data[0].symbol} - Last 30 Days</h2>
              <div className="chart">
                <Line
                  data={{
                    labels: data.map(d => d.date.split('T')[0]),
                    datasets: [{
                      label: 'Closing Price',
                      data: data.map(d => d.close),
                      borderColor: 'rgba(75,192,192,1)',
                      fill: false
                    }]
                  }}
                />
              </div>
              <div className="prediction">
                <h3>Investment Recommendation:</h3>
                <p>{predictInvestment()}</p>
              </div>
            </div>
          )}
        </div>
      );
    }
