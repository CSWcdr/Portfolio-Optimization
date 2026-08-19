import numpy as np
def format_interpretation_prompt(allocation, sentiment_scores, bl_returns, future_prices):
    volatility = {t: round(np.std(p), 4) for t, p in future_prices.items()}

    prompt = (
        "Please interpret this portfolio optimization result:\n\n"
        f"Asset Allocation: {allocation}\n"
        f"Sentiment Scores: {sentiment_scores}\n"
        f"Black–Litterman Expected Returns: {bl_returns}\n"
        f"Predicted Volatility (ANN): {volatility}\n\n"
        "Provide a client-friendly interpretation in bullet points."
    )

    return prompt
