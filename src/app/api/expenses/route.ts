import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AWS_API_GATEWAY_URL } from '@/lib/aws/config';

/**
 * GET handler for fetching all expenses
 */
export async function GET() {
  try {
    const response = await axios.get(`${AWS_API_GATEWAY_URL}/expenses`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new expense
 */
export async function POST(request: NextRequest) {
  try {
    const expenseData = await request.json();
    
    const response = await axios.post(`${AWS_API_GATEWAY_URL}/expenses`, expenseData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
