export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  paidBy: string; // Participant ID
  splitBetween: Split[];
  receiptUrl?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Split {
  participantId: string;
  amount: number;
  percentage?: number;
}

export interface ExpenseSummary {
  participantId: string;
  name: string;
  paid: number;
  owes: number;
  netAmount: number;
}

export interface Payment {
  from: string;
  to: string;
  amount: number;
}