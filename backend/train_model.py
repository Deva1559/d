import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
from supabase import create_client, Client
import sys

# Supabase Credentials
SUPABASE_URL = "https://kitbkelglymubsqrdieb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGJrZWxnbHltdWJzcXJkaWViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDUxMjA3NSwiZXhwIjoyMTA2MDg4MDc1fQ.W4oaorIB9itNixpreMcfGnbFEMa_wsGHRh-GbLXLzpY"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_data_from_supabase():
    print("Fetching data from Supabase...")
    # Fetch all records. Note: Supabase limits to 1000 rows by default unless pagination is used.
    # For a larger dataset, we would need to paginate.
    response = supabase.table("sensor_data").select("*").limit(10000).execute()
    data = response.data
    
    if not data:
        print("No data found in Supabase!")
        sys.exit(1)
        
    df = pd.DataFrame(data)
    print(f"Fetched {len(df)} records from Supabase.")
    return df

if __name__ == "__main__":
    df = fetch_data_from_supabase()
    
    # We need to map boolean/string values to numerical if necessary, but our sensors are numeric
    features = ['accelerometer', 'gyroscope', 'vibration', 'rain_sensor', 'temperature', 'humidity', 'pressure', 'load']
    
    # Ensure all feature columns exist in the fetched data
    for f in features:
        if f not in df.columns:
            print(f"Missing required feature column: {f}")
            sys.exit(1)
            
    X = df[features]
    y = df['health']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Regressor on Database Data...")
    model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    print(f"Model R2 Score: {r2_score(y_test, y_pred):.4f}")
    print(f"Model MSE: {mean_squared_error(y_test, y_pred):.4f}")
    
    joblib.dump(model, 'bridge_health_model.pkl')
    print("Model saved to bridge_health_model.pkl successfully!")
