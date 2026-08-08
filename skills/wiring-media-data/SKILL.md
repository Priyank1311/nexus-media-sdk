---
name: wiring-media-data
description: Rules and patterns for fetching, context configuration, event tracking, and type usage when working with @media-sdk/react in React applications.
---

# Wiring Media Data with `@media-sdk/react`

This document defines the strict requirements and API patterns for connecting React components to the Media SDK data layer using `@media-sdk/react`.

---

## CRITICAL RULE: Package Boundary & Imports

### ❌ WRONG (Never import `@media-sdk/core` in application components)

```tsx
// ❌ DO NOT DO THIS
import { createMediaClient, Photo } from '@media-sdk/core';
import { usePhotoSearch } from '@media-sdk/react';

const client = createMediaClient({ apiKey: '...' }); // DO NOT instantiate core directly in components
```

### ✅ RIGHT (Import exclusively from `@media-sdk/react`)

```tsx
// ✅ DO THIS
import {
  MediaProvider,
  usePhotoSearch,
  useMediaTracking,
  useMediaEvent,
  type Photo,
  type MediaError,
} from '@media-sdk/react';
```

> **Why?** `@media-sdk/react` re-exports all core types (`Photo`, `Video`, `MediaError`, `Result`, etc.). Application components must **never** reach into `@media-sdk/core`.

---

## 1. Provider Setup (`MediaProvider`)

Wrap your application (or relevant subtree) with `<MediaProvider>`. It accepts `apiKey` and an optional `baseUrl`.

```tsx
import { MediaProvider } from '@media-sdk/react';

export function App() {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_PEXELS_API_KEY environment variable is required');
  }

  return (
    <MediaProvider apiKey={apiKey}>
      <MainLayout />
    </MediaProvider>
  );
}
```

* **Note:** `MediaProvider` accepts `apiKey: string` as a prop. Do NOT instantiate or pass a pre-built `MediaClient` instance.

---

## 2. Hook API Reference

All data-fetching hooks return a standardized `AsyncState<T>` shape containing `{ data, loading, error }`.

### A. `usePhotoSearch(params: SearchPhotosParams)`

Paginated photo search hook with `loadMore` pagination control.

```ts
const { data, loading, error, loadMore, hasMore, totalResults } = usePhotoSearch({
  query: 'mountains',
  orientation: 'landscape', // optional: 'landscape' | 'portrait' | 'square'
  per_page: 15,            // optional: 1-80
});
```

* **Returns:**
  - `data: Photo[] | null` — Array of photos (appends on `loadMore`).
  - `loading: boolean` — `true` while fetch is in-flight.
  - `error: MediaError | null` — Structured error object containing `{ kind, message, status? }`.
  - `loadMore: () => void` — Function to fetch the next page.
  - `hasMore: boolean` — `true` if more pages exist.
  - `totalResults: number` — Total count reported by API.

### B. `useVideoSearch(params: SearchVideosParams)`

Paginated video search hook with `loadMore` control.

```ts
const { data, loading, error, loadMore, hasMore, totalResults } = useVideoSearch({
  query: 'ocean',
  min_duration: 5,
  per_page: 10,
});
```

* **Returns:** Same signature as `usePhotoSearch`, with `data: Video[] | null`.

### C. `useMediaItem<T extends 'photo' | 'video'>(type: T, id: number | null)`

Fetch a single photo or video by Pexels ID.

```ts
const { data: photo, loading, error } = useMediaItem('photo', 123456);
const { data: video, loading, error } = useMediaItem('video', 789012);
```

### D. `useMediaTracking()`

Returns stable analytics dispatchers bound to the current context client.

```ts
const { trackView, trackDownload } = useMediaTracking();

// Trigger impression / view event
trackView(photo.id);

// Trigger download event
trackDownload(photo.id);
```

### E. `useMediaEvent(event: 'view' | 'download', handler: (payload) => void)`

Subscribe to global media events independently anywhere in the component tree.

```ts
useMediaEvent('view', (payload) => {
  console.log(`Item ${payload.itemId} viewed at ${payload.timestamp}`);
});

useMediaEvent('download', (payload) => {
  console.log(`Item ${payload.itemId} downloaded`);
});
```

---

## 3. Error Handling Pattern

SDK errors use the `MediaError` discriminated union. Inspect `error.kind` to render granular UI:

```tsx
if (error) {
  switch (error.kind) {
    case 'RATE_LIMIT':
      return <p>Rate limit reached. Please wait a few minutes.</p>;
    case 'NETWORK_ERROR':
      return <p>Network disconnected. Check your internet.</p>;
    case 'API_ERROR':
      return <p>API Error ({error.status}): {error.message}</p>;
    default:
      return <p>Error: {error.message}</p>;
  }
}
```
