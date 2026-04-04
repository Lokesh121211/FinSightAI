from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from datetime import date
import csv, io

from app.database import get_db
from app.models.models import Expense, User
from app.schemas.schemas import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post("/add", response_model=ExpenseOut, status_code=201)
def add_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = Expense(
        user_id=current_user.user_id,
        amount=payload.amount,
        category=payload.category,
        description=payload.description,
        payment_mode=payload.payment_mode,
        expense_date=payload.expense_date,
        notes=payload.notes
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("", response_model=List[ExpenseOut])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    category: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200)
):
    query = db.query(Expense).filter(Expense.user_id == current_user.user_id)
    if category:
        query = query.filter(Expense.category == category)
    if start_date:
        query = query.filter(Expense.expense_date >= start_date)
    if end_date:
        query = query.filter(Expense.expense_date <= end_date)
    if search:
        query = query.filter(Expense.description.ilike(f"%{search}%"))
    return query.order_by(desc(Expense.expense_date)).offset(skip).limit(limit).all()


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.expense_id == expense_id,
        Expense.user_id == current_user.user_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.expense_id == expense_id,
        Expense.user_id == current_user.user_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()


@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.user_id
    ).order_by(desc(Expense.expense_date)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Description", "Category", "Amount", "Payment Mode", "Notes"])
    for e in expenses:
        writer.writerow([e.expense_date, e.description, e.category, e.amount, e.payment_mode, e.notes or ""])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"}
    )