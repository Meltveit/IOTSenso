import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idToken = authorization.split("Bearer ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Hent brukerdata fra Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.stripeCustomerId) {
      return NextResponse.json({ error: 'Ingen Stripe kunde-ID funnet' }, { status: 400 });
    }

    // Opprett Stripe Billing Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${request.headers.get('origin')}/settings?tab=abonnement`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating portal session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
