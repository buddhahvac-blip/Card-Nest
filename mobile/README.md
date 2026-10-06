# NestRune Mobile

NestRune Mobile is the iOS and Android client for the same NestRune platform served at https://nestrune.vercel.app.

## Architecture

- **Web:** existing Next.js/Vercel application remains the production web client and API host.
- **Mobile:** Expo / React Native app in this folder.
- **Data:** mobile calls the same server APIs and will use the same Neon-backed identity, My Nest inventory, pack entitlements, battle state, Rune Dungeon progress, and analytics.
- **Authority:** ownership, rewards, purchases, and progression remain server-authoritative. The phone never becomes the source of truth.
- **Commerce:** mobile paid digital goods stay disabled until StoreKit / Google Play purchase verification is implemented and approved.

## Initial milestone

The first shell contains Home, Season One, My Nest, Nest Battles, and Rune Dungeon navigation and reads the production catalog.

## Next milestones

1. Native mobile authentication/session bridge.
2. My Nest collection and entitlement sync.
3. Native card gallery / inspection.
4. Free beta pack opening.
5. Rune Dungeon progress and reward claims.
6. Nest Battles mobile interaction layer.
7. Haptics, sound, push notifications, offline-safe retry handling.
8. TestFlight and Google Play closed testing.
9. StoreKit / Google Play billing only after beta validation.

## Local development

From this directory:

```
npm install
npx expo start
```

Use development builds for production-oriented testing rather than treating Expo Go as the final app runtime.
