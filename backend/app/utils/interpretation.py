import os
import requests
import numpy as np
from dotenv import load_dotenv

from app.utils.logger import logger


load_dotenv()


def format_interpretation_prompt(
    allocation,
    sentiment_scores,
    bl_returns,
    future_prices
):
    volatility = {
        ticker: round(np.std(prices), 4)
        for ticker, prices in future_prices.items()
    }

    prompt = (
        "Please interpret this portfolio optimization result:\n\n"
        f"Asset Allocation: {allocation}\n"
        f"Sentiment Scores: {sentiment_scores}\n"
        f"Black–Litterman Expected Returns: {bl_returns}\n"
        f"Predicted Volatility (ANN): {volatility}\n\n"
        "Provide a client-friendly interpretation in bullet points."
    )

    return prompt


def generate_interpretation_openrouter(
    prompt,
    model="mistralai/mistral-7b-instruct"
):
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise ValueError(
            "OPENROUTER_API_KEY is not configured."
        )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost",
        "Content-Type": "application/json",
    }

    body = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a financial advisor creating "
                    "easy-to-understand interpretations of "
                    "portfolio optimization results."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    }

    logger.info(
        "Sending portfolio interpretation request to OpenRouter."
    )

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=body,
        timeout=30,
    )

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]

    raise Exception(
        f"OpenRouter request failed with status "
        f"{response.status_code}: {response.text}"
    )