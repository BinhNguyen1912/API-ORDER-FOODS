from fastapi import FastAPI
import joblib
import numpy as np
from pydantic import BaseModel
from datetime import datetime
import os

# Xác định thư mục chứa model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "models", "fraud_detection_model.pkl")
scaler_path = os.path.join(BASE_DIR, "models", "scaler.pkl")

# Load model và scaler
model = joblib.load(model_path)
scaler = joblib.load(scaler_path)
print("✅ Model & Scaler loaded successfully!")

app = FastAPI()

class OrderData(BaseModel):
    discountAmount: float
    finalPrice: float
    totalPrice: float
    isPaied: int
    paymentMethod: str  
    order_hour: int
    order_weekday: int
    is_deleted: int  
    isFinalPriceNegative: int
    status: str

@app.post("/predict")
def predict_fraud(order: OrderData):
    payment_method_map = {"cash": 0, "vnpay": 1, "e_wallet": 2}
    payment_method_encoded = payment_method_map.get(order.paymentMethod.lower(), -1)
    
    if payment_method_encoded == -1:
        return {"error": "Invalid payment method"}
    
    status_map = {"pending": 0, "completed": 1, "cancelled": 2}  # Điều chỉnh nếu cần
    status_encoded = status_map.get(order.status.lower(), -1)
    
    if status_encoded == -1:
        return {"error": "Invalid status"}
    
    input_data = np.array([
        order.discountAmount,
        order.finalPrice,
        order.totalPrice,
        order.isPaied,
        payment_method_encoded,
        order.order_hour,
        order.order_weekday,
        order.is_deleted,
        order.isFinalPriceNegative,
        status_encoded
    ]).reshape(1, -1)
    
    try:
        if order.finalPrice < 0:
            return {"fraudulent": True}
        input_data_scaled = scaler.transform(input_data)
        
    except Exception as e:
        return {"error": str(e)}


    try:
        prediction = model.predict(input_data_scaled)
        print(f"🛑 Dự đoán: {prediction[0]}")
    except Exception as e:
        print("⚠️ Lỗi khi dự đoán:", str(e))
        return {"error": str(e)}

    return {"fraudulent": bool(prediction[0])}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
