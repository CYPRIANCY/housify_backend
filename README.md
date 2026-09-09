# Real Estate Backend

A Node.js/Express backend for a real estate platform supporting user authentication, property listings, KYC/identity verification, reviews, admin controls, and more.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
  - [Auth](#auth)
  - [User](#user)
  - [Property](#property)
  - [Verification (KYC)](#verification-kyc)
  - [Admin](#admin)
  - [History](#history)
  - [Reviews](#reviews)
- [Utilities](#utilities)
- [Running the Project](#running-the-project)

---

## Features

- User registration, login, email verification (OTP)
- JWT-based authentication (access & refresh tokens)
- Role-based access control (tenant, landlord, admin)
- Property listing, updating, deleting, and viewing
- Favourites management
- Identity/KYC verification with document upload
- Fraud detection on property listings
- Review system for landlords and tenants
- Admin dashboard: user management, property moderation, analytics
- History logging for user actions
- Secure file uploads to Cloudinary
- Email notifications (OTP, welcome, password reset)
- Rate limiting, security headers, CORS

---

## Tech Stack

- Node.js, Express.js
- MongoDB, Mongoose
- JWT for authentication
- Cloudinary for file storage
- Resend for transactional emails
- Multer for file uploads
- Helmet, CORS, Rate Limiting for security

---

## Environment Variables

Create a `.env` file with:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=your_resend_api_key
NODE_ENV=development
```

---

## Project Structure

```
controllers/
middleware/
models/
routes/
utils/
server.js
README.md
.env
```

---

## API Routes

### Auth

| Method | Endpoint                | Description                       |
|--------|-------------------------|-----------------------------------|
| POST   | `/api/auth/register`    | Register user (tenant/landlord)   |
| POST   | `/api/auth/login`       | Login user                        |
| POST   | `/api/auth/refresh`     | Refresh access token              |
| POST   | `/api/auth/logout`      | Logout user                       |
| POST   | `/api/auth/verify-otp`  | Verify email OTP                  |
| POST   | `/api/auth/resend-otp`  | Resend email OTP                  |
| POST   | `/api/auth/forgot`      | Send password reset OTP           |
| POST   | `/api/auth/reset`       | Reset password with OTP           |
| GET    | `/api/auth/users`       | Get all registered users (admin)  |

---

### User

- User info is available via JWT after login.
- Favourites management via property routes.

---

### Property

| Method | Endpoint                              | Description                        |
|--------|---------------------------------------|------------------------------------|
| POST   | `/api/property`                       | List a new property (landlord)     |
| GET    | `/api/property/:id`                   | View property by ID                |
| GET    | `/api/property/landlord/:landlordId`  | Get all properties by landlord     |
| PUT    | `/api/property/:id`                   | Update property (owner only)       |
| DELETE | `/api/property/:id`                   | Delete property (owner only)       |
| POST   | `/api/property/:propertyId/favourite` | Add property to favourites         |
| DELETE | `/api/property/:propertyId/favourite` | Remove property from favourites    |
| GET    | `/api/property/favourites`            | Get user's favourite properties    |
| POST   | `/api/property/:propertyId/report`    | Report a property                  |
| GET    | `/api/property/reports`               | Get user's property reports        |

---

### Verification (KYC)

| Method | Endpoint                                 | Description                        |
|--------|------------------------------------------|------------------------------------|
| POST   | `/api/verification/submit`               | Submit KYC/identity verification   |
| GET    | `/api/verification/me`                   | Get latest verification status     |
| DELETE | `/api/verification/:id/document`         | Delete a verification document     |
| GET    | `/api/admin/verification`                | List all verifications (admin)     |
| POST   | `/api/admin/verification/:id/review`     | Approve/reject verification (admin)|

---

### Admin

| Method | Endpoint                              | Description                        |
|--------|---------------------------------------|------------------------------------|
| GET    | `/api/admin/users`                    | Get all users                      |
| PATCH  | `/api/admin/users/:id/suspend`        | Suspend a user                     |
| DELETE | `/api/admin/users/:id`                | Delete a user                      |
| GET    | `/api/admin/property`                 | View all properties                |
| GET    | `/api/admin/listings/pending`         | Get all pending listings           |
| PATCH  | `/api/admin/listings/:id/approve`     | Approve a property listing         |
| PATCH  | `/api/admin/listings/:id/reject`      | Reject a property listing          |
| GET    | `/api/admin/reports`                  | Get all reports                    |
| GET    | `/api/admin/analytics`                | Get platform analytics             |

---

### History

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/api/history`              | Get user's action history          |
| GET    | `/api/history/:historyId`   | Get history record by ID           |
| POST   | `/api/history`              | Add a history record               |

---

### Reviews

| Method | Endpoint                                   | Description                        |
|--------|--------------------------------------------|------------------------------------|
| GET    | `/api/reviews/property/:propertyId`        | Get reviews for a property         |
| POST   | `/api/reviews/landlord/:landlordId`        | Add review for landlord            |
| POST   | `/api/reviews/tenant/:tenantId`            | Add review for tenant              |
| GET    | `/api/reviews/landlord/:landlordId`        | Get reviews for landlord           |
| GET    | `/api/reviews/tenant/:tenantId`            | Get reviews for tenant             |
| GET    | `/api/reviews/:reviewId`                   | Get review by ID                   |
| DELETE | `/api/reviews/:reviewId`                   | Delete review (admin only)         |

---

## Utilities

- **Email:** `utils/sendEmail.js` (OTP, welcome, password reset)
- **Cloudinary:** `utils/cloudinary.js` (media uploads)
- **Fraud Detection:** `utils/fraudDetection.js` (property listing checks)
- **Upload Middleware:** `utils/uploadVerification.js` (KYC uploads)

---

## Running the Project

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env` file (see above).
3. Start the server:
   ```bash
   npm run dev
   ```
4. The API will be available at `http://localhost:5000/`

---

## Notes

- All protected routes require JWT authentication via cookies or Authorization header.
- Admin routes require the `admin` role.
- For file uploads (KYC), use `multipart/form-data` and the documented field names.
- See controllers and routes for more details on request/response formats.

---

**For questions or contributions, please open an issue or pull request.**# real-estate-housifly-backend
# real-estate-housifly-backend
