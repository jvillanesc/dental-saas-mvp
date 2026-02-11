## Description

<!-- Provide a brief description of the changes in this PR -->

## Related Specification

<!-- Link to OpenSpec specification if applicable -->
- Specification: `openspec/specs/[domain]/[file].md`
- Change Request: `openspec/changes/[change-folder]/`

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration change
- [ ] ♻️ Refactoring (no functional changes)

## Changes Made

<!-- List the specific changes made in this PR -->

- 
- 
- 

## Testing

<!-- Describe the testing you've done -->

- [ ] Backend tests pass (`./gradlew test`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Tested manually in browser
- [ ] Tested multi-tenant isolation
- [ ] Tested with both ADMIN and USER roles

### Test Cases

<!-- Describe specific test scenarios -->

1. 
2. 
3. 

## Multi-Tenancy Checklist

<!-- For database/service changes -->

- [ ] All queries filter by `tenantId`
- [ ] New tables include `tenant_id` column
- [ ] Verified tenant isolation in testing
- [ ] No cross-tenant data leakage possible

## Security Checklist

<!-- For security-related changes -->

- [ ] No sensitive data in logs
- [ ] Passwords properly hashed with BCrypt
- [ ] Input validation implemented
- [ ] SQL injection prevention verified (using R2DBC)
- [ ] XSS prevention considered

## Screenshots

<!-- If applicable, add screenshots showing the changes -->

## Deployment Notes

<!-- Any special instructions for deployment? -->

- [ ] Database migration required
- [ ] Environment variables changed
- [ ] New dependencies added
- [ ] Configuration updates needed

## Checklist

- [ ] Code follows project conventions (`openspec/config.yaml`)
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.log or debug statements
- [ ] Commits follow conventional commit format

## Additional Context

<!-- Add any other context about the PR here -->
