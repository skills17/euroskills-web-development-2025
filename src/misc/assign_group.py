# assign_group.py
#
# This script assigns sub-criteria to expert teams to balance points, measurements, judgments, and day distribution.
# This ensures each team has a fair workload and diverse tasks.
# It uses linear programming via the PuLP library.
#
# Usage:
#   python assign_group.py

# pip install pulp
import pulp as pl

# ---------- Input ----------
# Each sub-criterion is atomic and carries totals for its aspects.
subcriteria = [
    # id, day, points, n_meas, n_judg
    {"id":"A1","day":1,"points":2,"meas":2,"judg":2},
    {"id":"A2","day":1,"points":3.5,"meas":11,"judg":1},
    {"id":"A3","day":1,"points":4,"meas":7,"judg":2},
    {"id":"A4","day":1,"points":2,"meas":2,"judg":1},
    {"id":"A5","day":1,"points":5,"meas":4,"judg":1},
    {"id":"B1","day":1,"points":5.25,"meas":11,"judg":3},
    {"id":"B2","day":1,"points":5,"meas":6,"judg":0},
    {"id":"B3","day":1,"points":4.5,"meas":1,"judg":3},
    {"id":"B4","day":1,"points":5.75,"meas":11,"judg":0},
    {"id":"B5","day":1,"points":2.5,"meas":8,"judg":0},
    {"id":"C1","day":2,"points":1.75,"meas":4,"judg":0},
    {"id":"C2","day":2,"points":3.25,"meas":7,"judg":0},
    {"id":"C3","day":2,"points":4,"meas":5,"judg":0},
    {"id":"C4","day":2,"points":3,"meas":4,"judg":0},
    {"id":"C5","day":2,"points":2.75,"meas":4,"judg":0},
    {"id":"C6","day":2,"points":2,"meas":5,"judg":0},
    {"id":"D1","day":2,"points":3.25,"meas":10,"judg":0},
    {"id":"D2","day":2,"points":2.75,"meas":4,"judg":1},
    {"id":"D3","day":2,"points":4.35,"meas":14,"judg":1},
    {"id":"D4","day":2,"points":1.5,"meas":4,"judg":0},
    {"id":"D5","day":2,"points":2.5,"meas":7,"judg":0},
    {"id":"D6","day":2,"points":1.75,"meas":7,"judg":0},
    {"id":"D7","day":2,"points":1,"meas":2,"judg":0},
    {"id":"D8","day":2,"points":2,"meas":4,"judg":0},
    {"id":"D9","day":2,"points":2.9,"meas":3,"judg":1},
    {"id":"E1","day":3,"points":5,"meas":3,"judg":2},
    {"id":"E2","day":3,"points":5.5,"meas":6,"judg":0},
    {"id":"E3","day":3,"points":6.25,"meas":13,"judg":1},
    {"id":"F1","day":3,"points":2,"meas":1,"judg":0},
    {"id":"F2","day":3,"points":1,"meas":1,"judg":0},
    {"id":"F3","day":3,"points":2,"meas":1,"judg":0},
]
num_groups = 5
groups = list(range(1, num_groups+1))
S = [s["id"] for s in subcriteria]
day_of = {s["id"]: s["day"] for s in subcriteria}
points = {s["id"]: s["points"] for s in subcriteria}
meas   = {s["id"]: s["meas"]   for s in subcriteria}
judg   = {s["id"]: s["judg"]   for s in subcriteria}
days = sorted({s["day"] for s in subcriteria})

# Targets per group
P_total = sum(points.values()); P_target = P_total / num_groups
M_total = sum(meas.values());   M_target = M_total / num_groups
J_total = sum(judg.values());   J_target = J_total / num_groups
Nd_total = {d: sum(1 for sid in S if day_of[sid]==d) for d in days}
Nd_target = {d: Nd_total[d] / num_groups for d in days}

# ---------- Model ----------
m = pl.LpProblem("Balanced_Group_Assignment", pl.LpMinimize)

# Decision: assign sub-criterion s to group g
x = pl.LpVariable.dicts("x", (S, groups), lowBound=0, upBound=1, cat="Binary")

# Per-group aggregates
Pg = {g: pl.lpSum(points[s]*x[s][g] for s in S) for g in groups}
Mg = {g: pl.lpSum(meas[s]*x[s][g]   for s in S) for g in groups}
Jg = {g: pl.lpSum(judg[s]*x[s][g]   for s in S) for g in groups}
Ngd = {(g,d): pl.lpSum(x[s][g] for s in S if day_of[s]==d) for g in groups for d in days}

# Absolute deviations
devP = pl.LpVariable.dicts("devP", groups, lowBound=0)
devM = pl.LpVariable.dicts("devM", groups, lowBound=0)
devJ = pl.LpVariable.dicts("devJ", groups, lowBound=0)
devD = pl.LpVariable.dicts("devD", [(g,d) for g in groups for d in days], lowBound=0)

# Max deviation for points (priority 1)
zP = pl.LpVariable("zP", lowBound=0)

# Assignment constraints: each sub-criterion to exactly one group
for s in S:
    m += pl.lpSum(x[s][g] for g in groups) == 1

# Deviation constraints
for g in groups:
    m +=  devP[g] >= Pg[g] - P_target
    m +=  devP[g] >= -(Pg[g] - P_target)
    m +=  zP >= devP[g]

    m +=  devM[g] >= Mg[g] - M_target
    m +=  devM[g] >= -(Mg[g] - M_target)
    m +=  devJ[g] >= Jg[g] - J_target
    m +=  devJ[g] >= -(Jg[g] - J_target)

for g in groups:
    for d in days:
        tgt = Nd_target[d]
        m += devD[(g,d)] >= Ngd[(g,d)] - tgt
        m += devD[(g,d)] >= -(Ngd[(g,d)] - tgt)

# Weighted objective (lexicographic-ish): (1) points, (2) type counts, (3) day spread
w1, w2, w3 = 1_000_000, 1_000, 1
m += w1*zP + w2*pl.lpSum(devM[g] + devJ[g] for g in groups) + w3*pl.lpSum(devD[g,d] for g in groups for d in days)

# Solve
solver = pl.PULP_CBC_CMD(
    msg=True,          # stream progress to stdout
    timeLimit=30,      # optional: stop after x seconds
    gapRel=0.01,       # optional: stop at 1% MIP gap
    threads=4,
)
m.solve(solver)

# ---------- Report ----------
assign = {g: [] for g in groups}
for s in S:
    for g in groups:
        if pl.value(x[s][g]) > 0.5:
            assign[g].append(s)

def summarize_group(g):
    return {
        "subs": assign[g],
        "points": round(pl.value(Pg[g]),2),
        "meas": round(pl.value(Mg[g]),2),
        "judg": round(pl.value(Jg[g]),2),
        **{f"day{d}": int(pl.value(Ngd[(g,d)])) for d in days}
    }

print("Targets per group:",
      {"points": P_target, "meas": M_target, "judg": J_target,
       **{f"day{d}": Nd_target[d] for d in days}})
print("\nAssignment:")
for g in groups:
    print(f"Group {g}: ", summarize_group(g))
print("\nMax points deviation:", pl.value(zP))
