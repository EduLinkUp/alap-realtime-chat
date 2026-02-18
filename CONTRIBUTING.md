# Contributing to Alap Chat

First off, thank you for considering contributing to Alap! It's people like you that make Alap such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows the existing style
5. Write a clear commit message
6. Create a pull request with a comprehensive description

## Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/alap-realtime-chat.git
cd alap-realtime-chat

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Create .env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm start
```

## Coding Standards

### JavaScript/React

- Use ES6+ syntax
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Write comments for complex logic
- Keep functions small and focused

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when relevant

Examples:
```
Add user authentication feature
Fix message delivery bug in Socket.io handler
Update README with installation instructions
Refactor message controller for better error handling
```

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## Project Structure

```
backend/
  ├── config/          # Configuration files
  ├── controllers/     # Route controllers
  ├── middleware/      # Express middleware
  ├── models/          # MongoDB models
  ├── routes/          # API routes
  ├── socket/          # Socket.io handlers
  └── utils/           # Utility functions

frontend/
  ├── src/
  │   ├── components/  # Reusable components
  │   ├── context/     # React context
  │   ├── pages/       # Page components
  │   └── services/    # API and Socket services
```

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉
