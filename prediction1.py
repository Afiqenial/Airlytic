import warnings

import pandas as pd

import numpy as np

import matplotlib.pyplot as plt

from sklearn.linear_model import LinearRegression  # type: ignore

from sklearn.ensemble import RandomForestRegressor  # type: ignore

from statsmodels.tsa.arima.model import ARIMA  # type: ignore
warnings.filterwarnings("ignore")

# ==========================================
# 1. Load and Clean Data
# ==========================================
print("Loading data...")
try:
    df = pd.read_csv('2015--2024.csv')
except FileNotFoundError:
    print("Error: '2015--2024.csv' not found. "
          "Please make sure the file is in the same folder.")
    exit()

df.rename(columns={'Total Consumption (MLD)': 'Consumption'}, inplace=True)
df['Year'] = df['Year'].astype(int)
states_incomplete = ['Sabah', 'Sarawak']
states_all = df['State'].unique()

# ==========================================
# 2. Train Global Hybrid Model (on available data)
# ==========================================
print("Training Global Hybrid Model...")
df_sorted = df.sort_values(by=['State', 'Year'])
df_sorted['Lag1'] = df_sorted.groupby('State')['Consumption'].shift(1)
df_sorted['Lag2'] = df_sorted.groupby('State')['Consumption'].shift(2)

# Training Set: All rows where we have lags
df_train = df_sorted.dropna()

# Features
X_trend_train = pd.get_dummies(
    df_train[['Year', 'State']], columns=['State'], drop_first=False
)
y_train = df_train['Consumption']

# Train Linear Regression (Trend)
lr_model = LinearRegression()
lr_model.fit(X_trend_train, y_train)
df_train['Trend_Pred'] = lr_model.predict(X_trend_train)
df_train['Residuals'] = df_train['Consumption'] - df_train['Trend_Pred']

# Train Random Forest (Residuals)
X_rf_train = pd.get_dummies(
    df_train[['Lag1', 'Lag2', 'State']], columns=['State'], drop_first=False
)

rf_model = RandomForestRegressor(n_estimators=200, random_state=42)
rf_model.fit(X_rf_train, df_train['Residuals'])

# ==========================================
# 3. FILL GAPS: Predict 2023-2024 for Sabah/Sarawak
# =========================================

print("Filling missing 2023-2024 data...")
imputed_rows = []

for state in states_incomplete:
    state_hist = df_sorted[df_sorted['State'] == state].copy()

    # A. ARIMA Model
    arima_model = ARIMA(state_hist['Consumption'], order=(1, 1, 1))
    arima_fit = arima_model.fit()
    arima_forecast = arima_fit.forecast(steps=2)

    # B. Hybrid Model Recursive
    current_lag1 = state_hist.iloc[-1]['Consumption']  # 2022
    current_lag2 = state_hist.iloc[-2]['Consumption']  # 2021

    for i, year in enumerate([2023, 2024]):

        # Trend Input
        row_trend = pd.DataFrame({'Year': [year], 'State': [state]})
        row_trend_enc = pd.get_dummies(
            row_trend, columns=['State'], drop_first=False
        )
        
        row_trend_enc = row_trend_enc.reindex(
            columns=X_trend_train.columns, fill_value=0
        )

        trend_val = lr_model.predict(row_trend_enc)[0]

        # Residual Input
        row_rf = pd.DataFrame({
            'Lag1': [current_lag1],
            'Lag2': [current_lag2],
            'State': [state]
        })

        row_rf_enc = pd.get_dummies(
            row_rf, columns=['State'], drop_first=False
        )
        
        row_rf_enc = row_rf_enc.reindex(
            columns=X_rf_train.columns, fill_value=0
        )

        resid_val = rf_model.predict(row_rf_enc)[0]
        
        # Combine
        hybrid_pred = trend_val + resid_val
        final_val = (hybrid_pred + arima_forecast.iloc[i]) / 2

        imputed_rows.append({'State': state, 'Year': year,
                            'Consumption': final_val, 'Type': 'Imputed'})

        # Update lags
        current_lag2 = current_lag1
        current_lag1 = final_val

# Merge filled data
df_imputed = pd.DataFrame(imputed_rows)
if not df_imputed.empty:
    df_full = pd.concat(
        [df, df_imputed[['State', 'Year', 'Consumption']]], ignore_index=True
    )

else:
    df_full = df.copy()

df_full = df_full.sort_values(by=['State', 'Year']).reset_index(drop=True)

# ==========================================
# 4. FORECAST 2025-2029 (All States)
# ==========================================
print("Generating Forecasts (2025-2029)...")

# Recalculate lags on full data
df_full['Lag1'] = df_full.groupby('State')['Consumption'].shift(1)
df_full['Lag2'] = df_full.groupby('State')['Consumption'].shift(2)
future_years = [2025, 2026, 2027, 2028, 2029]

all_predictions = []

for state in states_all:
    state_data = df_full[df_full['State'] == state].dropna()  
    
    # ARIMA for this state
    try:
        arima_model = ARIMA(state_data['Consumption'], order=(1, 1, 1))
        arima_fit = arima_model.fit()
        arima_forecast = arima_fit.forecast(steps=5)

    except Exception as e:

        print(
            f"Warning: ARIMA model failed for state '{state}': {e}. "
            "Using fallback."
        )

        # Fallback if ARIMA fails
        arima_forecast = pd.Series([np.nan] * 5)
    current_lag1 = state_data.iloc[-1]['Consumption']
    current_lag2 = state_data.iloc[-2]['Consumption']
    
    for i, year in enumerate(future_years):
        
        # Trend
        row_trend = pd.DataFrame({'Year': [year], 'State': [state]})
        row_trend_enc = pd.get_dummies(
            row_trend, columns=['State'], drop_first=False
        )

        row_trend_enc = row_trend_enc.reindex(
            columns=X_trend_train.columns, fill_value=0
        )

        trend_val = lr_model.predict(row_trend_enc)[0]

        # Residual
        row_rf = pd.DataFrame({
            'Lag1': [current_lag1],
            'Lag2': [current_lag2],
            'State': [state]
        })

        row_rf_enc = pd.get_dummies(
            row_rf, columns=['State'], drop_first=False
        )

        row_rf_enc = row_rf_enc.reindex(
            columns=X_rf_train.columns, fill_value=0
        )

        resid_val = rf_model.predict(row_rf_enc)[0]
        hybrid_pred = trend_val + resid_val

        # Ensemble
        if not np.isnan(arima_forecast.iloc[i]):
            final_pred = (hybrid_pred + arima_forecast.iloc[i]) / 2

        else:
            final_pred = hybrid_pred
            
        all_predictions.append({'State': state, 'Year': year,
                                'Prediction': final_pred})

        # Update lags
        current_lag2 = current_lag1
        current_lag1 = final_pred

# Save Results
final_df = pd.DataFrame(all_predictions)
final_df.to_csv('prediction_results_2025_2029.csv', index=False)
print("Results saved to 'prediction_results_2025_2029.csv'")

# ==========================================
# 5. Visualize Results
# ==========================================

num_states = len(states_all)
cols = 3
rows = (num_states // cols) + (1 if num_states % cols > 0 else 0)
fig, axes = plt.subplots(rows, cols, figsize=(15, 4 * rows))
axes = axes.flatten()

for i, state in enumerate(states_all):
    ax = axes[i]

    # Plot History (Real + Filled)
    hist = df_full[df_full['State'] == state]
    ax.plot(hist['Year'], hist['Consumption'], 'b-o',
            label='Historical', markersize=4)

    # Plot Forecast
    fcst = final_df[final_df['State'] == state]
    ax.plot(fcst['Year'], fcst['Prediction'], 'r--x',
            label='Forecast', markersize=6)

    # Connect lines
    if not hist.empty and not fcst.empty:
        ax.plot(
            [hist.iloc[-1]['Year'], fcst.iloc[0]['Year']],
            [hist.iloc[-1]['Consumption'], fcst.iloc[0]['Prediction']],
            'r--'
        )

    ax.set_title(state)
    ax.grid(True, alpha=0.3)
    if i == 0:
        ax.legend()

# Hide empty subplots
for j in range(i+1, len(axes)):
    axes[j].axis('off')

plt.tight_layout()
plt.savefig('final_forecast_plot.png')
print("Plot saved to 'final_forecast_plot.png'")
plt.show()