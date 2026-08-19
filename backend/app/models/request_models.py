from pydantic import BaseModel
from typing import List

class PredictRequest(BaseModel):
    tickers: List[str]
    start: str = "2023-01-01"
    end: str = "2025-01-01"