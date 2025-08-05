# Game Arena

A modern gaming platform built with Next.js, featuring a comprehensive tech stack for creating an engaging gaming experience.

## Tech Stack

-   **Next.js 15+** - React framework with app router
-   **TypeScript** - Type-safe code
-   **Tailwind CSS** - Utility-first CSS framework
-   **shadcn/ui** - Accessible UI components
-   **Zod** - Schema validation
-   **Axios** - HTTP client

## Features

-   Form validation with Zod
-   UI components from shadcn/ui
-   Type safety with TypeScript
-   Modern styling with Tailwind CSS
-   API requests with Axios (example included)

## Getting Started

### Prerequisites

-   Node.js 18.17 or later

### Installation

1. Clone this repository
2. Navigate to the project directory
    ```bash
    cd game-arena
    ```
3. Install dependencies
    ```bash
    npm install
    ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

-   `/src/app` - Next.js app router pages and layouts
-   `/src/components` - Reusable UI components
    -   `/src/components/ui` - shadcn/ui components
-   `/src/lib` - Utility functions and shared code

## Adding shadcn/ui Components

This project uses shadcn/ui for components. To add a new component:

```bash
npx shadcn@latest add [component-name]
```

Example:

```bash
npx shadcn@latest add input dropdown-menu
```

## Learn More

To learn more about the technologies used in this project:

-   [Next.js Documentation](https://nextjs.org/docs)
-   [TypeScript Documentation](https://www.typescriptlang.org/docs/)
-   [Tailwind CSS Documentation](https://tailwindcss.com/docs)
-   [shadcn/ui Documentation](https://ui.shadcn.com)
-   [Zod Documentation](https://zod.dev)
-   [Axios Documentation](https://axios-http.com/docs/intro)
