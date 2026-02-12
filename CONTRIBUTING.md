# Contributing to Mundial 2026 Prode

Thank you for your interest in contributing to this World Cup prediction app! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature/fix
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## Development Setup

Follow the [QUICKSTART.md](QUICKSTART.md) guide to set up your development environment.

## Code Style

- This project uses TypeScript for type safety
- ESLint is configured - run `npm run lint` before committing
- Follow the existing code structure and naming conventions
- Use functional components with React hooks
- Keep components focused and reusable

## Project Structure

```
├── app/              # Next.js app router pages
├── components/       # Reusable React components
├── lib/              # Utility functions and Supabase clients
├── types/            # TypeScript type definitions
└── supabase/         # Database schema and migrations
```

## Making Changes

### Adding New Features

1. Check if an issue exists for your feature
2. If not, create one to discuss the feature first
3. Implement the feature in a new branch
4. Add appropriate tests if applicable
5. Update documentation as needed

### Fixing Bugs

1. Check if an issue exists for the bug
2. Create one if it doesn't exist
3. Fix the bug in a new branch
4. Add tests to prevent regression
5. Submit a PR referencing the issue

## Database Changes

If you need to modify the database schema:

1. Update `supabase/schema.sql`
2. Document the changes in your PR
3. Consider backward compatibility
4. Test migrations thoroughly

## Pull Request Process

1. Update the README.md or QUICKSTART.md if needed
2. Ensure your code builds successfully (`npm run build`)
3. Run the linter (`npm run lint`)
4. Write a clear PR description explaining:
   - What changes you made
   - Why you made them
   - How to test them
5. Link any related issues

## Commit Messages

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Keep the first line under 72 characters
- Add details in the commit body if needed

Examples:
```
Add user profile settings page
Fix prediction submission validation
Update leaderboard sorting algorithm
```

## Testing

Currently, this project doesn't have automated tests, but you should:

1. Test all your changes manually
2. Check both light and dark modes
3. Test on mobile and desktop
4. Verify authentication flows
5. Test database operations

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion on GitHub
- Reach out to the maintainers

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the project

Thank you for contributing! 🙏
