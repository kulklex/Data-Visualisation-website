import pandas as pd # pyright: ignore[reportMissingModuleSource]
import numpy as np # type: ignore
from sklearn.ensemble import RandomForestRegressor # type: ignore
import random

# ============================================
# LOAD REAL DATA
# ============================================
df = pd.read_csv("england.csv")

df["Season"] = df["Season"].astype(str)

# auto-detect last real season (ex: 2023-24)
real_last = sorted(df["Season"].unique())[-1]
print("Last real season detected:", real_last)

last_df = df[df["Season"] == real_last].copy()

# ============================================
# ALL TEAMS
# ============================================
all_teams = sorted(set(df["HomeTeam"].unique()) | set(df["AwayTeam"].unique()))

# EPL teams = teams in last real season
epl_teams = sorted(set(last_df["HomeTeam"].unique()) | set(last_df["AwayTeam"].unique()))

# rest go championship
championship_teams = [t for t in all_teams if t not in epl_teams]

print("Starting EPL:", len(epl_teams))
print("Starting Championship:", len(championship_teams))

# safety check
if len(epl_teams) != 20:
    print("WARNING: EPL not 20 teams. Auto-fixing...")
    team_counts = last_df["HomeTeam"].value_counts() + last_df["AwayTeam"].value_counts()
    epl_teams = team_counts.sort_values(ascending=False).head(20).index.tolist()
    championship_teams = [t for t in all_teams if t not in epl_teams]

# ============================================
# TEAM STRENGTH FROM REAL DATA
# ============================================
team_strength = {}

for team in all_teams:
    home = df[df["HomeTeam"] == team]
    away = df[df["AwayTeam"] == team]

    gf = home["FTH Goals"].sum() + away["FTA Goals"].sum()
    ga = home["FTA Goals"].sum() + away["FTH Goals"].sum()
    games = len(home) + len(away)

    if games == 0:
        atk = 1
        deff = 1
    else:
        atk = gf / games
        deff = ga / games

    team_strength[team] = {
        "attack": atk,
        "defense": deff,
        "rating": atk - deff
    }

# ============================================
# TRAIN ML MODELS
# ============================================
features = ["H Shots", "A Shots", "H Corners", "A Corners"]

X = df[features].fillna(0)
y_home = df["FTH Goals"]
y_away = df["FTA Goals"]

home_model = RandomForestRegressor(n_estimators=200, random_state=42)
away_model = RandomForestRegressor(n_estimators=200, random_state=42)

home_model.fit(X, y_home)
away_model.fit(X, y_away)

print("ML models trained")

# ============================================
# MATCH SIMULATOR
# ============================================
def simulate_match(home, away, season):

    hr = team_strength[home]["rating"]
    ar = team_strength[away]["rating"]

    # realistic stat generation
    home_shots = int(np.random.normal(12 + hr*2, 3))
    away_shots = int(np.random.normal(10 + ar*2, 3))

    home_corners = int(np.random.normal(5 + hr, 2))
    away_corners = int(np.random.normal(4 + ar, 2))

    home_shots = max(1, home_shots)
    away_shots = max(1, away_shots)
    home_corners = max(0, home_corners)
    away_corners = max(0, away_corners)

    row = pd.DataFrame([{
        "H Shots": home_shots,
        "A Shots": away_shots,
        "H Corners": home_corners,
        "A Corners": away_corners
    }])

    hg = home_model.predict(row)[0]
    ag = away_model.predict(row)[0]

    hg = max(0, round(hg + np.random.normal(0, 0.7)))
    ag = max(0, round(ag + np.random.normal(0, 0.7)))

    return {
        "Season": season,
        "HomeTeam": home,
        "AwayTeam": away,
        "PredictedHomeGoals": hg,
        "PredictedAwayGoals": ag,
        "PredictedScore": f"{hg}-{ag}",
        "HomeShots": home_shots,
        "AwayShots": away_shots,
        "HomeCorners": home_corners,
        "AwayCorners": away_corners
    }

# ============================================
# BUILD TABLE
# ============================================
def build_table(matches):

    table = {}

    for m in matches:
        h = m["HomeTeam"]
        a = m["AwayTeam"]

        for t in [h, a]:
            if t not in table:
                table[t] = {"team": t, "pts": 0, "gd": 0, "gf": 0, "ga": 0}

        hg = m["PredictedHomeGoals"]
        ag = m["PredictedAwayGoals"]

        table[h]["gf"] += hg
        table[h]["ga"] += ag
        table[a]["gf"] += ag
        table[a]["ga"] += hg

        if hg > ag:
            table[h]["pts"] += 3
        elif ag > hg:
            table[a]["pts"] += 3
        else:
            table[h]["pts"] += 1
            table[a]["pts"] += 1

    for t in table.values():
        t["gd"] = t["gf"] - t["ga"]

    arr = list(table.values())
    arr.sort(key=lambda x: (x["pts"], x["gd"], x["gf"]), reverse=True)

    return arr

# ============================================
# LEAGUE SIMULATOR
# ============================================
def simulate_league(teams, season):

    matches = []

    for i in range(len(teams)):
        for j in range(i+1, len(teams)):
            home = teams[i]
            away = teams[j]

            matches.append(simulate_match(home, away, season))
            matches.append(simulate_match(away, home, season))

    table = build_table(matches)
    return matches, table

# ============================================
# 100 YEAR SIMULATION
# ============================================
all_matches = []

# determine starting year from last real season
start_year = int(real_last.split("/")[0]) + 1
seasons_to_sim = 100

for s in range(seasons_to_sim):

    year1 = start_year + s
    year2 = str(year1 + 1)[-2:]
    season_str = f"{year1}-{year2}"

    print("Simulating", season_str)

    # EPL
    epl_matches, epl_table = simulate_league(epl_teams, season_str)

    # Championship
    champ_matches, champ_table = simulate_league(championship_teams, season_str)

    all_matches += epl_matches
    all_matches += champ_matches

    # relegation (bottom 3 EPL)
    relegated = [t["team"] for t in epl_table[-3:]]

    # promotion (top 3 championship)
    promoted = [t["team"] for t in champ_table[:3]]

    # swap leagues
    epl_teams = [t for t in epl_teams if t not in relegated] + promoted
    championship_teams = [t for t in championship_teams if t not in promoted] + relegated

    # ensure exactly 20 EPL teams
    epl_teams = list(dict.fromkeys(epl_teams))[:20]
    championship_teams = [t for t in all_teams if t not in epl_teams]

    # rating drift realism
    for t in team_strength:
        team_strength[t]["attack"] *= np.random.normal(1, 0.03)
        team_strength[t]["defense"] *= np.random.normal(1, 0.03)
        team_strength[t]["rating"] = team_strength[t]["attack"] - team_strength[t]["defense"]

    # promoted boost realism
    for t in promoted:
        team_strength[t]["attack"] *= np.random.normal(1.05, 0.03)

# ============================================
# SAVE OUTPUT
# ============================================
pred_df = pd.DataFrame(all_matches)
pred_df.to_csv("100_year_predictions.csv", index=False)

print("DONE.")
print("Saved file: 100_year_predictions.csv")
print("Total matches simulated:", len(pred_df))