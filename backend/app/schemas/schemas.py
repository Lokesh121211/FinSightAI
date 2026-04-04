from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import date, datetime


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    monthly_budget: Optional[float] = 0.0


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    user_id: int
    full_name: str
    email: str
    monthly_budget: float
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    monthly_budget: Optional[float] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: str
    payment_mode: str = "Cash"
    expense_date: date
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    payment_mode: Optional[str] = None
    expense_date: Optional[date] = None
    notes: Optional[str] = None


class ExpenseOut(BaseModel):
    expense_id: int
    user_id: int
    amount: float
    category: str
    description: str
    payment_mode: str
    expense_date: date
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    total_monthly_spending: float
    monthly_budget: float
    remaining_budget: float
    savings_percentage: float
    total_transactions: int
    top_category: str
    budget_used_percentage: float


class ChartData(BaseModel):
    pie_chart: dict
    line_chart: dict
    bar_chart: dict


class AutoCategorizeRequest(BaseModel):
    description: str


class AutoCategorizeResponse(BaseModel):
    category: str
    confidence: float


class PredictionOut(BaseModel):
    predicted_amount: float
    prediction_month: str
    historical_data: List[dict]


class InsightOut(BaseModel):
    insights: List[str]


class AlertOut(BaseModel):
    alert_id: int
    message: str
    alert_type: str
    created_at: datetime

    class Config:
        from_attributes = True
class IncomeCreate(BaseModel):
    amount: float
    source: str
    description: Optional[str] = None
    income_date: date

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v


class IncomeOut(BaseModel):
    income_id: int
    user_id: int
    amount: float
    source: str
    description: Optional[str]
    income_date: date
    created_at: datetime

    class Config:
        from_attributes = True


class SavingsGoal(BaseModel):
    goal_name: str
    target_amount: float
    current_amount: float
    deadline: Optional[str] = None


class NetWorthOut(BaseModel):
    total_income: float
    total_expenses: float
    net_worth: float
    savings_rate: float