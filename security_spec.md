# Security Specification

## Data Invariants
- A tour must have a title and a non-negative price.
- An activity must have a name and a non-negative price.

## Dirty Dozen Payloads
- Create tour with negative price.
- Create activity with missing name.
- Non-admin user attempting to delete a tour.
- Non-admin user attempting to update activity price.
... (simplified for now)

## Security Rules Plan
- Read: Allow public read for tours and activities.
- Write: Allow only authenticated admins.
