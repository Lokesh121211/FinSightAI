from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import date, datetime
from collections import defaultdict

from app.database import get_db
from app.models.models import Expense, User
from app.schemas.schemas import DashboardSummary, ChartData
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.user_id,
        extract("year", Expense.expense_date) == today.year,
        extract("month", Expense.expense_date) == today.month
    ).all()

    total = sum(e.amount for e in expenses)
    budget = current_user.monthly_budget or 0.0
    remaining = max(0.0, budget - total)
    savings_pct = ((budget - total) / budget * 100) if budget > 0 else 0.0
    used_pct = (total / budget * 100) if budget > 0 else 0.0

    cat_totals = defaultdict(float)
    for e in expenses:
        cat_totals[e.category] += e.amount
    top_cat = max(cat_totals, key=cat_totals.get) if cat_totals else "N/A"

    return DashboardSummary(
        total_monthly_spending=round(total, 2),
        monthly_budget=round(budget, 2),
        remaining_budget=round(remaining, 2),
        savings_percentage=round(savings_pct, 1),
        total_transactions=len(expenses),
        top_category=top_cat,
        budget_used_percentage=round(min(used_pct, 100.0), 1)
    )


@router.get("/charts", response_model=ChartData)
def get_charts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    uid = current_user.user_id

    this_month = db.query(Expense).filter(
        Expense.user_id == uid,
        extract("year", Expense.expense_date) == today.year,
        extract("month", Expense.expense_date) == today.month
    ).all()

    cat_totals = defaultdict(float)
    for e in this_month:
        cat_totals[e.category] += e.amount

    pie_chart = {
        "labels": list(cat_totals.keys()),
        "data": [round(v, 2) for v in cat_totals.values()]
    }

    months_data = []
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
        label = datetime(y, m, 1).strftime("%b %Y")
        months_data.append({"month": label, "total": round(sum(e.amount for e in expenses), 2)})

    line_chart = {
        "labels": [d["month"] for d in months_data],
        "data": [d["total"] for d in months_data]
    }
    bar_chart = {
        "labels": line_chart["labels"],
        "expenses": line_chart["data"],
        "budget": [round(current_user.monthly_budget, 2)] * 6
    }

    return ChartData(pie_chart=pie_chart, line_chart=line_chart, bar_chart=bar_chart)