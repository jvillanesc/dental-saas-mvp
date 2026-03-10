# Delta Specification: Staff API

## MODIFIED Requirements

### Requirement: Staff Retrieval
The system SHALL provide endpoints to retrieve staff data with filtering capabilities.

#### Scenario: List active staff (NEW)
- GIVEN an authenticated user
- WHEN GET /api/staff?active=true is requested
- THEN only active staff (active=true AND deletedAt IS NULL) are returned
- AND staff belong to the user's tenant
- AND results are ordered by lastName, firstName

#### Scenario: Filter by specialty (FUTURE)
- GIVEN an authenticated user
- WHEN GET /api/staff?specialty=ODONTÓLOGO is requested
- THEN only staff with that specialty are returned
- AND staff belong to the user's tenant

---

## Implementation Notes

The Staff API should support filtering by `active` status to enable the dentist selector to fetch only currently working dentists.

**Query Parameters (optional):**
- `active` (boolean) - Filter by active status
- `specialty` (String) - Filter by specialty (future enhancement)

This change maintains backward compatibility. Existing clients calling GET /api/staff without parameters will continue to receive all staff for their tenant.
