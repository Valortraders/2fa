# Valor 2FA

A secure and modern 2FA authenticator application built with Next.js, with a companion Chrome extension.

Last deployment trigger: 2024-03-22 20:20

## Features

- Modern UI with Tailwind CSS and Shadcn components
- Secure TOTP implementation
- Light/Dark mode support
- Responsive design
- Rate limiting and error handling
- Chrome extension for quick access to 2FA codes

## Tech Stack

### Web App
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn UI
- Three.js
- Otplib

### Chrome Extension
- Vanilla JavaScript
- Tailwind CSS
- Chrome Extension APIs

## Project Structure

This repository contains two main components:
- `/auth` - The Next.js web application
- `/extension` - The Chrome extension

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/orgestuka/valor-2fa.git
cd valor-2fa
```

2. Install dependencies:
```bash
npm install
cd auth && npm install
cd ../extension && npm install
```

3. Run both the web app and extension in development mode:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser for the web app.

## Building for Production

To build both the web app and Chrome extension:

```bash
npm run build
```

This will create:
- Production web app build in `auth/.next`
- Chrome extension build with bundled files in `extension/src/dist`

### Installing the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `extension` directory
4. The Valor 2FA extension should now be installed

## Updating Browserslist Database

If you see a warning about an outdated browserslist database, run:

```bash
npm run update-browserslist
```

## Security Features

- Rate limiting to prevent brute force attacks
- Input validation and sanitization
- Secure TOTP implementation
- XSS protection
- CSRF protection

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_RATE_LIMIT_REQUESTS=10  # Requests per window
NEXT_PUBLIC_RATE_LIMIT_WINDOW=60    # Window size in seconds
```

## Open Source

This project is open source to ensure transparency and security in 2FA authentication. Users can audit the code to verify:
- No malicious behavior or backdoors
- Secure TOTP implementation
- Proper handling of sensitive data
- Privacy-focused design

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Three.js](https://threejs.org/)
- [Otplib](https://github.com/yeojz/otplib)

## Support

For support, please open an issue in the GitHub repository.
