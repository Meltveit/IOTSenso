import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * Verify Stripe Checkout Session and update Firestore
 *
 * This is a fallback for when webhooks are not set up (local testing)
 * In production, webhooks should be the primary method
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing sessionId or userId' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed', status: session.payment_status },
        { status: 400 }
      );
    }

    const customerId = session.customer as string;
    const subscription = session.subscription as Stripe.Subscription;

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      );
    }

    const quantity = subscription.items.data[0]?.quantity || 0;

    // Update Firestore
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await userRef.update({
      subscriptionStatus: 'active',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      numberOfSensors: quantity,
    });

    console.log(`✅ Subscription verified for user ${userId}: ${quantity} sensors`);

    return NextResponse.json({
      success: true,
      subscriptionStatus: 'active',
      numberOfSensors: quantity,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('❌ Error verifying session:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
