from sqlalchemy import Column, Integer, String
from database import Base

# USERS

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    password = Column(String)

# ORDERS

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String)

    product = Column(String)

    price = Column(Integer)