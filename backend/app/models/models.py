from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    monthly_budget = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    incomes = relationship("Income", back_populates="user", cascade="all, delete-orphan")

class Expense(Base):
    __tablename__ = "expenses"

    expense_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(String(255), nullable=False)
    payment_mode = Column(String(50), nullable=False, default="Cash")
    expense_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="expenses")


class Prediction(Base):
    __tablename__ = "predictions"

    prediction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    predicted_amount = Column(Float, nullable=False)
    prediction_month = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="predictions")


class Alert(Base):
    __tablename__ = "alerts"

    alert_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    alert_type = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="alerts")
class Income(Base):
    __tablename__ = "incomes"

    income_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    source = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    income_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="incomes")