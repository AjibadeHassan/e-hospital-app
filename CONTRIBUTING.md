# Contributing to E-Hospital

Thank you for your interest in contributing to the E-Hospital project! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the project

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Write or update tests
5. Commit with clear messages: `git commit -m 'Add feature: description'`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Development Setup

Refer to the README.md for local development setup instructions.

## Code Style

### Python (Backend)
- Follow PEP 8
- Use 4 spaces for indentation
- Use type hints where possible
- Max line length: 100 characters

### JavaScript/TypeScript (Frontend)
- Follow ESLint configuration
- Use 2 spaces for indentation
- Use TypeScript for type safety
- Use meaningful variable/function names

## Commit Messages

Use clear and descriptive commit messages:

```
[Type] Brief description

Detailed explanation of changes (optional)

- Point 1
- Point 2
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Keep PR focused on one issue
5. Provide clear description of changes
6. Request review from maintainers

## Reporting Issues

When reporting issues:

1. Use a clear and descriptive title
2. Describe the exact steps to reproduce
3. Provide specific examples
4. Describe the observed behavior
5. Describe the expected behavior
6. Include screenshots/logs if applicable
7. Specify your environment (OS, Python version, Node version, etc.)

## Feature Requests

Feature requests are welcome! Please:

1. Use a clear and descriptive title
2. Provide detailed description
3. List some examples/use cases
4. Explain why this would be useful

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

Thank you for contributing!
