# Documentation Ecosystem Portfolio

A single-page React application built with Vite and TypeScript.

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The application will open at http://localhost:5173

### Build

```bash
npm run build
```

Production-ready files will be generated in the `dist` directory.

### Preview

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx          # Main app component
│   ├── App.css          # App styles
│   ├── index.css        # Global styles
│   └── main.tsx         # React entry point
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md            # This file
```

## Features

- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe development
- **Single-page application** - No routing or backend dependencies

## Next Steps

This is a bare-bones SPA scaffold. You can now:

- Add new components in `src/`
- Extend styling with additional CSS files
- Build out the portfolio showcase content
