# Auth API Specification

## Purpose

REST API endpoints for auth management.

**Base Path**: `/api/auth`

## Requirements

### Requirement: Auth Creation
The system SHALL allow creation of new auth records.

#### Scenario: Create auth
- GIVEN an authenticated user with valid auth data
- WHEN POST /api/auth/login is requested
- THEN a new auth is created for the user's tenant
- AND the created auth is returned with generated ID
- AND timestamps are automatically set

