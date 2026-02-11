# Dentist API Specification

## Purpose

REST API endpoints for dentist management.

**Base Path**: `/api/dentists`

## Requirements

### Requirement: Dentist Retrieval
The system SHALL provide endpoints to retrieve dentist data.

#### Scenario: List all dentist
- GIVEN an authenticated user
- WHEN GET /api/dentists/ is requested
- THEN all dentist for the user's tenant are returned
- AND each item includes complete details

