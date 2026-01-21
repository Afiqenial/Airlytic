import warnings
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression  # type: ignore
from sklearn.ensemble import RandomForestRegressor  # type: ignore
from statsmodels.tsa.arima.model import ARIMA  # type: ignore

warnings.filterwarnings("ignore")

# 1. Load Data
df_full = pd.read_csv('2003-2024.csv')
df_full.rename(columns={'Total Consumption (MLD)': 'Consumption'}, 
               inplace=True)

# Define states with gaps and all states
states_incomplete = ['Sabah', 'Sarawak']
states_all = sorted(df_full['State'].unique())

final_viz_rows = []

print("Running State-Specific logical forecasting (LR + ARIMA + Random Forest) with Gap-Filling...")

for state in states_all:
    # Get all available data for this state
    state_df = df_full[df_full['State'] == state].sort_values('Year')

    # --- PHASE 1: PREPARE TRAINING DATA ---
    if state in states_incomplete:
        train_data = state_df[state_df['Year'] <= 2022].copy()
    else:
        train_data = state_df[state_df['Year'] <= 2024].copy()

    # --- PHASE 2: MODELING (Linear Trend + ARIMA + Random Forest) ---
    X_train = train_data[['Year']].values
    y_train = train_data['Consumption'].values

    # 1. Trend Component (Linear Regression)
    trend_model = LinearRegression().fit(X_train, y_train)

    # 2. Non-Linear Component (Random Forest) - Added
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42).fit(X_train, y_train)

    # 3. Time-Series Component (ARIMA)
    try:
        arima_model = ARIMA(y_train, order=(1, 1, 1)).fit()
    except:
        arima_model = None

    # --- PHASE 3: FILLING GAPS (2023-2024) ---
    if state in states_incomplete:
        for year in [2023, 2024]:
            trend_val = trend_model.predict([[year]])[0]
            rf_val = rf_model.predict([[year]])[0] # Added RF Prediction
            
            if arima_model:
                steps = year - 2022
                arima_val = arima_model.forecast(steps=int(steps)).tolist()[-1]
                # Average of 3 models for better logic
                final_val = (trend_val + arima_val + rf_val) / 3
            else:
                final_val = (trend_val + rf_val) / 2

            final_viz_rows.append(pd.DataFrame([{'Year': year, 'State': state, 'Consumption': final_val, 'Type': 'Imputed'}]))

    # --- PHASE 4: FORECASTING (2025-2029) ---
    for year in range(2025, 2030):
        trend_val = trend_model.predict([[year]])[0]
        rf_val = rf_model.predict([[year]])[0] # Added RF Prediction
        
        if arima_model:
            steps = year - train_data['Year'].max()
            arima_val = arima_model.forecast(steps=int(steps)).tolist()[-1]
            # Average of 3 models
            final_val = (trend_val + arima_val + rf_val) / 3
        else:
            final_val = (trend_val + rf_val) / 2

        final_viz_rows.append(pd.DataFrame([{'Year': year, 'State': state, 'Consumption': final_val, 'Type': 'Forecast'}]))

    # --- PHASE 5: ACTUAL DATA (2015-2024) ---
    actuals = state_df[(state_df['Year'] >= 2015) & (state_df['Year'] <= 2024)].copy()
    if state in states_incomplete:
        actuals = actuals[actuals['Year'] <= 2022]

    actuals['Type'] = 'Actual'
    final_viz_rows.append(actuals[['Year', 'State', 'Consumption', 'Type']])

# 2. Combine and Export
final_viz_df = pd.concat(final_viz_rows, ignore_index=True).sort_values(['State', 'Year'])
final_viz_df.to_csv('final_logical_forecast_2015_2029.csv', index=False)

# 3. Final Visualization
num_states = len(states_all)
cols = 3
rows = int(np.ceil(num_states / cols))
fig, axes = plt.subplots(rows, cols, figsize=(20, 5 * rows))
axes = axes.flatten()

for i, state in enumerate(states_all):
    ax = axes[i]
    s_df = final_viz_df[final_viz_df['State'] == state].sort_values('Year')
    act, imp, fst = s_df[s_df['Type'] == 'Actual'], s_df[s_df['Type'] == 'Imputed'], s_df[s_df['Type'] == 'Forecast']

    ax.plot(act['Year'], act['Consumption'], color='blue', marker='o', label='Actual', linewidth=2)
    if not imp.empty:
        ax.plot(imp['Year'], imp['Consumption'], color='green', marker='s', label='Imputed', linewidth=2)
    ax.plot(fst['Year'], fst['Consumption'], color='red', marker='x', linestyle='--', label='Forecast', linewidth=2)

    ax.set_title(f"{state} (Triple Ensemble)", fontsize=14)
    ax.grid(True, linestyle=':', alpha=0.6)
    if i == 0: ax.legend()

for j in range(i + 1, len(axes)): axes[j].axis('off')
plt.tight_layout()
plt.savefig('logical_water_forecast_viz.png')
plt.show()

print("Process complete. 'final_logical_forecast_2015_2029.csv' is ready for Tableau.")