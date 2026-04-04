from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import date, datetime
from typing import List
from collections import defaultdict

from app.database import get_db
from app.models.models import Income, Expense, User
from app.schemas.schemas import IncomeCreate, IncomeOut, NetWorthOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/income", tags=["Income & Savings"])

INCOME_SOURCES = [
    "Salary", "Freelance", "Business", "Investment",
    "Rental", "Gift", "Bonus", "Other"
]


@router.post("/add", response_model=IncomeOut, status_code=201)
def add_income(
    payload: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    income = Income(
        user_id=current_user.user_id,
        amount=payload.amount,
        source=payload.source,
        description=payload.description,
        income_date=payload.income_date
    )
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


@router.get("", response_model=List[IncomeOut])
def get_incomes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Income).filter(
        Income.user_id == current_user.user_id
    ).order_by(Income.income_date.desc()).all()


@router.delete("/{income_id}", status_code=204)
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    income = db.query(Income).filter(
        Income.income_id == income_id,
        Income.user_id == current_user.user_id
    ).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    db.delete(income)
    db.commit()


@router.get("/net-worth", response_model=NetWorthOut)
def get_net_worth(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_income = sum(
        i.amount for i in db.query(Income).filter(
            Income.user_id == current_user.user_id
        ).all()
    )
    total_expenses = sum(
        e.amount for e in db.query(Expense).filter(
            Expense.user_id == current_user.user_id
        ).all()
    )
    net_worth = total_income - total_expenses
    savings_rate = ((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0.0

    return NetWorthOut(
        total_income=round(total_income, 2),
        total_expenses=round(total_expenses, 2),
        net_worth=round(net_worth, 2),
        savings_rate=round(savings_rate, 1)
    )


@router.get("/monthly-comparison")
def get_monthly_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    uid = current_user.user_id
    result = []

    for i in range(5, -1, -1):
        m = today.month - i
        y = today.year
        while m <= 0:
            m += 12
            y -= 1

        incomes = db.query(Income).filter(
            Income.user_id == uid,
            extract("year", Income.income_date) == y,
            extract("month", Income.income_date) == m
        ).all()

        expenses = db.query(Expense).filter(
            Expense.user_id == uid,
            extract("year", Expense.expense_date) == y,
            extract("month", Expense.expense_date) == m
        ).all()

        label = datetime(y, m, 1).strftime("%b %Y")
        total_income = round(sum(inc.amount for inc in incomes), 2)
        total_expense = round(sum(exp.amount for exp in expenses), 2)

        result.append({
            "month": label,
            "income": total_income,
            "expenses": total_expense,
            "savings": round(total_income - total_expense, 2)
        })

    return result