# Security Spec - BioGarden

## Data Invariants
- A collection item must have a valid `userId` that matches the authenticated user.
- A collection item must have a `name` and `image`.

## The Dirty Dozen Payloads
1. Create a plant with someone else's `userId`.
2. Update a plant that belongs to another user.
3. Delete a plant that belongs to another user.
4. List all plants in the database.
5. Create a plant without an image.
6. Create a plant with a massive string in `notes`.
7. Update `userId` to a different value.
8. Injection in document ID.
9. Reading PII of other users (not present here yet).
10. Bypassing size limits on arrays.
11. Spoofing `createdAt` (if used).
12. Terminal state bypassing (if used).

## Test Runner
(Placeholder for firestore.rules.test.ts)
