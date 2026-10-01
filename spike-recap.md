# Payload CMS spike recap

What this PoC covered, in one picture.
Stack: Payload 3.90, Next 16.3, SQLite, website template.

## How the pieces fit

```
                    payload.config.ts
                 collections: [..., Cars]
                            │
         ┌──────────────────┼───────────────────┬──────────────────┐
         ▼                  ▼                   ▼                  ▼
   SQLite table         Admin UI            REST API           payload-types.ts
     "cars"             /admin              /api/cars          (TS types)


 WHO CALLS                      THROUGH                           ACCESS CONTROL
 ─────────                      ───────                           ──────────────
 Editor in the admin ─────────▶ /admin ─────────────┐             enforced
                                                    │
 Browser / curl ──────────────▶ /api/cars           │             enforced
 (later: external client apps)  /api/cars/1         ├──▶ find     (403 if denied)
                                ?where[brand]...    │    findByID
                                                    │      │
 Custom endpoint ─────────────▶ /api/cars/by-brand/ │      │      SKIPPED by default
                                :brand              │      │      (Local API)
                                → req.payload.find()┘      │
                                                           │
 Template frontend ───────────▶ payload.find()             │      enforced only with
 (posts/page.tsx)               Local API, no HTTP ────────┘      overrideAccess: false
                                                           │
                                                           ▼
                                                  access → hooks → SQLite
```

## Key takeaways

1. **One config, four outputs.** Adding a collection to `payload.config.ts` gives you a table, an admin screen, an API and TypeScript types.
2. **Same operations everywhere.** The admin panel, REST and the Local API all run the same `find`, `findByID` and other operations.
3. **The Local API skips access control.** `payload.find()` ignores `access` unless you pass `overrideAccess: false`. The `by-brand` endpoint in [Cars.ts](src/collections/Cars.ts) currently relies on this default.
4. **External clients use REST.** External client apps run outside Payload, so they can only use `/api/...`.

## What was built

- **`Cars` collection** ([src/collections/Cars.ts](src/collections/Cars.ts)): name, brand, year, model, and a generated slug.
- **REST queries:** `GET /api/cars`, `GET /api/cars/:id`, and filtering with `?where[brand][equals]=renault`.
- **Custom endpoint:** `GET /api/cars/by-brand/:brand`.

## Gotchas hit

- **`findByID` ignores `where`.** `/api/cars/1?where[...]` returns car 1 whatever the filter says.
- **`equals` is case-sensitive.** `Renault` does not match `renault`.
- **A denied `read` returns 403, not an empty list.**
