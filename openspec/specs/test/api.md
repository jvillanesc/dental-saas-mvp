# Test API Specification

## Purpose

REST API endpoints for test management.

**Base Path**: `/api/test`

## Requirements

### Requirement: Test Creation
The system SHALL allow creation of new test records.

#### Scenario: Create test
- GIVEN an authenticated user with valid test data
- WHEN POST /api/test/check-password is requested
- THEN a new test is created for the user's tenant
- AND the created test is returned with generated ID
- AND timestamps are automatically set

#### Scenario: Create test
- GIVEN an authenticated user with valid test data
- WHEN POST /api/test/generate-hash is requested
- THEN a new test is created for the user's tenant
- AND the created test is returned with generated ID
- AND timestamps are automatically set

