import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def compute_portfolio_metrics(historical_prices_df: pd.DataFrame, weights: dict):
    returns_df = historical_prices_df.pct_change().dropna()
    weight_vector = np.array([weights[ticker] for ticker in returns_df.columns])
    portfolio_returns = returns_df @ weight_vector

    annualized_return = np.mean(portfolio_returns) * 252
    annualized_volatility = np.std(portfolio_returns) * np.sqrt(252)
    sharpe_ratio = annualized_return / annualized_volatility if annualized_volatility != 0 else 0

    downside_returns = portfolio_returns[portfolio_returns < 0]
    sortino_ratio = (np.mean(portfolio_returns) * 252) / (np.std(downside_returns) * np.sqrt(252)) if len(downside_returns) > 0 else 0

    cumulative = (1 + portfolio_returns).cumprod()
    peak = cumulative.cummax()
    drawdown = (cumulative - peak) / peak
    max_drawdown = drawdown.min()

    logger.info("Annualized Return: {:.2%}".format(annualized_return))
    logger.info("Annualized Volatility: {:.2%}".format(annualized_volatility))
    logger.info("Sharpe Ratio: {:.2f}".format(sharpe_ratio))
    logger.info("Sortino Ratio: {:.2f}".format(sortino_ratio))
    logger.info("Max Drawdown: {:.2%}".format(max_drawdown))

    return {
        "Annualized Return": annualized_return,
        "Volatility": annualized_volatility,
        "Sharpe Ratio": sharpe_ratio,
        "Sortino Ratio": sortino_ratio,
        "Max Drawdown": max_drawdown
    }
