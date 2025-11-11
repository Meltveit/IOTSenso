import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe Webhook Handler
 *
 * Håndterer følgende events:
 * - customer.subscription.updated: Oppdaterer subscriptionStatus og numberOfSensors
 * - customer.subscription.deleted: Setter subscriptionStatus til 'inactive'
 * - invoice.payment_succeeded: Bekrefter betaling
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      console.error('❌ Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;

    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        // For development without webhook secret
        console.warn('⚠️ No webhook secret - parsing event without verification (DEVELOPMENT ONLY)');
        event = JSON.parse(body) as Stripe.Event;
      }
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log(`📥 Received webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle subscription.updated event
 * Updates user's subscriptionStatus and numberOfSensors based on subscription quantity
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const quantity = subscription.items.data[0]?.quantity || 0;

  console.log(`🔄 Subscription updated: ${subscriptionId} (status: ${status}, quantity: ${quantity})`);

  try {
    // Find user by Stripe customer ID
    const usersSnapshot = await db
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.warn(`⚠️ No user found for Stripe customer: ${customerId}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const updateData: any = {
      subscriptionStatus: status === 'active' ? 'active' : 'inactive',
      stripeSubscriptionId: subscriptionId,
      numberOfSensors: quantity,
    };

    await userDoc.ref.update(updateData);

    console.log(`✅ Updated user ${userDoc.id}: status=${updateData.subscriptionStatus}, sensors=${quantity}`);
  } catch (error) {
    console.error('❌ Error updating subscription:', error);
    throw error;
  }
}

/**
 * Handle subscription.deleted event
 * Sets user's subscriptionStatus to 'inactive'
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;

  console.log(`❌ Subscription deleted: ${subscriptionId}`);

  try {
    // Find user by Stripe customer ID
    const usersSnapshot = await db
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.warn(`⚠️ No user found for Stripe customer: ${customerId}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];

    await userDoc.ref.update({
      subscriptionStatus: 'inactive',
      stripeSubscriptionId: null,
    });

    console.log(`✅ Deactivated subscription for user ${userDoc.id}`);
  } catch (error) {
    console.error('❌ Error deleting subscription:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_succeeded event
 * Confirms payment and updates subscription status if needed
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;
  const amountPaid = invoice.amount_paid / 100; // Convert from cents

  console.log(`💰 Payment succeeded: ${amountPaid} kr for subscription ${subscriptionId}`);

  try {
    // Find user by Stripe customer ID
    const usersSnapshot = await db
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.warn(`⚠️ No user found for Stripe customer: ${customerId}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];

    // Ensure subscription is active after successful payment
    await userDoc.ref.update({
      subscriptionStatus: 'active',
      stripeSubscriptionId: subscriptionId,
    });

    // Optional: Store payment history in subcollection
    await userDoc.ref.collection('payments').add({
      invoiceId: invoice.id,
      amount: amountPaid,
      currency: invoice.currency,
      status: 'succeeded',
      paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
    });

    console.log(`✅ Payment recorded for user ${userDoc.id}: ${amountPaid} ${invoice.currency}`);
  } catch (error) {
    console.error('❌ Error handling payment:', error);
    throw error;
  }
}

/**
 * Handle checkout.session.completed event
 * Updates user after successful checkout (for card payments)
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  console.log(`✅ Checkout completed for customer ${customerId}`);

  try {
    // Find user by Stripe customer ID
    const usersSnapshot = await db
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.warn(`⚠️ No user found for Stripe customer: ${customerId}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];

    // Fetch the subscription to get the quantity
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const quantity = subscription.items.data[0]?.quantity || 0;

    await userDoc.ref.update({
      subscriptionStatus: 'active',
      stripeSubscriptionId: subscriptionId,
      numberOfSensors: quantity,
    });

    console.log(`✅ Checkout completed for user ${userDoc.id}: ${quantity} sensors`);
  } catch (error) {
    console.error('❌ Error handling checkout:', error);
    throw error;
  }
}
