# Stripe Webhook Testing Guide

## Oversikt

Stripe webhook API route er implementert på `/api/stripe/webhook` og håndterer følgende events:

- `customer.subscription.updated` - Oppdaterer subscriptionStatus og numberOfSensors
- `customer.subscription.deleted` - Setter subscriptionStatus til 'inactive'
- `invoice.payment_succeeded` - Bekrefter betaling og lagrer i payments-subcollection
- `checkout.session.completed` - Oppdaterer etter vellykket checkout

## Forutsetninger

1. **Stripe CLI installert**: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. **Stripe konto**: Du trenger en Stripe test-konto
3. **Ekte Stripe nøkler i `.env`**:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...  # Genereres av Stripe CLI
   ```

## Testing lokalt med Stripe CLI

### 1. Logg inn på Stripe CLI

```bash
stripe login
```

### 2. Start Next.js dev server

```bash
npm run dev
```

### 3. Start Stripe webhook forwarding

I et nytt terminalvindu:

```bash
stripe listen --forward-to localhost:9002/api/stripe/webhook
```

Dette vil gi deg en webhook signing secret som ser slik ut:
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Oppdater `.env` med denne:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Trigger test events

#### Test subscription.updated

```bash
stripe trigger customer.subscription.updated
```

#### Test subscription.deleted

```bash
stripe trigger customer.subscription.deleted
```

#### Test payment succeeded

```bash
stripe trigger invoice.payment_succeeded
```

#### Test checkout completed

```bash
stripe trigger checkout.session.completed
```

## Testing med ekte data

### 1. Opprett en test-bruker i Firestore

Opprett et dokument i `users` collection med:

```json
{
  "userId": "test-user-123",
  "accountType": "private",
  "email": "test@example.com",
  "stripeCustomerId": "cus_test123",
  "subscriptionStatus": "inactive",
  "numberOfSensors": 0
}
```

### 2. Opprett subscription via Stripe Dashboard

1. Gå til [Stripe Dashboard](https://dashboard.stripe.com/test/subscriptions)
2. Opprett ny subscription for `cus_test123`
3. Bruk price ID: `price_1SQ6jj2QSLCUZZUvoPuGinRF`
4. Sett quantity til ønsket antall sensorer

### 3. Verifiser at webhook fungerer

Sjekk logs i terminalen der `stripe listen` kjører. Du skal se:

```
🔄 Subscription updated: sub_xxx (status: active, quantity: 5)
✅ Updated user test-user-123: status=active, sensors=5
```

Sjekk Firestore - brukerdokumentet skal være oppdatert:

```json
{
  "subscriptionStatus": "active",
  "stripeSubscriptionId": "sub_xxx",
  "numberOfSensors": 5
}
```

## Testing i produksjon

### 1. Konfigurer webhook i Stripe Dashboard

1. Gå til [Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Klikk "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Velg events:
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `checkout.session.completed`
5. Kopier "Signing secret" og legg til i production `.env`

### 2. Test produksjon webhook

Send en test event fra Stripe Dashboard:

1. Gå til din webhook endpoint
2. Klikk "Send test webhook"
3. Velg event type
4. Send event

## Feilsøking

### Webhook signature verification failed

**Problem**: `stripe-signature` header matcher ikke webhook secret

**Løsning**:
- Sjekk at `STRIPE_WEBHOOK_SECRET` i `.env` matcher signing secret fra Stripe CLI eller Dashboard
- Restart dev server etter å ha oppdatert `.env`

### No user found for Stripe customer

**Problem**: Ingen bruker i Firestore har denne `stripeCustomerId`

**Løsning**:
- Sjekk at brukerens `stripeCustomerId` matcher customer ID i Stripe
- Oppdater Firestore dokument med riktig customer ID

### Missing stripe-signature header

**Problem**: Request mangler Stripe signature header

**Løsning**:
- Sørg for at requests kommer fra Stripe CLI eller Stripe servere
- Ikke test webhook direkte med curl/Postman uten riktig signature

## Logging

Webhook route logger alle events til console:

- 📥 `Received webhook: {event.type}`
- 🔄 `Subscription updated: {id} (status: {status}, quantity: {quantity})`
- ❌ `Subscription deleted: {id}`
- 💰 `Payment succeeded: {amount} kr for subscription {id}`
- ✅ `Checkout completed for customer {id}`
- ⚠️ `No user found for Stripe customer: {id}`
- ❌ Error messages for failures

## Neste steg

Etter testing, vurder å legge til:

1. **Email notifikasjoner** ved subscription changes
2. **Audit log** for alle Stripe events i Firestore
3. **Retry logic** for failed webhook processing
4. **Monitoring** med Sentry eller lignende
5. **Rate limiting** på webhook endpoint

## Ressurser

- [Stripe Webhooks Docs](https://stripe.com/docs/webhooks)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
