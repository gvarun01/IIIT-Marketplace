# IIIT-Marketplace

![Tech Stack](https://img.shields.io/badge/Tech-MERN%20+%20TypeScript%20+%20Tailwind%20CSS-blueviolet)
![Status](https://img.shields.io/badge/Status-Active%20Development-green)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

IIIT-Marketplace is a dedicated e-commerce platform designed exclusively for the IIIT community. It provides a secure and user-friendly environment for students and members to buy, sell, and trade goods and services. This project aims to streamline C2C commerce within the IIIT network, offering a feature-rich alternative to informal marketplace activities on messaging platforms.

## Features

### Core E-commerce Functionality
*   **Product Listings**: Users can list items for sale with detailed descriptions, prices, categories, and multiple images.
*   **Product Browsing**:
    *   Advanced search functionality for finding items by name.
    *   Filtering by multiple categories.
    *   Sorting options (price, rating, newest).
    *   Pagination for easy navigation.
*   **Shopping Cart**: Standard cart functionality to add, remove, and update quantities of items.
*   **Order Management**:
    *   Secure order placement process.
    *   OTP (One-Time Password) verification system for confirming deliveries between buyer and seller.
    *   Order history tracking for both buyers and sellers.
    *   Order status updates (e.g., Pending, Completed).
*   **Product Reviews**: Users can review items they've purchased.

### User & Authentication
*   **User Registration**: Secure registration process with input validation.
*   **Authentication Options**:
    *   Standard email/password login with reCAPTCHA verification.
    *   **IIIT CAS Login**: Seamless integration with IIIT's Central Authentication Service (`login.iiit.ac.in`) for users with `iiit.ac.in` email addresses.
*   **Authorization**: JWT (JSON Web Tokens) for secure session management and protected routes.
*   **User Profiles**:
    *   View and update personal profiles (name, contact, age).
    *   Avatar uploads (via Cloudinary).
    *   Password change functionality.
*   **Seller Profiles**: Publicly viewable seller pages displaying their listed items and aggregated review statistics.

### Additional Features
*   **Image Handling**: Uses Cloudinary for efficient cloud-based image storage and delivery.
*   **Real-time Support Chat**: Integrated chat functionality (potentially RAG-powered) for user support.
*   **Responsive Design**: User interface designed to work across various devices.

## Tech Stack

### Backend
*   **Framework**: Node.js with Express.js
*   **Database**: MongoDB (with Mongoose ODM)
*   **Authentication**: JWT, bcrypt (for password hashing)
*   **File Storage**: Cloudinary (for image uploads)
*   **API**: RESTful API design
*   **Other**: `dotenv` for environment management, `cors`, `cookie-parser`, `multer`.

### Frontend
*   **Framework/Library**: React (with TypeScript)
*   **Build Tool**: Vite
*   **UI Components**: Shadcn/ui (built on Radix UI and Tailwind CSS)
*   **Styling**: Tailwind CSS
*   **Routing**: React Router
*   **State Management**:
    *   TanStack Query (React Query) for server state management and caching.
    *   React Context/Hooks for local UI state.
*   **Forms**: React Hook Form with Zod for validation.
*   **HTTP Client**: Axios
*   **Other**: `js-cookie`, `jwt-decode`, `lucide-react` (icons), `sonner` (notifications), `recharts` (charts).

### Development
*   **Package Managers**: npm (Node.js), Bun (Frontend, indicated by `bun.lockb`)
*   **Linting/Formatting**: ESLint, Prettier

## Prerequisites

*   Node.js (v18.x or higher recommended)
*   npm (comes with Node.js)
*   Bun (Optional, but recommended for Frontend: `npm install -g bun`)
*   MongoDB instance (local or cloud-based like MongoDB Atlas)
*   Cloudinary account (for image uploads)
*   Google reCAPTCHA keys (v2 "I'm not a robot")

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/IIIT-Marketplace.git
    cd IIIT-Marketplace
    ```

2.  **Backend Setup:**
    *   Navigate to the backend directory:
        ```bash
        cd Backend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Create a `.env` file in the `Backend` directory. You will need to add the following environment variables:
        ```env
        # Backend .env file
        PORT=8000
        MONGO_URI=your_mongodb_connection_string
        DB_NAME=IIIT-Marketplace # Or your preferred DB name
        FRONTEND_URL=http://localhost:5173 # Or your frontend's dev port
        ACCESS_TOKEN_SECRET=your_strong_access_token_secret
        ACCESS_TOKEN_EXPIRY=1d
        REFRESH_TOKEN_SECRET=your_strong_refresh_token_secret
        REFRESH_TOKEN_EXPIRY=10d
        CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
        CLOUDINARY_API_KEY=your_cloudinary_api_key
        CLOUDINARY_API_SECRET=your_cloudinary_api_secret
        RECAPTCHA_SECRET_KEY=your_google_recaptcha_secret_key # For backend verification
        ```
    *   Note: The CAS validation URL `https://login.iiit.ac.in/cas/serviceValidate` is hardcoded in `Backend/src/controllers/user.controller.js`.

3.  **Frontend Setup:**
    *   Navigate to the frontend directory:
        ```bash
        cd ../Frontend
        ```
    *   Install dependencies (using Bun is recommended if you have it):
        ```bash
        bun install
        # OR
        # npm install
        ```
    *   Create a `.env` file in the `Frontend` directory and add your frontend-specific environment variables:
        ```env
        # Frontend .env file (variables must be prefixed with VITE_)
        VITE_API_BASE_URL=/api # Or your full backend URL if hosted separately
        VITE_CHAT_API_KEY=your_chat_api_key # Currently hardcoded in components, should be env var
        VITE_RECAPTCHA_SITE_KEY=your_google_recaptcha_site_key # For frontend widget
        ```

## Running the Project

1.  **Start the Backend Server:**
    *   In the `Backend` directory:
        ```bash
        npm run dev
        ```
    *   The backend server will typically start on the port specified in your `.env` file (e.g., `http://localhost:8000`).

2.  **Start the Frontend Development Server:**
    *   In the `Frontend` directory:
        ```bash
        bun run dev
        # OR
        # npm run dev
        ```
    *   The frontend development server will typically start on `http://localhost:5173`.

Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`) to use the application.

## Screenshots

*(This section can be filled if relevant screenshots are available in the repository. For example: `Backend/public/temp/Screenshot 2025-01-18 022730.png-1737229169326-110932813` could be referenced here if it's a good overview image.)*

To include the screenshot:
1. Create an `assets/screenshots/` directory in the root of the project.
2. Move the screenshot from `Backend/public/temp/` to this new directory.
3. Embed it using Markdown: `![Application Screenshot](assets/screenshots/your_screenshot_name.png)`

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

_README generated by AI Assistant Jules._
