# Threshold Migrering

## Endring i threshold-struktur

Vi har endret threshold-strukturen for å støtte både øvre og nedre grenser for både warning og critical nivåer.

### Gammel struktur:
```typescript
thresholds: {
  upper?: number;
  lower?: number;
  warning: number;
  critical: number;
}
```

### Ny struktur:
```typescript
thresholds: {
  warning: {
    lower?: number;  // Varsel hvis under
    upper?: number;  // Varsel hvis over
  };
  critical: {
    lower?: number;  // Kritisk hvis under
    upper?: number;  // Kritisk hvis over
  };
  secondary?: {
    warning?: {
      lower?: number;
      upper?: number;
    };
    critical?: {
      lower?: number;
      upper?: number;
    };
  };
}
```

## Eksempel-bruk

### For temperatursensor (12-22°C er OK):
```typescript
thresholds: {
  warning: {
    lower: 12,  // Varsel hvis under 12°C
    upper: 25   // Varsel hvis over 25°C
  },
  critical: {
    lower: 5,   // Kritisk hvis under 5°C
    upper: 30   // Kritisk hvis over 30°C
  }
}
```

### For fuktighetssensor (kun øvre grense):
```typescript
thresholds: {
  warning: {
    upper: 70   // Varsel hvis over 70%
  },
  critical: {
    upper: 85   // Kritisk hvis over 85%
  }
}
```

## Automatisk migrering

Nye sensorer vil automatisk få den nye strukturen når de opprettes via UI.

Eksisterende sensorer vil fortsette å fungere, men må oppdateres manuelt i Firestore eller via sensor-innstillingssiden.

## Fordeler

- **Fleksibilitet**: Kan sette både øvre og nedre grenser
- **Presisjon**: Ikke lenger false positives ved lave temperaturer
- **Kontroll**: Brukeren bestemmer selv hvilke grenser som er relevante
