import tkinter as tk
from tkinter import messagebox
from ortools.sat.python import cp_model

REGION_NAMES = [
    "Region 1: RK + RP",
    "Region 2: GKH + VS",
    "Region 3: MS",
    "Region 4: HJB + JCB",
    "Region 5: LLR",
    "Region 6: LBS + MMM",
    "Region 7: PAN loop",
]


def solve_cab_allocation(students_per_region):
    if len(students_per_region) != 7:
        raise ValueError("students_per_region must have length 7")

    n_regions = 7
    cap = 7
    alpha = 1
    beta = 10
    C_vehicle = 100

    total_students = sum(students_per_region)
    regions = range(n_regions)

    model = cp_model.CpModel()

    # X[i,j] = number of students from region i assigned to cabs at region j
    X = {}
    for i in regions:
        for j in regions:
            X[i, j] = model.NewIntVar(0, students_per_region[i], f"x_{i}_{j}")

    # y[j] = number of cabs at region j
    y = {}
    for j in regions:
        y[j] = model.NewIntVar(0, total_students, f"y_{j}")

    # r[j] = vacant seats at region j (0..6)
    r = {}
    for j in regions:
        r[j] = model.NewIntVar(0, cap - 1, f"r_{j}")

    # 1) All students from each region assigned somewhere
    for i in regions:
        model.Add(sum(X[i, j] for j in regions) == students_per_region[i])

    # 2) Capacity: sum_i X[i,j] + r_j = 7 * y_j
    for j in regions:
        model.Add(sum(X[i, j] for i in regions) + r[j] == cap * y[j])

    # 3) Objective: cab cost + swapping cost
    objective_terms = []

    # Vehicle cost
    objective_terms.append(C_vehicle * sum(y[j] for j in regions))

    # Swapping cost w(i,j)
    for i in regions:
        for j in regions:
            if i == j:
                w_ij = 0
            elif j > i:
                # with flow (towards gate)
                w_ij = alpha * (j - i)
            else:
                # against flow (away from gate)
                w_ij = beta * (i - j)

            if w_ij != 0:
                objective_terms.append(w_ij * X[i, j])

    model.Minimize(sum(objective_terms))

    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return None

    assignments = [
        [solver.Value(X[i, j]) for j in regions]
        for i in regions
    ]
    num_cabs_per_region = [solver.Value(y[j]) for j in regions]
    unused_seats_per_region = [solver.Value(r[j]) for j in regions]

    return {
        "numCabsPerRegion": num_cabs_per_region,
        "unusedSeatsPerRegion": unused_seats_per_region,
        "assignments": assignments,
        "objectiveValue": solver.ObjectiveValue(),
    }


# ---------- PRESENTATION HELPERS ----------

def build_summary_block(students, result):
    lines = []
    lines.append("=== Optimization Summary ===")
    lines.append(f"Objective value: {result['objectiveValue']:.2f}")
    total_cabs = sum(result["numCabsPerRegion"])
    total_students = sum(students)
    lines.append(f"Total students: {total_students}")
    lines.append(f"Total cabs used: {total_cabs}")
    lines.append("")

    lines.append("---- Per Region Summary ----")
    lines.append(f"{'Region':<25} {'Students':>8} {'Cabs':>8} {'Unused':>8}")
    for i, name in enumerate(REGION_NAMES):
        s = students[i]
        cabs = result["numCabsPerRegion"][i]
        unused = result["unusedSeatsPerRegion"][i]
        lines.append(f"{name:<25} {s:>8} {cabs:>8} {unused:>8}")
    lines.append("")
    return "\n".join(lines)


def build_movement_block(students, result):
    assignments = result["assignments"]
    lines = []
    lines.append("=== Movement Summary (who moves where) ===")
    for i in range(7):
        total = students[i]
        stay = assignments[i][i]
        moved = total - stay
        lines.append(f"{REGION_NAMES[i]}:")
        lines.append(f"  Total students: {total}")
        lines.append(f"  Stay in own region: {stay}")
        lines.append(f"  Move to other regions: {moved}")
        for j in range(7):
            if j == i:
                continue
            val = assignments[i][j]
            if val > 0:
                lines.append(f"    -> {val} students to {REGION_NAMES[j]}")
        lines.append("")
    return "\n".join(lines)


def build_cab_plan_block(result):
    assignments = result["assignments"]
    num_cabs = result["numCabsPerRegion"]

    lines = []
    lines.append("=== Cab-wise Plan (per cab verdict) ===")
    global_cab_idx = 1

    for j in range(7):  # destination / cab region
        cabs_here = num_cabs[j]
        if cabs_here == 0:
            continue

        lines.append(f"{REGION_NAMES[j]} - {cabs_here} cab(s):")
        # remaining students from each origin going to region j
        remaining = {i: assignments[i][j] for i in range(7)}

        for _ in range(cabs_here):
            cab_cap = 7
            cab_load = {}

            # Greedy fill this cab using remaining students
            for i in range(7):
                if remaining[i] <= 0 or cab_cap == 0:
                    continue
                take = min(remaining[i], cab_cap)
                cab_load[i] = take
                remaining[i] -= take
                cab_cap -= take

            total_used = sum(cab_load.values())
            origin_regions = [i for i, v in cab_load.items() if v > 0]

            if len(origin_regions) == 1 and origin_regions[0] == j:
                cab_type = "Direct cab: ONLY students from its own region."
            elif len(origin_regions) == 0:
                cab_type = "Empty cab (no students) - should not happen."
            else:
                cab_type = "Mixed cab: boarding students from multiple regions."

            lines.append(f"  Cab {global_cab_idx}: {cab_type}")
            lines.append(f"    Seats used: {total_used} / 7")

            if origin_regions:
                lines.append("    Boarding:")
                for i in origin_regions:
                    suffix = " (home region)" if i == j else ""
                    lines.append(
                        f"      {cab_load[i]} student(s) from R{i+1}{suffix}"
                    )

            global_cab_idx += 1

        lines.append("")

    return "\n".join(lines)


def build_matrix_block(result):
    assignments = result["assignments"]
    lines = []
    lines.append("=== Assignment Matrix (From region -> Cab region) ===")
    header = "From\\To  " + " ".join([f"R{j+1:>3}" for j in range(7)])
    lines.append(header)
    for i in range(7):
        row_vals = assignments[i]
        row_str = f"R{i+1:>3}    " + " ".join(f"{v:>3}" for v in row_vals)
        lines.append(row_str)
    lines.append("")
    return "\n".join(lines)


def build_output_text(students, result):
    summary = build_summary_block(students, result)
    movement = build_movement_block(students, result)
    cab_plan = build_cab_plan_block(result)
    matrix = build_matrix_block(result)

    # Combine blocks
    return "\n".join([summary, movement, cab_plan, matrix])


# ---------- TKINTER UI ----------

def on_optimize(entries, output_text):
    try:
        students = []
        for e in entries:
            val_str = e.get().strip()
            if val_str == "":
                val = 0
            else:
                val = int(val_str)
                if val < 0:
                    raise ValueError
            students.append(val)
    except ValueError:
        messagebox.showerror("Input error", "Please enter non-negative integers for all regions.")
        return

    if sum(students) == 0:
        messagebox.showinfo("No students", "Total students is 0. Nothing to optimize.")
        return

    result = solve_cab_allocation(students)
    if result is None:
        messagebox.showerror("Solver error", "No feasible solution found.")
        return

    text = build_output_text(students, result)
    output_text.config(state="normal")
    output_text.delete("1.0", tk.END)
    output_text.insert(tk.END, text)
    output_text.config(state="disabled")


def main():
    root = tk.Tk()
    root.title("Friday Cab Optimization Dashboard")

    # Input frame
    input_frame = tk.LabelFrame(root, text="Students per region", padx=10, pady=10)
    input_frame.grid(row=0, column=0, padx=10, pady=10, sticky="nw")

    entries = []
    for i, name in enumerate(REGION_NAMES):
        lbl = tk.Label(input_frame, text=name, anchor="w")
        lbl.grid(row=i, column=0, sticky="w", pady=2)

        ent = tk.Entry(input_frame, width=10)
        ent.grid(row=i, column=1, padx=5, pady=2)
        ent.insert(0, "0")
        entries.append(ent)

    optimize_btn = tk.Button(
        input_frame,
        text="Optimize",
        command=lambda: on_optimize(entries, output_text)
    )
    optimize_btn.grid(row=len(REGION_NAMES), column=0, columnspan=2, pady=10)

    # Output frame
    output_frame = tk.LabelFrame(root, text="Result", padx=10, pady=10)
    output_frame.grid(row=0, column=1, padx=10, pady=10, sticky="nsew")

    output_text = tk.Text(output_frame, width=100, height=35)
    output_text.pack(fill="both", expand=True)
    output_text.config(state="disabled")

    root.columnconfigure(1, weight=1)
    root.rowconfigure(0, weight=1)

    root.mainloop()


if __name__ == "__main__":
    main()
