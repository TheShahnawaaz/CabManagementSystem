const solver = require("javascript-lp-solver");

const REGION_NAMES = [
    "Region 1: RK + RP",
    "Region 2: GKH + VS",
    "Region 3: MS",
    "Region 4: HJB + JCB",
    "Region 5: LLR",
    "Region 6: LBS + MMM",
    "Region 7: PAN loop",
];

/**
 * Solves the cab allocation problem using Pure JS
 * @param {number[]} studentsPerRegion - Array of 7 integers
 */
function solveCabAllocationJS(studentsPerRegion) {
    const n = 7;
    const cap = 7;
    const alpha = 1;  // Cost per unit distance (forward)
    const beta = 10;  // Cost per unit distance (backward/away from gate)
    const C_vehicle = 100;

    let model = {
        optimize: "totalCost",
        opType: "min",
        constraints: {},
        variables: {},
        ints: {}
    };

    // 1. CONSTRAINTS: All students from each region MUST be assigned
    for (let i = 0; i < n; i++) {
        model.constraints[`demand_r${i}`] = { equal: studentsPerRegion[i] };
    }

    // 2. VARIABLES & OBJECTIVE
    for (let i = 0; i < n; i++) { // Origin region
        for (let j = 0; j < n; j++) { // Destination (Cab) region
            const varName = `x_${i}_${j}`;
            
            // Calculate swapping cost w_ij
            let w_ij = 0;
            if (j > i) w_ij = alpha * (j - i);      // Towards gate
            else if (i > j) w_ij = beta * (i - j);  // Away from gate

            // Define the variable
            model.variables[varName] = {
                totalCost: w_ij,
                [`demand_r${i}`]: 1, // Contributes to fulfilling origin demand
                [`supply_c${j}`]: -1  // Takes up space in destination cab
            };
            model.ints[varName] = 1;
        }
    }

    // 3. CAB CONSTRAINTS (Supply)
    // We need to determine how many cabs 'y' are needed at each region j
    // Logic: sum(X_ij) <= 7 * y_j  =>  sum(X_ij) - 7*y_j <= 0
    for (let j = 0; j < n; j++) {
        const yVar = `y_${j}`;
        model.variables[yVar] = {
            totalCost: C_vehicle,
            [`supply_c${j}`]: cap // Each cab provides 'cap' seats
        };
        model.constraints[`supply_c${j}`] = { min: 0 }; 
        model.ints[yVar] = 1;
    }

    // Run the solver
    const results = solver.Solve(model);

    if (!results.feasible) {
        return null;
    }

    // 4. FORMAT OUTPUT (Matching your original structure)
    const assignments = Array.from({ length: n }, () => Array(n).fill(0));
    const numCabsPerRegion = Array(n).fill(0);
    
    Object.keys(results).forEach(key => {
        if (key.startsWith("x_")) {
            const [, i, j] = key.split("_").map(Number);
            assignments[i][j] = results[key];
        } else if (key.startsWith("y_")) {
            const j = parseInt(key.split("_")[1]);
            numCabsPerRegion[j] = results[key];
        }
    });

    return {
        objectiveValue: results.result,
        numCabsPerRegion: numCabsPerRegion,
        assignments: assignments,
        // Calculate unused seats manually
        unusedSeatsPerRegion: numCabsPerRegion.map((cabs, j) => {
            const used = assignments.reduce((sum, row) => sum + row[j], 0);
            return (cabs * cap) - used;
        })
    };
}

// --- TEST RUN ---
const inputStudents = [10, 5, 0, 14, 1, 7, 5];
const solution = solveCabAllocationJS(inputStudents);

if (solution) {
    console.log("=== Optimization Result ===");
    console.log("Total Cost:", solution.objectiveValue);
    console.log("Cabs per Region:", solution.numCabsPerRegion);
    console.log("Unused Seats:", solution.unusedSeatsPerRegion);
} else {
    console.log("No feasible solution found.");
}