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
                 const currentQuantity = subscription.items.data[0].quantity || 0;

                 // Determine proration behavior
                 const isUpgrade = quantity > currentQuantity;

                 if (isUpgrade) {
                   // Oppgradering: Oppdater umiddelbart med proration
                   await stripe.subscriptions.update(subscriptionId as string, {
                     items: [{
                       id: itemId,
                       quantity: quantity,
                     }],
                     proration_behavior: 'create_prorations',
                     billing_cycle_anchor: 'unchanged',
                   });
                 } else {
                   // Nedgradering: Endre quantity ved period end (ingen proration)
                   await stripe.subscriptions.update(subscriptionId as string, {
                     items: [{
                       id: itemId,
                       quantity: quantity,
                     }],
                     proration_behavior: 'none',
                   });
                 }

                 return NextResponse.json({
                   success: true,
                   customerId: stripeCustomerId,
                   subscriptionId,
                   message: isUpgrade
                     ? 'Abonnement oppgradert! Mellomlegget vil legges til på neste faktura.'
                     : 'Nedgradering vil tre i kraft ved neste faktureringsperiode'
                 });
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
                const currentQuantity = subscription.items.data[0].quantity || 0;

                // Determine proration behavior
                const isUpgrade = quantity > currentQuantity;

                if (isUpgrade) {
                  // Oppgradering: Oppdater umiddelbart med proration
                  await stripe.subscriptions.update(subscriptionId as string, {
                    items: [{
                      id: itemId,
                      quantity: quantity,
                    }],
                    proration_behavior: 'create_prorations',
                    billing_cycle_anchor: 'unchanged',
                  });
                } else {
                  // Nedgradering: Endre quantity ved period end (ingen proration)
                  await stripe.subscriptions.update(subscriptionId as string, {
                    items: [{
                      id: itemId,
                      quantity: quantity,
                    }],
                    proration_behavior: 'none',
                  });
                }

                return NextResponse.json({
                  success: true,
                  customerId: stripeCustomerId,
                  subscriptionId,
                  message: isUpgrade
                    ? 'Abonnement oppgradert! Du belastes for de ekstra sensorene umiddelbart.'
                    : 'Nedgradering registrert. Du betaler ut denne måneden, og endringen trer i kraft ved neste fakturering.'
                });
            } else {
                const checkoutSession = await stripe.checkout.sessions.create({
                    customer: stripeCustomerId,
                    payment_method_types: ['card'],
                    line_items: [{ price: STRIPE_PRICE_ID, quantity }],
                    mode: 'subscription',
                    success_url: `${request.headers.get('origin')}/settings?subscription_success=true&session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${request.headers.get('origin')}/settings`,
                });
                return NextResponse.json({
                    checkoutUrl: checkoutSession.url,
                    customerId: stripeCustomerId,
                    sessionId: checkoutSession.id
                });
            }
        }

    } catch (error: any) {
        console.error("Stripe API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
