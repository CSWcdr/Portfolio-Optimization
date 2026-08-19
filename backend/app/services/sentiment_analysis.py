import yfinance as yf
import feedparser
import re
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
import pandas as pd
from newspaper import Article
from pypfopt.black_litterman import BlackLittermanModel, market_implied_prior_returns
from pypfopt.risk_models import CovarianceShrinkage
from pypfopt.efficient_frontier import EfficientFrontier
from pypfopt.expected_returns import mean_historical_return
from sklearn.preprocessing import MinMaxScaler
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.algorithms.moo.moead import MOEAD
from pymoo.algorithms.moo.nsga3 import NSGA3
from pymoo.core.problem import Problem
from pymoo.optimize import minimize
from pymoo.util.ref_dirs import get_reference_directions

from app.utils.logger import logger

tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")

def get_sentiment_score(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1).detach().numpy()[0]
    return probs[2] - probs[0]  # Positive - Negative = Polarity score (c in [-1, 1])

def fetch_articles_from_google_news(ticker, max_articles=5):
    rss_url = f"https://news.google.com/rss/search?q={ticker}+stock"
    feed = feedparser.parse(rss_url)
    articles = []

    for entry in feed.entries[:max_articles]:
        title = entry.title
        link = entry.link
        articles.append({"title": title, "link": link})

    return articles

def fetch_yfinance_news(ticker, max_entries=5):
    stock = yf.Ticker(ticker)
    news = stock.news[:max_entries]
    return [{"title": item['content']['title'], "link": item['content']['canonicalUrl']['url']} for item in news]


def extract_article_text(url):
    try:
        article = Article(url)
        article.download()
        article.parse()
        return article.text
    except:
        return None
def extract_text(reports):
    for r in reports:
        link = r.get('link')
        if link:
            try:
                r["text"] = extract_article_text(link)
            except Exception as e:
                r["text"] = None
                print(f"Failed to extract text from {link}: {e}")
    return reports


def get_sentiment_scores_for_tickers(tickers):
    tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
    model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")

    def extract_article_text(url):
        try:
            article = Article(url)
            article.download()
            article.parse()
            return article.text
        except:
            return None

    def score_text(text):
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1).detach().numpy()[0]
        return probs[2] - probs[0]

    scores = {}
    for ticker in tickers:
        articles = fetch_articles_from_google_news(ticker) + fetch_yfinance_news(ticker)
        articles = extract_text(articles)
        texts = [a.get("text") for a in articles if a.get("text")]

        if texts:
            sentiment_scores = [score_text(t) for t in texts]
            scores[ticker] = np.mean(sentiment_scores)  # average polarity
        else:
            scores[ticker] = 0.0  # neutral

    return scores


def black_litterman_with_sentiment(prices_df, sentiment_scores):
    tickers = list(prices_df.columns)

    # Step 1: Historical Risk & Return
    S = CovarianceShrinkage(prices_df).ledoit_wolf()
    mu = mean_historical_return(prices_df)

    # Step 2: Market Weights (equal for now)
    market_weights = pd.Series(1 / len(tickers), index=tickers)

    # Step 3: Risk Aversion Parameter
    delta = 2.5

    # ✅ FIXED: ensure consistent format for `market_weights` and `S`
    pi = market_implied_prior_returns(cov_matrix=S, market_caps=market_weights, risk_aversion=delta)

    # Step 4: Views (from sentiment scores)
    P = np.eye(len(tickers))
    Q = np.array([sentiment_scores[t] for t in tickers])

    # Step 5: Build BL Model
    bl = BlackLittermanModel(S, pi=pi, Q=Q, P=P, omega="idzorek", tau=0.05)
    ret_bl = bl.bl_returns()
    cov_bl = bl.bl_cov()

    # Step 6: Optimize
    ef = EfficientFrontier(ret_bl, cov_bl)
    weights = ef.max_sharpe()

    return ef.clean_weights()

def predict_with_sentiment_ann(models, data, sentiment_scores, duration="1y"):
    logger.info("Running ANN + Sentiment-enhanced predictions")
    future_prices = {}
    duration_map = {"6m": 180, "1y": 365, "5y": 1825, "10y": 3650}
    prediction_days = duration_map.get(duration, 365)

    for ticker, model in models.items():
        last_10_days = np.array(data[ticker]["Close"][-10:]).reshape(1, -1)
        future_preds = []
        sentiment_factor = sentiment_scores.get(ticker, 0)

        for _ in range(prediction_days):
            predicted_price = model.predict(last_10_days)[0][0]

            # Modify prediction based on sentiment (polarity in [-1, 1])
            adjusted_price = predicted_price * (1 + 0.1 * sentiment_factor)
            future_preds.append(adjusted_price)

            last_10_days = np.roll(last_10_days, -1)
            last_10_days[0, -1] = adjusted_price

        future_prices[ticker] = future_preds
        logger.debug(f"{ticker} - Avg predicted price: {np.mean(future_preds):.2f} with sentiment {sentiment_factor:.2f}")

    return future_prices

def optimize_with_bl_and_moo(future_prices, prices_df, sentiment_scores, return_res):
    logger.info("Running hybrid Black–Litterman + NSGA3 optimization")

    # Step 1: Compute returns and risks
    tickers = list(future_prices.keys())
    ann_returns = np.array([np.mean(future_prices[t]) for t in tickers])
    ann_risks = np.array([np.std(future_prices[t]) for t in tickers])

    # Normalize returns and risks
    scaler = MinMaxScaler()
    norm_returns = scaler.fit_transform(ann_returns.reshape(-1, 1)).flatten()
    norm_risks = scaler.fit_transform(ann_risks.reshape(-1, 1)).flatten()

    # Step 2: Black-Litterman with sentiment views
    S = CovarianceShrinkage(prices_df).ledoit_wolf()
    mu = mean_historical_return(prices_df)
    market_weights = pd.Series(1 / len(tickers), index=tickers)
    delta = 2.5
    pi = market_implied_prior_returns(cov_matrix=S, market_caps=market_weights, risk_aversion=delta)

    P = np.eye(len(tickers))
    Q = np.array([sentiment_scores[t] for t in tickers])
    view_confidences = np.clip(np.abs(Q), 0.1, 1.0)  # or use np.array([0.8] * len(Q))
    bl = BlackLittermanModel(
        S,
        pi=pi,
        Q=Q,
        P=P,
        omega="idzorek",
        view_confidences=view_confidences,
        tau=0.05
    )
    logger.debug("Sentiment Q vector: " + str(Q))
    logger.debug("View confidence: " + str(view_confidences))

    ret_bl = bl.bl_returns()
    cov_bl = bl.bl_cov()

    logger.debug("BL Posterior Returns: " + str(ret_bl.to_dict()))

    # Step 3: Multi-Objective Optimization
    class HybridPortfolioProblem(Problem):
        def __init__(self):
            super().__init__(n_var=len(tickers), n_obj=2, xl=0.0, xu=1.0)
            self.ret_bl = ret_bl.values
            self.risks = norm_risks

        def _evaluate(self, X, out, *args, **kwargs):
            ret = np.sum(X * self.ret_bl, axis=1)
            risk = np.sum(X * self.risks, axis=1)
            out["F"] = np.column_stack([-ret, risk])  # maximize return, minimize risk

    problem = HybridPortfolioProblem()
    ref_dirs = get_reference_directions("das-dennis", 2, n_partitions=12)
    logger.info("Running NSGA3 on hybrid portfolio problem")
    res = minimize(
        problem=problem,
        algorithm=NSGA3(ref_dirs),
        termination=("n_gen", 100),
        verbose=False
    )
    logger.debug("Optimization complete. Objectives shape: " + str(res.F.shape))

    best_solution = res.X[np.argmin(res.F[:, 1])]
    total = np.sum(best_solution)
    allocation = {ticker: weight / total for ticker, weight in zip(tickers, best_solution)}

    logger.info("Final allocation (top 3): " + str(dict(list(allocation.items())[:3])))
    if return_res:
        return allocation, dict(ret_bl), res
    else:
        return allocation, dict(ret_bl)