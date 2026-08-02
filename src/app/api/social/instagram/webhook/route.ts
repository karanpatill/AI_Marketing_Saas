import { NextResponse } from 'next/server';

// Meta uses GET requests to verify the webhook URL
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // This is the Verify Token you will enter in the Meta Dashboard
  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'my_secure_verify_token_123';

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      return new NextResponse(challenge, { status: 200 });
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return new NextResponse('Bad Request', { status: 400 });
}

// Meta uses POST requests to send webhook events
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log the incoming webhook event for debugging
    console.log('Incoming Meta Webhook:', JSON.stringify(body, null, 2));

    // Acknowledge receipt of the webhook to Meta
    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
