import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AWS_API_GATEWAY_URL } from '@/lib/aws/config';

/**
 * GET handler for getting a pre-signed upload URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentType = searchParams.get('contentType');
    const fileName = searchParams.get('fileName');
    
    if (!contentType || !fileName) {
      return NextResponse.json(
        { error: 'contentType and fileName are required' },
        { status: 400 }
      );
    }
    
    const response = await axios.get(
      `${AWS_API_GATEWAY_URL}/upload-url?contentType=${encodeURIComponent(contentType)}&fileName=${encodeURIComponent(fileName)}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error getting upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to get upload URL' },
      { status: 500 }
    );
  }
}
