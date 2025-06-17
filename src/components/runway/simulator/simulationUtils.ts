
export interface SimulationInputs {
  cashReserve: number;
  burnRate: number;
  revenueIncrease: number;
  costReduction: number;
  addFunding: number;
}

export interface SimulationResult {
  cashReserve: number;
  burnRate: number;
  runwayMonths: number;
  estimatedRunoutDate: Date;
}

export const calculateSimulation = (values: SimulationInputs): SimulationResult => {
  // Calcular o novo burn rate após as alterações
  const costReductionAmount = (values.costReduction / 100) * values.burnRate;
  const revenueIncreaseAmount = (values.revenueIncrease / 100) * values.burnRate;
  
  const newBurnRate = Math.max(0, values.burnRate - costReductionAmount - revenueIncreaseAmount);
  const newCashReserve = values.cashReserve + values.addFunding;
  
  // Calcular o novo runway (em meses)
  const newRunwayMonths = newBurnRate > 0 ? newCashReserve / newBurnRate : 99;
  
  // Calcular a data estimada de esgotamento
  const estimatedRunoutDate = new Date();
  estimatedRunoutDate.setDate(estimatedRunoutDate.getDate() + Math.floor(newRunwayMonths * 30));
  
  return {
    cashReserve: newCashReserve,
    burnRate: newBurnRate,
    runwayMonths: newRunwayMonths,
    estimatedRunoutDate,
  };
};
