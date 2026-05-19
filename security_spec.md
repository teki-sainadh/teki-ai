# Security Specification for Teki AI

## Data Invariants
1. A user can only read and write their own profile document at `/users/{userId}`.
2. A user can only access chat sessions that belong to them at `/users/{userId}/sessions/{sessionId}`.
3. Chat sessions must have a title and a messages array.
4. Timestamps (`updatedAt`) must be validated against `request.time`.

## The "Dirty Dozen" (Malicious Payloads)
1. **Identity Spoofing**: User A attempts to read User B's profile.
2. **Identity Spoofing**: User A attempts to write to User B's profile.
3. **Session Theft**: User A attempts to read User B's chat sessions.
4. **Session Hijacking**: User A attempts to create a session in User B's collection.
5. **Session Modification**: User A attempts to update/delete User B's session.
6. **Shadow Field Injection**: Adding a `role: 'admin'` field to a user profile.
7. **Resource Poisoning**: Injecting a 1MB string into the session title.
8. **Orphaned Writes**: Creating a session without a parent user profile exists (if enforced).
9. **Timestamp Spoofing**: Setting a fake `updatedAt` in the past or future.
10. **Schema Bypass**: Posting a session with a string instead of a messages array.
11. **Massive Array Attack**: Sending a session with 100,000 blank messages to bloat document size.
12. **Unverified Email Access**: Attempting writes with an unverified email (if `email_verified` is required).

## Test Runner (Logic Check)
I will implement rules that reject these payloads.
