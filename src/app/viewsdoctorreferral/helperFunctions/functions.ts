export function getServiceNames(services: any[]): string {
    return services?.map((s) => s.name).join(', ');
}

export function calculateTotalCost(data: any[]): number {
    return data.reduce((total: number, item: any) => {
      return total + (item.billingAmount || 0);
    }, 0);
}

export function calculatePayout(data: any[]): number {
  return data
    .filter((item) => item.payoutApproved === false)
    .reduce((sum, item) => sum + (item.calculatedShare || 0), 0);
}


  
