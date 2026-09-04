# Frontend Architecture Guidelines (MVP)

This document outlines the architectural principles, technology stack, and best practices for the React frontend of the legal dispatch platform.

## 1. Baseline Principles

*   **Mobile-First:** The UI is exclusively tailored for mobile viewports. All styling will be implemented using Tailwind CSS with a mobile-first responsive design approach.
*   **API Isolation:** React components will **never** make direct HTTP calls. All communication with the Cloud Run API (`https://legal-backend-772449854489.southamerica-east1.run.app`) is abstracted into a dedicated service layer.
*   **Component Architecture:** Strict separation between Presentation ("Dumb") components (UI rendering, styled with Tailwind) and Container ("Smart") components (state management, data fetching orchestration).
*   **Deployment:** The application will be deployed to Firebase Hosting via a GitHub Actions workflow.

## 2. Technology Stack & Libraries

*   **Build Tool:** Vite (fast, modern, out-of-the-box support for React and environment variables).
*   **Routing:** React Router DOM (industry standard for React SPAs).
*   **Data Fetching & Server State:** TanStack Query (formerly React Query). Handles caching, loading states, error handling, and polling out of the box.
*   **Client State Management:** Zustand. Lightweight and minimal boilerplate for UI state (e.g., multi-step forms, toggles, map state) that doesn't belong in the server state.
*   **Form Management & Validation:** React Hook Form coupled with Zod. Essential for handling complex forms (like document uploads for OCR) and ensuring data matches API expectations before submission.
*   **HTTP Client:** Axios or native `fetch` wrapped in a custom configured instance to inject auth tokens seamlessly.

## 3. Directory Structure

To enforce our architectural principles, the `frontend/src` directory should follow a domain-driven or feature-driven structure:

```text
frontend/src/
├── assets/          # Static assets (images, icons)
├── components/      # Shared "Dumb" components (Buttons, Inputs, Cards - Tailwind only)
├── features/        # Feature-based modules (e.g., dispatch, auth, profile)
│   └── [feature]/
│       ├── api/     # API service layer (Axios/fetch wrappers for this feature)
│       ├── hooks/   # React Query hooks (e.g., useDispatchData())
│       ├── components/ # Smart/Dumb components specific to this feature
│       └── store/   # Zustand slices for local feature state
├── lib/             # Third-party library configurations (Axios instance, React Query client)
├── routes/          # Route definitions and page-level components
├── store/           # Global client state (Zustand)
├── utils/           # Helper functions (e.g., formatting, geohash wrappers)
└── App.jsx
```

## 4. Backend Integration (FastAPI Updates Required)

To support this frontend, the FastAPI backend must be updated to include **CORS (Cross-Origin Resource Sharing)**.

*   The `CORSMiddleware` must be added to the FastAPI app.
*   `allow_origins` must include `http://localhost:5173` (Vite's default dev server) and the production Firebase Hosting URL (e.g., `https://<firebase-project-id>.web.app`).

## 5. Specifics for the Legal Dispatch Use Case

### A. Real-Time Updates
Since this is an emergency dispatch system, state changes (e.g., "Lawyer Accepted") need to be reflected immediately.
*   **Approach:** Because API calls are isolated through Cloud Run, we can use TanStack Query's short-interval polling for specific critical endpoints, or ideally, implement WebSockets/Server-Sent Events (SSE) on the FastAPI backend for push notifications.

### B. Geolocation Handling
The backend relies on strict 3x3 geohash grids.
*   **Approach:** Create a robust, reusable hook (`useGeolocation`) that handles browser permission requests gracefully, provides fallback UI if denied, and standardizes the coordinates payload before passing them to the API service layer.

### C. Document Uploads & OCR
The backend requires Base64 encoded strings for Gemini OCR processing.
*   **Approach:** Abstract the file-to-Base64 conversion in a utility function. Ensure React Hook Form limits file sizes and types (e.g., images/PDFs only) on the client side to save mobile bandwidth and prevent unnecessary backend validation failures.

### D. Authentication Security
The app uses Gov.br JWTs.
*   **Approach:** Store JWTs securely. Since this is an SPA on a separate domain from the API, we will likely need to use `localStorage` or `sessionStorage` and inject the token via Axios interceptors. We must strictly sanitize any user inputs rendered in the UI to prevent XSS attacks which could compromise these stored tokens.
