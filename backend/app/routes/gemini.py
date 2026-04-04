from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import date
from collections import defaultdict
from pydantic import BaseModel
import os
from groq import Groq

from app.database import get_db
from app.models.models import Expense, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/gemini", tags=["AI Chat"])


LIFESTYLE_BENCHMARKS = {
    "basic": {
        "Food": 3000, "Travel": 1000, "Shopping": 1500,
        "Bills": 2000, "Health": 500, "Entertainment": 500,
        "Education": 1000, "Miscellaneous": 500,
        "total": 10000, "label": "Basic Lifestyle"
    },
    "middle": {
        "Food": 8000, "Travel": 5000, "Shopping": 6000,
        "Bills": 5000, "Health": 2000, "Entertainment": 3000,
        "Education": 3000, "Miscellaneous": 2000,
        "total": 34000, "label": "Middle Class Lifestyle"
    },
    "rich": {
        "Food": 25000, "Travel": 30000, "Shopping": 40000,
        "Bills": 15000, "Health": 10000, "Entertainment": 20000,
        "Education": 15000, "Miscellaneous": 10000,
        "total": 165000, "label": "Rich Lifestyle"
    }
}


class ChatRequest(BaseModel):
    message: str


class LifestyleRequest(BaseModel):
    lifestyle: str


def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Groq API key not configured"
        )

    return Groq(api_key=api_key)


def call_groq(prompt: str) -> str:
    """Helper to call Groq API."""
    client = get_groq_client()

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are FinSight AI, a helpful personal finance assistant. "
                    "Be concise, friendly, and practical. "
                    "Always use ₹ symbol for Indian currency."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=200,
        temperature=0.7
    )

    return response.choices[0].message.content


@router.post("/chat")
async def chat_with_groq(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Chat with Groq AI about finances."""
    today = date.today()

    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.user_id,
        extract("year", Expense.expense_date) == today.year,
        extract("month", Expense.expense_date) == today.month
    ).all()

    cat_totals = defaultdict(float)
    for e in expenses:
        cat_totals[e.category] += e.amount

    total_spent = sum(cat_totals.values())
    budget = current_user.monthly_budget or 0

    prompt = f"""
User Financial Data:
- Name: {current_user.full_name}
- Monthly Budget: ₹{budget:,.0f}
- Total Spent This Month: ₹{total_spent:,.0f}
- Remaining Budget: ₹{max(0, budget - total_spent):,.0f}
- Spending by Category: {dict(cat_totals)}

User Question: {payload.message}

Answer in under 150 words.
Be helpful and specific to their data.
"""

    try:
        response_text = call_groq(prompt)
        return {"response": response_text}

    except Exception as e:
        print(f"GROQ ERROR: {str(e)}")

        if budget > 0:
            pct = (total_spent / budget) * 100

            if pct >= 100:
                msg = (
                    f"⚠️ You've exceeded your ₹{budget:,.0f} budget! "
                    f"You spent ₹{total_spent:,.0f} this month. "
                    f"Try to cut back immediately."
                )

            elif pct >= 80:
                msg = (
                    f"⚠️ You've used {pct:.0f}% of your budget. "
                    f"Spent ₹{total_spent:,.0f} out of ₹{budget:,.0f}. "
                    f"Be careful!"
                )

            else:
                msg = (
                    f"✅ You've spent ₹{total_spent:,.0f} out of ₹{budget:,.0f} "
                    f"({pct:.0f}% used). You're doing well!"
                )
        else:
            msg = (
                f"You've spent ₹{total_spent:,.0f} this month. "
                f"Set a monthly budget in your Profile page to track better!"
            )

        return {"response": msg}


@router.post("/lifestyle-compare")
async def compare_lifestyle(
    payload: LifestyleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Compare spending with lifestyle benchmarks."""
    lifestyle = payload.lifestyle.lower()

    if lifestyle not in LIFESTYLE_BENCHMARKS:
        raise HTTPException(status_code=400, detail="Invalid lifestyle")

    today = date.today()
    benchmark = LIFESTYLE_BENCHMARKS[lifestyle]

    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.user_id,
        extract("year", Expense.expense_date) == today.year,
        extract("month", Expense.expense_date) == today.month
    ).all()

    cat_totals = defaultdict(float)
    for e in expenses:
        cat_totals[e.category] += e.amount

    total_spent = round(sum(cat_totals.values()), 2)
    benchmark_total = benchmark["total"]

    categories = [
        "Food", "Travel", "Shopping", "Bills",
        "Health", "Entertainment", "Education", "Miscellaneous"
    ]

    comparison = []

    for cat in categories:
        user_val = round(cat_totals.get(cat, 0), 2)
        bench_val = benchmark.get(cat, 0)
        diff = round(user_val - bench_val, 2)

        comparison.append({
            "category": cat,
            "your_spending": user_val,
            "benchmark": bench_val,
            "difference": diff,
            "status": "over" if diff > 0 else "under" if diff < 0 else "equal"
        })

    diff_total = round(total_spent - benchmark_total, 2)

    if diff_total > 0:
        ai_insight = (
            f"You spend ₹{total_spent:,.0f}/month which is "
            f"₹{diff_total:,.0f} MORE than the {benchmark['label']} "
            f"(₹{benchmark_total:,.0f}/month). "
            f"Consider reducing discretionary spending."
        )
    elif diff_total < 0:
        ai_insight = (
            f"Great job! You spend ₹{total_spent:,.0f}/month which is "
            f"₹{abs(diff_total):,.0f} LESS than the {benchmark['label']} "
            f"(₹{benchmark_total:,.0f}/month). "
            f"You're living efficiently!"
        )
    else:
        ai_insight = (
            f"Your spending of ₹{total_spent:,.0f}/month matches "
            f"the {benchmark['label']} perfectly!"
        )

    try:
        prompt = f"""
The user spends ₹{total_spent:,.0f}/month.
{benchmark['label']} benchmark is ₹{benchmark_total:,.0f}/month.
Their category breakdown: {dict(cat_totals)}

Give 2-3 sentences of personalized financial advice comparing their lifestyle.
Use ₹ symbol.
Be encouraging and specific.
"""
        ai_insight = call_groq(prompt)

    except Exception as e:
        print(f"Groq lifestyle error: {e}")

    return {
        "lifestyle": lifestyle,
        "lifestyle_label": benchmark["label"],
        "your_total": total_spent,
        "benchmark_total": benchmark_total,
        "difference": round(total_spent - benchmark_total, 2),
        "comparison": comparison,
        "ai_insight": ai_insight
    }