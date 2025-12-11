# Contributing to Infinity Soul AIS

Thank you for your interest in contributing to Infinity Soul AIS! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

- Be respectful and constructive in all interactions
- Focus on what's best for the project and community
- Welcome newcomers and help them learn

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/InfinitySoul.git`
3. Add upstream remote: `git remote add upstream https://github.com/aaj441/InfinitySoul.git`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git

### Installation

```bash
cd InfinitySoul-AIS
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### Running the Development Server

```bash
# From InfinitySoul-AIS directory
npm run dev
```

This starts:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:3001`

## Coding Standards

### JavaScript/Node.js

- Use clear, descriptive variable names
- Add JSDoc comments for all exported functions
- Keep functions small and focused (single responsibility)
- Use async/await instead of callbacks
- Handle errors explicitly
- Remove all console.log statements before committing

### TypeScript/React

- Use TypeScript for all React components
- Define explicit types for props and state
- Use functional components with hooks
- Add proper ARIA labels for accessibility
- Use semantic HTML elements
- Follow React naming conventions (PascalCase for components)

### Code Style

- 2 spaces for indentation
- Semicolons required
- Single quotes for strings (except JSX which uses double quotes)
- Trailing commas in multi-line arrays/objects
- Max line length: 100 characters

### Comments

- Use present tense: "Calculates score" not "Calculate score"
- Document WHY not WHAT (code should be self-documenting for WHAT)
- Mark temporary code with TODO comments and create GitHub issues
- Add MOCK IMPLEMENTATION warnings for placeholder code

Example:
```javascript
/**
 * Calculates the overall insurance readiness score based on weighted factors.
 * 
 * @param {Object} data - Audit data from all modules
 * @param {Object} data.aiData - AI system analysis results
 * @param {Object} data.security - Security assessment results
 * @returns {Promise<Object>} Insurance readiness score with breakdown
 */
async function calculateInsuranceScore(data) {
  // Implementation
}
```

## Submitting Changes

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Added tests for new functionality
- [ ] Updated documentation
- [ ] No console.log or debug statements
- [ ] All TODOs converted to GitHub issues
- [ ] Commit messages are clear and descriptive

### Pull Request Process

1. Update your branch with latest upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Create Pull Request with:
   - Clear title describing the change
   - Description of what changed and why
   - Link to related issues
   - Screenshots for UI changes

4. Address review feedback promptly

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat: Add loading spinner to audit button

Adds a spinner animation when audit is running to provide
better user feedback. The button is disabled during loading
to prevent duplicate submissions.

Closes #123
```

## Testing Guidelines

### Unit Tests

- Test individual functions in isolation
- Mock external dependencies
- Use descriptive test names
- Aim for >80% code coverage

### Integration Tests

- Test complete workflows
- Use realistic test data
- Test error scenarios
- Verify API contracts

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.js

# Run with coverage
npm test -- --coverage
```

## Environment Variables

All environment variables must be:
- Documented in `.env.example`
- Documented in README.md
- Never committed in `.env` files
- Have sensible defaults for development

## Accessibility

All UI changes must:
- Use semantic HTML
- Include ARIA labels where appropriate
- Be keyboard navigable
- Have sufficient color contrast
- Work with screen readers

## Questions?

- Open an issue for bugs or feature requests
- Join our Discord for real-time discussion
- Review existing documentation in the `docs/` folder

Thank you for contributing to Infinity Soul AIS!
