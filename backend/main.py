import os

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from database import SessionLocal
from auth import router as auth_router
from models import Order

# ---------------- APP INIT ----------------
app = FastAPI()

# ---------------- CORS ----------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "https://your-project.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- AUTH ROUTER ----------------
app.include_router(auth_router)

# ---------------- DB SESSION ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- MODELS ----------------
class CartItem(BaseModel):
    product: str
    price: int

class OrderRequest(BaseModel):
    username: str
    items: List[CartItem]

# ---------------- ROOT ----------------
@app.get("/")
def home():
    return {"message": "Clother By SJ Backend Running"}

# ---------------- ORDER API ----------------
@app.post("/order")
def place_order(order: OrderRequest, db: Session = Depends(get_db)):

    total = 0

    print("\n========== NEW ORDER ==========")
    print("USER:", order.username)

    for item in order.items:
        print(f"{item.product} - ₹{item.price}")
        total += item.price

        new_order = Order(
            username=order.username,
            product=item.product,
            price=item.price
        )
        db.add(new_order)

    db.commit()

    print("TOTAL =", total)
    print("==============================")

    return {
        "message": "Order Saved Successfully",
        "total": total
    }

# ---------------- GET ORDERS ----------------
@app.get("/orders")
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)