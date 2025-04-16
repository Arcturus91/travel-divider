import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AWS_API_GATEWAY_URL } from '@/lib/aws/config';

/**
 * GET handler for getting a pre-signed download URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileKey = searchParams.get('fileKey');
    
    if (!fileKey) {
      return NextResponse.json(
        { error: 'fileKey is required' },
        { status: 400 }
      );
    }
    
    const response = await axios.get(
      `${AWS_API_GATEWAY_URL}/download-url?fileKey=${encodeURIComponent(fileKey)}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error getting download URL:', error);
    return NextResponse.json(
      { error: 'Failed to get download URL' },
      { status: 500 }
    );
  }
}
