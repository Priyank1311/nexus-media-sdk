# @media-sdk/core — Design Notes

This document explains the key architectural decisions in the core SDK.
It is intended both as internal developer documentation and as a reference
during code review.

---

## Module Layout

```
src/
  index.ts    — Public barrel export (controls the API surface)
  types.ts    — All public type definitions
  client.ts   — createMediaClient factory + API methods
  emitter.ts  — Framework-agnostic event emitter
  cache.ts    — In-memory cache with request de-duplication
  errors.ts   — Typed error factory functions
```

Each module has a single responsibility. The barrel (`index.ts`) is the
only file consumers should import from — internal helpers like `buildUrl`
and `buildCacheKey` are not re-exported.

---

## Event Emitter

### Why a custom emitter instead of Node's `EventEmitter`?

1. **Zero dependencies.** Node's `EventEmitter` isn't available in the
   browser or React Native without a polyfill. A hand-rolled emitter
   keeps the package portable.

2. **Type safety.** The emitter is generic over a `MediaEventMap` so
   subscribers get compile-time checks on both the event name and the
   payload shape. Node's `EventEmitter` is untyped by default.

3. **Unsubscribe-by-return.** `subscribe(event, handler)` returns a
   zero-arg unsubscribe function. This maps cleanly to React's
   `useEffect` cleanup pattern and avoids the common memory-leak bug
   where consumers forget to keep a reference to the original handler
   for `off()`.

### Default listener

A default console-logging listener is registered at emitter creation
time via the normal `subscribe` path — not a special internal hook.
This means:

- It sits alongside consumer listeners, not above them.
- Consumer subscriptions never interfere with it.
- The returned `unsubscribeDefault()` can silence it if needed.

### Error isolation

Each subscriber callback is wrapped in a `try/catch`. A misbehaving
subscriber cannot break other subscribers or the SDK itself. Errors are
logged to `console.error` with context about which event triggered the
failure.

---

## Caching & De-duplication

### Cache key generation

We build a deterministic string key from the API endpoint path and the
query parameters. Parameters are sorted alphabetically before
serialisation, so `{ page: 1, query: 'cat' }` and
`{ query: 'cat', page: 1 }` always produce the same key.

### In-flight de-duplication

If a request with the same cache key is already in-flight (the Promise
hasn't settled yet), we return the **existing Promise** instead of
starting a new fetch. This prevents wasted bandwidth when:

- React strict mode double-fires effects
- Multiple components mount simultaneously and request the same data
- A user rapid-fires the same search

Once the Promise settles, it is removed from the in-flight map so that
future requests for the same key start fresh (the resolved value is
stored separately in the cache).

### TTL (Time-to-live)

Cached results expire after 5 minutes by default. Eviction is **lazy**:
we check the entry's age on read rather than running a background timer.

**Tradeoff:** Lazy eviction means stale entries sit in memory until the
next read for that key. We accepted this because:

- The expected cache size is small (dozens to low hundreds of entries).
- A background timer adds complexity and makes the module harder to use
  in short-lived environments (CLI scripts, test suites).
- Deterministic eviction is easier to reason about and test.

### What gets cached

Only **successful** responses (`result.ok === true`) are cached. Errors
(network failures, rate-limit responses, malformed JSON) are never
cached because they are usually transient.

---

## Result / Error Pattern

### Why `Result<T>` instead of throwing?

All SDK methods return `Result<T>`:

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: MediaError }
```

1. **Thrown errors are invisible to the type system.** Callers can
   forget to `catch`, and TypeScript won't warn them. A Result union
   makes error handling explicit at every call site.

2. **Exhaustive checking.** The `MediaErrorKind` discriminant lets
   consumers write a `switch` on `error.kind` and get a compile-time
   error if they miss a case (with `never` in the default branch).

3. **Serialisable.** Results are plain objects, safe to send across
   worker boundaries, stream via SSR, or persist to storage. Thrown
   Error instances often lose their prototype chain during serialisation.

### Error taxonomy

| Kind             | When                                          |
|------------------|-----------------------------------------------|
| `NETWORK_ERROR`  | `fetch` itself threw (DNS, offline, timeout)  |
| `RATE_LIMIT`     | HTTP 429 — Pexels free-tier limit hit         |
| `API_ERROR`      | Any other non-2xx HTTP response               |
| `PARSE_ERROR`    | Response body is not valid JSON               |
| `UNKNOWN_ERROR`  | Catch-all for genuinely unexpected failures   |

`RATE_LIMIT` is a first-class kind because Pexels' free tier has a
200-request/hour ceiling. Consumers almost always need to handle this
distinctly (show a "try again later" banner, queue with backoff, etc.).

---

## API Key Security

`createMediaClient({ apiKey })` captures the key in a **closure**. The
returned `MediaClient` object has no `apiKey` property — the key cannot
be extracted by:

- `JSON.stringify(client)`
- `Object.keys(client)`
- Browser devtools property inspection
- Accidental logging of the client object

The key is only used inside the private `request()` function to set the
`Authorization` header.
