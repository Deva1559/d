import random
import datetime
import pandas as pd
import joblib
from supabase import create_client, Client

# Supabase Credentials
SUPABASE_URL = "https://kitbkelglymubsqrdieb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGJrZWxnbHltdWJzcXJkaWViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDUxMjA3NSwiZXhwIjoyMTA2MDg4MDc1fQ.W4oaorIB9itNixpreMcfGnbFEMa_wsGHRh-GbLXLzpY"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    health_model = joblib.load('bridge_health_model.pkl')
except Exception as e:
    print(f"Warning: ML model could not be loaded: {e}. Defaulting to naive calculation.")
    health_model = None

def seed_data(num_entries=500):
    # Initial realistic values
    load = 0.17
    vibration = 3.53
    temperature = 25.3
    humidity = 48
    pressure = 1013.25
    accelerometer = 0.02
    gyroscope = 0.1
    rain_sensor = 0
    
    # Start time 500 minutes ago
    current_time = datetime.datetime.utcnow() - datetime.timedelta(minutes=num_entries)
    
    records = []
    
    for i in range(num_entries):
        # Gradual random walk for each sensor variable
        load = max(0.05, load + (random.random() - 0.5) * 0.02)
        vibration = max(1, vibration + (random.random() - 0.5) * 0.3)
        temperature = temperature + (random.random() - 0.5) * 0.2
        humidity = int(round(max(30, min(80, humidity + (random.random() - 0.5) * 2))))
        pressure = max(980, min(1025, pressure + (random.random() - 0.5) * 1.5))
        accelerometer = max(0, accelerometer + (random.random() - 0.5) * 0.01)
        gyroscope = max(0, gyroscope + (random.random() - 0.5) * 0.05)
        
        # Occasional rain showers
        if rain_sensor == 1:
            rain_sensor = 1 if random.random() < 0.9 else 0 # 90% chance to stay raining
        else:
            rain_sensor = 1 if random.random() < 0.05 else 0 # 5% chance to start raining
            
        rain = "YES" if rain_sensor == 1 else "NO"
        strain = "NORMAL"
        
        # Calculate health using the ML model if available
        if health_model:
            features = pd.DataFrame({
                'accelerometer': [accelerometer],
                'gyroscope': [gyroscope],
                'vibration': [vibration],
                'rain_sensor': [rain_sensor],
                'temperature': [temperature],
                'humidity': [humidity],
                'pressure': [pressure],
                'load': [load]
            })
            health = max(0, min(100, int(round(health_model.predict(features)[0]))))
        else:
            score = 100
            if vibration > 6: score -= 30
            elif vibration > 4: score -= 15
            if load > 1: score -= 25
            elif load > 0.5: score -= 10
            if temperature > 45: score -= 20
            health = max(0, score)
            
        if health >= 80:
            risk = "LOW RISK"
        elif health >= 50:
            risk = "MEDIUM RISK"
        elif health >= 25:
            risk = "HIGH RISK"
        else:
            risk = "CRITICAL"
            
        records.append({
            "created_at": current_time.isoformat(),
            "load": round(load, 2),
            "vibration": round(vibration, 2),
            "temperature": round(temperature, 2),
            "humidity": humidity,
            "pressure": round(pressure, 2),
            "accelerometer": round(accelerometer, 3),
            "gyroscope": round(gyroscope, 3),
            "rain_sensor": rain_sensor,
            "strain": strain,
            "rain": rain,
            "health": health,
            "risk": risk
        })
        
        # Increment time by 1 minute for each record
        current_time += datetime.timedelta(minutes=1)
        
    print(f"Generated {num_entries} records. Inserting into Supabase...")
    
    # Insert in batches of 100 to avoid request limits
    batch_size = 100
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        try:
            supabase.table("sensor_data").insert(batch).execute()
            print(f"Inserted batch {i//batch_size + 1}/{(len(records)-1)//batch_size + 1}")
        except Exception as e:
            print(f"Failed to insert batch {i//batch_size + 1}: {e}")
            
    print("Finished seeding database!")

if __name__ == "__main__":
    seed_data(500)
