import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover', // Korrigert til påkrevd versjon
});

const STRIPE_PRICE_ID = 'price_1SQ6jj2QSLCUZZUvoPuGinRF';

export async function POST(request: Request) {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const { email } = decodedToken;
        const { quantity, accountType, customerId, subscriptionId } = await request.json();

        let stripeCustomerId = customerId;

        if (!stripeCustomerId) {
            const existingCustomers = await stripe.customers.list({ email: email, limit: 1 });
            if (existingCustomers.data.length > 0) {
                stripeCustomerId = existingCustomers.data[0].id;
            } else {
                const newCustomer = await stripe.customers.create({ email, name: email });
                stripeCustomerId = newCustomer.id;
            }
        }

        if (accountType === 'business') {
            if (subscriptionId) {
                 const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
                 const itemId = subscription.items.data[0].id;
                 await stripe.subscriptionItems.update(itemId, { quantity });
                 return NextResponse.json({ success: true, customerId: stripeCustomerId, subscriptionId });
            } else {
                const newSubscription = await stripe.subscriptions.create({
                    customer: stripeCustomerId,
                    items: [{ price: STRIPE_PRICE_ID, quantity }],
                    collection_method: 'send_invoice',
                    days_until_due: 30,
                });
                return NextResponse.json({ success: true, customerId: stripeCustomerId, subscriptionId: newSubscription.id });
            }
        } else {
            if (subscriptionId) {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
                const itemId = subscription.items.data[0].id;
                await stripe.subscriptionItems.update(itemId, { quantity });
                 return NextResponse.json({ success: true, customerId: stripeCustomerId, subscriptionId });
            } else {
                const checkoutSession = await stripe.checkout.sessions.create({
                    customer: stripeCustomerId,
                    payment_method_types: ['card'],
                    line_items: [{ price: STRIPE_PRICE_ID, quantity }],
                    mode: 'subscription',
                    success_url: `${request.headers.get('origin')}/settings?subscription_success=true`,
                    cancel_url: `${request.headers.get('origin')}/settings`,
                });
                return NextResponse.json({ checkoutUrl: checkoutSession.url, customerId: stripeCustomerId });
            }
        }

    } catch (error: any) {
        console.error("Stripe API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
