import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import date
import calendar


def predict_next_month_expense(monthly_data: list) -> dict:
    if len(monthly_data) < 2:
        avg = monthly_data[0]["total"] if monthly_data else 0.0
        return {
            "predicted_amount": round(avg * 1.05, 2),
            "prediction_month": _get_next_month(),
            "historical_data": monthly_data,
            "model_used": "average"
        }

    X = np.array(range(1, len(monthly_data) + 1)).reshape(-1, 1)
    y = np.array([d["total"] for d in monthly_data])

    model = LinearRegression()
    model.fit(X, y)

    next_x = np.array([[len(monthly_data) + 1]])
    predicted = float(model.predict(next_x)[0])
    predicted = max(0.0, predicted)

    return {
        "predicted_amount": round(predicted, 2),
        "prediction_month": _get_next_month(),
        "historical_data": monthly_data,
        "model_used": "linear_regression",
        "trend": "increasing" if model.coef_[0] > 0 else "decreasing"
    }


def _get_next_month() -> str:
    today = date.today()
    if today.month == 12:
        return f"{today.year + 1}-01"
    return f"{today.year}-{today.month + 1:02d}"


def generate_insights(monthly_data: list, category_data: dict, budget: float) -> list:
    insights = []

    if len(monthly_data) >= 2:
        last = monthly_data[-1]["total"]
        prev = monthly_data[-2]["total"]
        if prev > 0:
            pct_change = ((last - prev) / prev) * 100
            if pct_change > 10:
                insights.append(f"⚠️ Your spending increased by {pct_change:.1f}% compared to last month.")
            elif pct_change < -10:
                insights.append(f"✅ Great job! Spending decreased by {abs(pct_change):.1f}% vs last month.")

    if category_data:
        top_cat = max(category_data, key=category_data.get)
        top_val = category_data[top_cat]
        total = sum(category_data.values())
        if total > 0:
            pct = (top_val / total) * 100
            insights.append(f"🏆 {top_cat} is your highest category at {pct:.1f}% of expenses.")

    if budget > 0 and monthly_data:
        current_spend = monthly_data[-1]["total"]
        used_pct = (current_spend / budget) * 100
        today = date.today()
        days_in_month = calendar.monthrange(today.year, today.month)[1]
        expected_pct = (today.day / days_in_month) * 100
        if used_pct > expected_pct + 20:
            insights.append(f"🚨 You've used {used_pct:.1f}% of budget but it's only {expected_pct:.0f}% through the month.")
        elif used_pct < expected_pct - 20:
            insights.append(f"💰 You're on track! Only {used_pct:.1f}% of budget used.")

    if not insights:
        insights.append("📊 Keep tracking expenses to get personalized AI insights!")

    return insights