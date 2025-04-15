import { Expense, Participant, ExpenseSummary, Payment } from "@/models/types";

/**
 * Calculates the expense summary for each participant
 * @param expenses List of expenses
 * @param participants List of participants
 * @returns Array of expense summaries
 */
export function calculateExpenseSummary(
  expenses: Expense[],
  participants: Participant[]
): ExpenseSummary[] {
  // Create a map to track how much each person has paid and owes
  const summaryMap = new Map<string, ExpenseSummary>();
  
  // Initialize the summary map with all participants
  participants.forEach(participant => {
    summaryMap.set(participant.id, {
      participantId: participant.id,
      name: participant.name,
      paid: 0,
      owes: 0,
      netAmount: 0,
    });
  });
  
  // Process each expense
  expenses.forEach(expense => {
    // Update the paid amount for the person who paid
    const payer = summaryMap.get(expense.paidBy);
    if (payer) {
      payer.paid += expense.amount;
    }
    
    // Update the owed amount for each person in the split
    expense.splitBetween.forEach(split => {
      const debtor = summaryMap.get(split.participantId);
      if (debtor) {
        debtor.owes += split.amount;
      }
    });
  });
  
  // Calculate the net amount for each person
  summaryMap.forEach(summary => {
    summary.netAmount = summary.paid - summary.owes;
  });
  
  return Array.from(summaryMap.values());
}

/**
 * Calculates the optimal payments to settle the expenses
 * @param summaries Array of expense summaries
 * @returns Array of payments
 */
export function calculateOptimalPayments(
  summaries: ExpenseSummary[]
): Payment[] {
  // Sort summaries by net amount (from most negative to most positive)
  const sortedSummaries = [...summaries].sort((a, b) => a.netAmount - b.netAmount);
  
  const payments: Payment[] = [];
  let i = 0; // index for people who owe money (negative net amount)
  let j = sortedSummaries.length - 1; // index for people who are owed money (positive net amount)
  
  // Continue until all debts are settled
  while (i < j) {
    const debtor = sortedSummaries[i];
    const creditor = sortedSummaries[j];
    
    // Skip people with zero balance
    if (Math.abs(debtor.netAmount) < 0.01) {
      i++;
      continue;
    }
    
    if (Math.abs(creditor.netAmount) < 0.01) {
      j--;
      continue;
    }
    
    // Calculate the payment amount
    const amount = Math.min(Math.abs(debtor.netAmount), creditor.netAmount);
    
    // Create a payment record
    payments.push({
      from: debtor.participantId,
      to: creditor.participantId,
      amount: parseFloat(amount.toFixed(2)), // Round to 2 decimal places
    });
    
    // Update the net amounts
    debtor.netAmount += amount;
    creditor.netAmount -= amount;
    
    // Move to the next person if their debt is settled
    if (Math.abs(debtor.netAmount) < 0.01) {
      i++;
    }
    
    if (Math.abs(creditor.netAmount) < 0.01) {
      j--;
    }
  }
  
  return payments;
}