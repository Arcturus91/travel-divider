import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AWS_API_GATEWAY_URL } from '@/lib/aws/config';

/**
 * PUT handler for updating an expense
 */
export async function PUT(request: NextRequest, { params }: any) {
  try {
    const { expenseId } = params;
    const expenseData = await request.json();
    
    const response = await axios.put(
      `${AWS_API_GATEWAY_URL}/expenses/${expenseId}`,
      expenseData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting an expense
 */
export async function DELETE(_request: NextRequest, { params }: any) {
  try {
    const { expenseId } = params;
    
    await axios.delete(`${AWS_API_GATEWAY_URL}/expenses/${expenseId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}