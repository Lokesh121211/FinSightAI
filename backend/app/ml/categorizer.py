import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import re

TRAINING_DATA = [
    ("swiggy order dinner", "Food"), ("zomato biryani", "Food"),
    ("mcdonalds burger", "Food"), ("dominos pizza", "Food"),
    ("restaurant lunch", "Food"), ("grocery store vegetables", "Food"),
    ("cafe coffee", "Food"), ("bakery bread", "Food"),
    ("blinkit grocery delivery", "Food"), ("zepto snacks order", "Food"),

    ("uber ride office", "Travel"), ("ola cab airport", "Travel"),
    ("rapido bike taxi", "Travel"), ("metro card recharge", "Travel"),
    ("bus ticket booking", "Travel"), ("train ticket irctc", "Travel"),
    ("flight booking indigo", "Travel"), ("petrol fuel station", "Travel"),

    ("amazon purchase", "Shopping"), ("flipkart order", "Shopping"),
    ("myntra clothes", "Shopping"), ("ajio fashion", "Shopping"),
    ("nike shoes", "Shopping"), ("zara tshirt", "Shopping"),

    ("electricity bill payment", "Bills"), ("water bill", "Bills"),
    ("internet broadband airtel", "Bills"), ("jio recharge plan", "Bills"),
    ("netflix subscription", "Bills"), ("credit card bill", "Bills"),

    ("apollo pharmacy medicine", "Health"), ("doctor consultation", "Health"),
    ("hospital bill", "Health"), ("lab test blood report", "Health"),
    ("gym membership", "Health"), ("dental checkup", "Health"),

    ("movie ticket pvr", "Entertainment"), ("bookmyshow film", "Entertainment"),
    ("concert event", "Entertainment"), ("gaming top up", "Entertainment"),

    ("udemy course online", "Education"), ("coursera subscription", "Education"),
    ("college fee tuition", "Education"), ("coaching class", "Education"),

    ("atm cash withdrawal", "Miscellaneous"), ("gift birthday present", "Miscellaneous"),
    ("laundry dry cleaning", "Miscellaneous"), ("barber salon haircut", "Miscellaneous"),
]


class ExpenseCategorizer:
    def __init__(self):
        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=500,
                lowercase=True,
                stop_words="english"
            )),
            ("clf", LogisticRegression(max_iter=1000, C=5.0, random_state=42))
        ])
        self._train()

    def _preprocess(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        return text.strip()

    def _train(self):
        X = [self._preprocess(desc) for desc, _ in TRAINING_DATA]
        y = [label for _, label in TRAINING_DATA]
        self.pipeline.fit(X, y)

    def predict(self, description: str) -> dict:
        cleaned = self._preprocess(description)
        category = self.pipeline.predict([cleaned])[0]
        proba = self.pipeline.predict_proba([cleaned])[0]
        confidence = float(np.max(proba))
        return {"category": category, "confidence": round(confidence, 3)}


_categorizer = None

def get_categorizer() -> ExpenseCategorizer:
    global _categorizer
    if _categorizer is None:
        _categorizer = ExpenseCategorizer()
    return _categorizer