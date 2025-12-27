/**
 * Cab Allocation Solver
 * Uses Linear Programming to optimize cab allocation
 * Ported from solved.js
 */

const solver = require("javascript-lp-solver");

interface SolverResult {
  objectiveValue: number;
  numCabsPerRegion: number[];
  assignments: number[][];
  unusedSeatsPerRegion: number[];
}

const REGION_NAMES = [
  "RK",    // Region 0: RK + RP
  "VS",    // Region 1: GKH + VS  
  "MS",    // Region 2: MS
  "HJB",   // Region 3: HJB + JCB
  "LLR",   // Region 4: LLR
  "LBS",   // Region 5: LBS + MMM
  "PAN",   // Region 6: PAN loop
];

/**
 * Maps our hall enum to region indices
 */
export const HALL_TO_REGION: Record<string, number> = {
  'RK': 0,  // RK + RP combined
  'VS': 1,  // GKH + VS combined
  'MS': 2,
  'HJB': 3, // HJB + JCB combined
  'LLR': 4,
  'LBS': 5, // LBS + MMM combined
  'PAN': 6,
};

export const REGION_TO_HALL: Record<number, string> = {
  0: 'RK',
  1: 'VS',
  2: 'MS',
  3: 'HJB',
  4: 'LLR',
  5: 'LBS',
  6: 'PAN',
};

/**
 * Solves the cab allocation problem using Linear Programming
 * @param studentsPerRegion - Array of 7 integers representing student count per region
 */
export function solveCabAllocation(studentsPerRegion: number[]): SolverResult {
  const n = 7;
  const cap = 7;
  const alpha = 1;  // Cost per unit distance (forward)
  const beta = 10;  // Cost per unit distance (backward/away from gate)
  const C_vehicle = 100;

  let model: any = {
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
    throw new Error('No feasible solution found for cab allocation');
  }

  // 4. FORMAT OUTPUT
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

/**
 * Convert hall-wise demand to region-wise array
 */
export function convertHallDemandToRegions(hallDemand: { hall: string; count: number }[]): number[] {
  const studentsPerRegion = new Array(7).fill(0);
  
  for (const demand of hallDemand) {
    const regionIdx = HALL_TO_REGION[demand.hall];
    if (regionIdx !== undefined) {
      studentsPerRegion[regionIdx] = demand.count;
    }
  }
  
  return studentsPerRegion;
}

/**
 * Test function (for development)
 */
export function testSolver() {
  const inputStudents = [1, 0, 0, 0, 0, 1, 0];
  const solution = solveCabAllocation(inputStudents);
  
  console.log("=== Optimization Result ===");
  console.log("Total Cost:", solution.objectiveValue);
  console.log("Cabs per Region:", solution.numCabsPerRegion);
  console.log("Assignments:", solution.assignments);
  console.log("Unused Seats:", solution.unusedSeatsPerRegion);
  
  return solution;
}
