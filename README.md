# PetHome — Pet Adoption Platform (Server)

## Purpose

This is the **server-side** (Express + MongoDB) API for PawHome, a full-stack MERN pet adoption
platform. It handles authentication, pet listings, and the adoption request workflow between
adopters and pet owners.

## Live API URL

🔗 **https://pet-adoption-platform-server-side.onrender.com**

## Client-side Repository

🔗 https://github.com/Ayaka0711/Pet-Adoption-Platform-client-side

## Live Website

🔗 https://pet-adoption-platform-client-side.vercel.app

## Features

- **Authentication** via BetterAuth — email/password and Google OAuth, sessions stored in
  signed HTTPOnly cookies, verified in Express middleware on every protected route.
- **Pet CRUD API** — public browse/search/filter/sort endpoints, plus owner-only create,
  update, and delete routes (ownership is enforced server-side on every write, never trusted from
  the client).
- **Search, filter & sort** — pet name search using MongoDB's `$regex`, species filtering using
  `$in`, and sorting by adoption fee or age.
- **Adoption request API** — submit, list (mine / received), approve, reject, and cancel
  requests.
- **Adoption control** — an owner cannot request their own pet; approving one request
  automatically rejects all other pending requests for that pet and marks the pet as adopted,
  preventing further requests.
- **CORS configured** for a cross-domain client (client and server are deployed on different
  domains), including `SameSite=None; Secure` cookies so sessions survive the cross-site request in
  production.

## NPM Packages Used

- `express` — HTTP server & routing
- `better-auth` — authentication (email/password, Google OAuth, session cookies)
- `mongodb` — official driver, used by BetterAuth's Mongo adapter
- `mongoose` — schema modeling for `Pet` and `AdoptionRequest` collections
- `cors` — cross-origin request handling
- `dotenv` — environment variable loading

## Tech Stack

Node.js · Express · MongoDB Atlas · Mongoose · BetterAuth

## API Overview

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/pets` | Public | List pets — supports `search`, `species`, `sort`, `hideAdopted` |
| GET | `/api/pets/featured` | Public | 6 most recent available pets for the homepage |
| GET | `/api/pets/mine` | Private | Pets owned by the logged-in user |
| GET | `/api/pets/:id` | Public | Single pet's details |
| POST | `/api/pets` | Private | Add a new pet listing |
| PATCH | `/api/pets/:id` | Private (owner) | Update a listing |
| DELETE | `/api/pets/:id` | Private (owner) | Delete a listing |
| POST | `/api/requests` | Private | Submit an adoption request |
| GET | `/api/requests/mine` | Private | Requests submitted by the logged-in user |
| GET | `/api/requests/pet/:petId` | Private (owner) | Requests received for a pet |
| PATCH | `/api/requests/:id` | Private (owner) | Approve / reject a request |
| DELETE | `/api/requests/:id` | Private (requester) | Cancel your own request |

## Running Locally

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET
npm run dev
```

# ---- MongoDB ----
MONGODB_URI=mongodb+srv://minayathreads99_db_user:mItvqXmXhsxWtP8w@cluster0.m5rajbr.mongodb.net/pawhome?retryWrites=true&w=majority&appName=Cluster0

BETTER_AUTH_SECRET=b222a713f5d69be9138f5cd559a170108926971dbcf98976163585ebed3cbc95

PORT=5000

NODE_ENV=development
SERVER_URL=http://localhost:5000

CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret


## Deployment

Deployed on **Render** (free tier Web Service). MongoDB Atlas Network Access is set to allow
access from anywhere (`0.0.0.0/0`) since Render's outbound IPs are not fixed on the free tier.
