from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import random
import uvicorn
import os
from supabase import create_client, Client

app = FastAPI()

# Supabase Credentials
SUPABASE_URL = "https://kitbkelglymubsqrdieb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGJrZWxnbHltdWJzcXJkaWViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDUxMjA3NSwiZXhwIjoyMTA2MDg4MDc1fQ.W4oaorIB9itNixpreMcfGnbFEMa_wsGHRh-GbLXLzpY"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import joblib
import pandas as pd

try:
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml_model', 'bridge_health_model.pkl')
    health_model = joblib.load(model_path)
except Exception as e:
    print(f"Warning: ML model could not be loaded: {e}. Falling back to random values.")
    health_model = None

class SensorSimulator:
    def __init__(self):
        self.load = 0.17
        self.vibration = 3.53
        self.temperature = 25.3
        self.humidity = 48
        self.pressure = 1013.25
        self.accelerometer = 0.02
        self.gyroscope = 0.1
        self.rain_sensor = 0 # 0 or 1
        
        self.strain = "NORMAL"
        self.rain = "NO"
        self.health = 98
        self.risk = "LOW RISK"

    def simulate_data(self):
        self.load = max(0.05, self.load + (random.random() - 0.5) * 0.02)
        self.vibration = max(1, self.vibration + (random.random() - 0.5) * 0.3)
        self.temperature = self.temperature + (random.random() - 0.5) * 0.2
        self.humidity = int(round(max(30, min(80, self.humidity + (random.random() - 0.5) * 2))))
        self.pressure = max(980, min(1025, self.pressure + (random.random() - 0.5) * 1.5))
        self.accelerometer = max(0, self.accelerometer + (random.random() - 0.5) * 0.01)
        self.gyroscope = max(0, self.gyroscope + (random.random() - 0.5) * 0.05)
        self.rain_sensor = 1 if random.random() < 0.2 else 0
        self.rain = "YES" if self.rain_sensor == 1 else "NO"
        self.calculate_risk()

    def calculate_risk(self):
        if health_model:
            # Predict using the high-accuracy ML model
            features = pd.DataFrame({
                'accelerometer': [self.accelerometer],
                'gyroscope': [self.gyroscope],
                'vibration': [self.vibration],
                'rain_sensor': [self.rain_sensor],
                'temperature': [self.temperature],
                'humidity': [self.humidity],
                'pressure': [self.pressure],
                'load': [self.load]
            })
            predicted_health = health_model.predict(features)[0]
            self.health = max(0, min(100, int(round(predicted_health))))
        else:
            # Fallback naive calculation
            score = 100
            if self.vibration > 6: score -= 30
            elif self.vibration > 4: score -= 15
            if self.load > 1: score -= 25
            elif self.load > 0.5: score -= 10
            if self.temperature > 45: score -= 20
            self.health = max(0, score)

        if self.health >= 80:
            self.risk = "LOW RISK"
        elif self.health >= 50:
            self.risk = "MEDIUM RISK"
        elif self.health >= 25:
            self.risk = "HIGH RISK"
        else:
            self.risk = "CRITICAL"

simulator = SensorSimulator()

def log_to_supabase(data: dict):
    try:
        supabase.table("sensor_data").insert(data).execute()
    except Exception as e:
        print(f"Failed to log to Supabase: {e}")

@app.get("/api/sensor-data")
def get_sensor_data(background_tasks: BackgroundTasks):
    simulator.simulate_data()
    
    data = {
        "health": simulator.health,
        "load": round(simulator.load, 2),
        "vibration": round(simulator.vibration, 2),
        "temperature": round(simulator.temperature, 2),
        "humidity": simulator.humidity,
        "pressure": round(simulator.pressure, 2),
        "accelerometer": round(simulator.accelerometer, 3),
        "gyroscope": round(simulator.gyroscope, 3),
        "rain_sensor": simulator.rain_sensor,
        "strain": simulator.strain,
        "rain": simulator.rain,
        "risk": simulator.risk,
    }
    
    # Save the data asynchronously to Supabase without blocking the API response
    background_tasks.add_task(log_to_supabase, data)
    
    return data

project_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
app.mount("/", StaticFiles(directory=project_dir, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
