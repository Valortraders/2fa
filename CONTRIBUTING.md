# Contributing to Valor 2FA

Thank you for your interest in contributing to Valor 2FA! We welcome contributions from the community and are excited to work with you.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/valor-2fa.git
   cd valor-2fa
   ```
3. **Install dependencies**:
   ```bash
   npm install
   cd auth && npm install
   cd ../extension && npm install
   ```
4. **Start development**:
   ```bash
   npm run dev
   ```

## 📋 Development Setup

### Prerequisites

- Node.js 20.17.0+ or 22.9.0+ (use `nvm use` if you have the `.nvmrc` file)
- npm 9.0.0+
- Git

### Project Structure

```
2FA/
├── auth/                    # Next.js web application
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── lib/               # Utility libraries
│   └── public/            # Static assets
├── extension/             # Chrome extension
│   ├── src/              # Extension source code
│   └── manifest.json     # Extension manifest
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

### Development Commands

- `npm run dev` - Start both web app and extension
- `npm run build` - Build both for production
- `npm run dev:auth` - Start only the web app
- `npm run dev:extension` - Start only the extension watcher

## 🎯 How to Contribute

### 🐛 Bug Reports

Found a bug? Please create an issue with:

- **Clear title** describing the problem
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (browser, OS, version)
- **Screenshots** if applicable

### ✨ Feature Requests

Have an idea? We'd love to hear it! Please include:

- **Clear description** of the feature
- **Use case** - why would this be useful?
- **Proposed implementation** (if you have ideas)
- **Alternatives considered**

### 🔧 Code Contributions

#### Before You Start

1. **Check existing issues** to avoid duplicate work
2. **Create an issue** for major changes to discuss first
3. **Fork and branch** from `main` for your changes

#### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards:
   - Use TypeScript for new code
   - Follow existing code style and patterns
   - Add comments for complex logic
   - Ensure responsive design

3. **Test your changes**:
   - Test both web app and extension
   - Verify in different browsers
   - Check mobile responsiveness
   - Run `npm run lint` in the auth directory

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

#### Commit Message Format

We follow conventional commits:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting, missing semicolons, etc.
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

#### Submitting Your Pull Request

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes
   - Test instructions

## 🎨 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for new code
- Prefer functional components and hooks
- Use proper type annotations
- Handle errors gracefully
- Validate user inputs

### CSS/Styling

- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Test in both light and dark modes

### Security

- Never commit sensitive data
- Validate all inputs
- Use secure coding practices
- Follow the principle of least privilege

## 🧪 Testing

### Manual Testing

- Test both web app and Chrome extension
- Verify TOTP code generation accuracy
- Test error handling and edge cases
- Check accessibility features
- Verify responsive design

### Browser Testing

Please test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📚 Documentation

When contributing:

- Update README if needed
- Add JSDoc comments for functions
- Update CHANGELOG for significant changes
- Include inline comments for complex logic

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

### Getting Help

- **GitHub Discussions**: For general questions
- **Issues**: For bugs and feature requests
- **Discord**: Join our community server (link in README)

## 🏆 Recognition

Contributors will be:

- Listed in our README contributors section
- Mentioned in release notes for significant contributions
- Invited to our contributors Discord channel

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🚀 Areas We Need Help

We're particularly looking for contributions in:

- **Accessibility improvements**
- **Browser compatibility testing**
- **Documentation and tutorials**
- **Translation/internationalization**
- **Performance optimizations**
- **Security auditing**

## 📞 Questions?

Don't hesitate to ask! You can:

- Open a GitHub Discussion
- Comment on existing issues
- Reach out to maintainers

---

Thank you for contributing to Valor 2FA! Together, we're making 2FA more accessible and secure for everyone. 🔐✨ 