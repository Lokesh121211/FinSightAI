from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import date, datetime
from collections import defaultdict

from app.database import get_db
from app.models.models import Expense, Prediction, Alert, User
from app.schemas.schemas import AutoCategorizeRequest, AutoCategorizeResponse, PredictionOut, InsightOut
from app.services.auth_service import get_current_user
from app.ml.categorizer import get_categorizer
from app.ml.predictor import predict_next_month_expense, generate_insights

router = APIRouter(prefix="/ai", tags=["AI & ML"])


@router.post("/auto-categorize", response_model=AutoCategorizeResponse)
def auto_categorize(
    payload: AutoCategorizeRequest,
    current_user: User = Depends(get_current_user)
):
    categorizer = get_categorizer()
    result = categorizer.predict(payload.description)
    return AutoCategorizeResponse(category=result["category"], confidence=result["confidence"])


@router.get("/predict-expense", response_model=PredictionOut)
def predict_expense(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    uid = current_user.user_id
    monthly_data = []

    for i in range(5, -1, -1):
        m = today.month - i
        y = today.year
        while m <= 0:
            m += 12
            y -= 1
        expenses = db.query(Expense).filter(
            Expense.user_id == uid,
            extract("year", Expense.expense_date) == y,
            extract("month", Expense.expense_date) == m
        ).all()
        label = datetime(y, m, 1).strftime("%Y-%m")
        monthly_data.append({"month": label, "total": round(sum(e.amount for e in expenses), 2)})

    months_with_data = [m for m in monthly_data if m["total"] > 0]
    if not months_with_data:
        return PredictionOut(predicted_amount=0.0, prediction_month="N/A", historical_data=monthly_data)

    result = predict_next_month_expense(months_with_data)

    pred = Prediction(
        user_id=uid,
        predicted_amount=result["predicted_amount"],
        prediction_month=result["prediction_month"]
    )
    db.add(pred)
    db.commit()

    return PredictionOut(
        predicted_amount=result["predicted_amount"],
        prediction_month=result["prediction_month"],
        historical_data=monthly_data
    )


@router.get("/insights", response_model=InsightOut)
def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    uid = current_user.user_id
    monthly_data = []

    for i in range(5, -1, -1):
        m = today.month - i
        y = today.year
        while m <= 0:
            m += 12
            y -= 1
        expenses = db.query(Expense).filter(
            Expense.user_id == uid,
            extract("year", Expense.expense_date) == y,
            extract("month", Expense.expense_date) == m
        ).all()
        label = datetime(y, m, 1).strftime("%Y-%m")
        monthly_data.append({"month": label, "total": round(sum(e.amount for e in expenses), 2)})

    this_month = db.query(Expense).filter(
        Expense.user_id == uid,
        extract("year", Expense.expense_date) == today.year,
        extract("month", Expense.expense_date) == today.month
    ).all()

    cat_totals = defaultdict(float)
    for e in this_month:
        cat_totals[e.category] += e.amount

    insights = generate_insights(monthly_data, dict(cat_totals), current_user.monthly_budget)
    return InsightOut(insights=insights)


@router.get("/budget-alert")
def budget_alert(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    budget = current_user.monthly_budget or 0.0
    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.user_id,
        extract("year", Expense.expense_date) == today.year,
        extract("month", Expense.expense_date) == today.month
    ).all()

    total_spent = sum(e.amount for e in expenses)
    alerts = []

    if budget > 0:
        pct = (total_spent / budget) * 100
        if pct >= 100:
            alerts.append({"type": "danger", "message": f"🚨 OVER BUDGET! You exceeded ₹{budget:,.0f}."})
        elif pct >= 80:
            alerts.append({"type": "warning", "message": f"⚠️ You've used {pct:.1f}% of your budget."})
        elif pct >= 60:
            alerts.append({"type": "info", "message": f"📊 You've used {pct:.1f}% of budget. Stay on track!"})

        if alerts:
            db.add(Alert(user_id=current_user.user_id, message=alerts[0]["message"], alert_type=alerts[0]["type"]))
            db.commit()

    return {
        "alerts": alerts,
        "total_spent": round(total_spent, 2),
        "budget": budget,
        "percentage_used": round((total_spent / budget * 100) if budget > 0 else 0, 1)
    }