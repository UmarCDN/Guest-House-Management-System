# Serene Haven Guest House - Antigravity Agent Guidelines

This project is a modern, responsive Guest House Management & Online Booking System built with React, TypeScript, Vite, React Router DOM, Bootstrap 5, and Formik + Yup.

## Architecture
- **Public Portal** (`/`, `/rooms`, `/rooms/:id`, `/booking`, `/gallery`, `/about`, `/contact`): Visitor room search, details, and 4-step booking wizard.
- **Admin Dashboard** (`/admin/*`): Executive dashboard with live KPI metrics, SVG analytics charts, room CRUD, room categories, guest CRM, payment audit log, staff management, facility toggles, review moderation, and printable tax invoices.
- **Customer Portal** (`/customer/*`): Authenticated guest area for tracking active and past bookings, digital receipts, and personal profile settings.

## Conventions
1. **Frontend Only**: No Node.js / Express / Prisma / SQL backend. All data operations pass through decoupled service adapters in `src/services/` using `src/data/` with localStorage persistence.
2. **TypeScript Typing**: Strict TypeScript types defined centrally in `src/types/`. Avoid `any`.
3. **Forms & Validation**: Formik + Yup schemas for form state management and input verification.
4. **Styling**: Bootstrap 5 utility classes paired with custom luxury theme rules in `src/assets/styles/main.css`.
5. **Printable Invoices**: Styled with `@media print` in `main.css` for one-click browser print and PDF generation.
