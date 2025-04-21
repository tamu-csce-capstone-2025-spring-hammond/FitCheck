import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/facebook/price/${encodeURIComponent(name)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching price:', error);
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
  }
} 