# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start the development server at http://localhost:3000
- `pnpm build` - Build the production application
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint to check for code issues

## Project Structure

- `/app` - Next.js App Router directory containing all routes and layouts
  - `/app/(tabs)` - Tab-based layout for bottom navigation (Bookings, Chat, Profile, Rentals)
  - `/app/category/[id]` - Dynamic route for category pages showing shops
  - `/app/chat/[id]` - Dynamic route for chat threads with a specific shop
  - `/app/shop/[id]` - Dynamic route for shop profile pages
    - `/app/shop/[id]/book` - Service booking flow
    - `/app/shop/[id]/rent/[toolId]` - Tool rental flow
  - `/app/(tabs)/bookings` - User's booking history
  - `/app/(tabs)/rentals` - User's rental history
- `/components` - Reusable UI components
  - `/components/ui` - Primitive UI components (Button, Card, Dialog, etc.)
  - Domain-specific components (BookingFlow, RentalFlow, ChatThread, ShopCard, etc.)
- `/lib` - Utility functions and mock data
  - `mock-data.ts` - Contains all mock data (categories, shops, tools, bookings, etc.) and helper functions
  - `format.ts` - Formatting utilities (INR currency)
  - `utils.ts` - Utility functions (cn for class merging)
- `/public` - Static assets (images, icons)
- `/styles` - Global CSS and Tailwind configuration (in app/globals.css and tailwind.config is implicit via dependencies)

## Key Architectural Notes

- **Routing**: Uses Next.js App Router with file-system based routing. Dynamic routes use bracket notation (e.g., `[id]`).
- **Layouts**: 
  - Root layout (`app/layout.tsx`) sets up fonts, metadata, and wraps children in `<PhoneFrame>`.
  - Tab layout (`app/(tabs)/layout.tsx`) provides the bottom navigation (`<BottomNav/>`) and wraps tab content.
- **Styling**: 
  - Tailwind CSS v4 with custom theme defined in `app/globals.css`.
  - Uses CSS variables for light/dark mode and theme colors.
  - `tw-animate-css` for animations and `shadcn/ui` for accessible component primitives.
- **Data**: 
  - Development uses mock data from `lib/mock-data.ts` which simulates APIs.
  - Data fetching is done directly from these mocks in route loaders (no external API calls).
- **Components**: 
  - Follows a pattern of colocation: components used primarily by a feature are often near that feature.
  - Reusable UI primitives are in `/components/ui`.
  - Formatting and utility functions are in `/lib`.
- **TypeScript**: 
  - Strict TypeScript configuration (`tsconfig.json` with `strict: true`).
  - Path alias `@/*` mapped to root for absolute imports (e.g., `@/components/button.tsx`).

## Common Development Tasks

- Adding a new route: Create a folder under `/app` with the route path, add `page.tsx` and optionally `loading.tsx` or `error.tsx`.
- Adding a new component: 
  - For UI primitives (buttons, inputs, etc.), add to `/components/ui`.
  - For feature-specific components, place near the feature (e.g., booking-related components near booking flows).
- Styling: 
  - Use Tailwind utility classes directly.
  - For custom CSS variables, modify `app/globals.css`.
  - Extend Tailwind configuration via `tailwind.config.js` if needed (not present, uses default with CSS variable overrides).
- State Management: 
  - Currently uses React state within components (no global state library).
  - Data is fetched per route from mock data; mutations would update local state or mocks (not persisted).

## Code Conventions

- Component naming: PascalCase (e.g., `ShopCard`, `BookingFlow`).
- File naming: 
  - Route files: `page.tsx`, `layout.tsx`.
  - Components: PascalCase matching component name (e.g., `button.tsx`).
  - Utilities: camelCase (e.g., `format.ts`, `utils.ts`).
- Imports: 
  - Use `@/` alias for absolute imports (e.g., `@/components/button`).
  - Relative imports for files within the same directory.
- Exporting: 
  - Default export for route pages and layouts.
  - Named exports for utilities and helper functions.

## Maintenance

- ESLint configuration is inferred from Next.js and TypeScript defaults; no separate config file visible.
- TypeScript type checking is disabled during builds (`ignoreBuildErrors: true` in next.config.mjs) but enabled in IDE via `tsc`.
- Mock data is the source of truth for development; to simulate API changes, update `lib/mock-data.ts`.