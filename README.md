
# Ad Management Platform Backend

This repository contains the backend system for an Ad Management Platform designed for advertisers . The platform offers robust features including authentication, authorization, ad graphics upload service (with video compression), and the ability for advertisers to add attributes such as gender and location to their ads.

## Features

- User registration and login with JWT authentication.
- Role-based access control (RBAC) for different user roles (User and Admin).
- Upload service for ad graphics with support for image and video files.
- Video compression for uploaded videos.
- Ability to add attributes such as gender and location to ads.
- RESTful API for managing ads and user profiles.

## Tech Stack
- MongoDB: NoSQL database for storing user and ad data.
- Express.js: Web framework for Node.js.



## Getting Started

### Prerequisites

- Node.js
- MongoDB (MongoDB Atlas for cloud database)
- npm 

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ayadnez/ad-platform.git
cd ad-platform
```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    Create a `.env` file in the root directory and add the following variables:

    ```
    PORT=4000
    MONGODB_URI=mongodb://localhost:27017/ad-management
    JWT_SECRETKEY=your_jwt_secret_key
    REFRESH_KEY=your_refresh_secret_key
    ```


### Running the Server

To start the server, run:

```bash
  npm start
```
## API Endpoints

### Public Routes

- `POST /register`: Register a new user.
- `POST /login`: Login a user and return an access token.

### Authenticated User Routes

- `POST /upload`: Upload ad graphics.
- `PUT /ads/:id`: Update an ad.
- `GET /ads`: Get all ads.
- `POST /logout`: Logout a user and clear the refresh token.

### Admin Routes

- `GET /admin/ads`: Get all ads (admin only).
- `POST /admin/assign-admin`: Assign admin role to a user (admin only).


