# Pro Blog

A full-stack blog application built with Node.js, Express, MongoDB, and Appwrite, featuring Google OAuth authentication.

## Features

-  User authentication (local and Google OAuth)
-  Create, read, update, and delete blog posts
-  Image upload functionality
-  Responsive design
-  Hybrid backend with Appwrite and MongoDB

## Technologies Used

-  **Frontend**: EJS templates, Bootstrap 5, JavaScript
-  **Backend**: Node.js, Express
-  **Database**: MongoDB
-  **Backend as a Service**: Appwrite
-  **Authentication**: Passport.js with Google OAuth 2.0
-  **File Storage**: Local file system with Multer

## Getting Started

### Prerequisites

-  Node.js (v14 or higher)
-  MongoDB (local or Atlas)
-  Appwrite account and project
-  Google Developer account (for OAuth)

### Installation

1. Clone the repository

```
git clone <repository-url>
cd pro-blog
```

2. Install dependencies

```
npm install
```

3. Configure environment variables
   Create a `.env` file in the root directory with the following variables:

```
PORT=5002
MONGO_CONNECTION_STRING=mongodb://localhost:27017/pro-blog
NODE_ENV=development

# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_COLLECTION_USERS=your_users_collection_id
APPWRITE_COLLECTION_POSTS=your_posts_collection_id

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5002/auth/google/callback

# Session Configuration
SESSION_SECRET_FOR_SIGN=secureSessionKey
```

4. Start the application

```
npm run dev
```

5. Open your browser and navigate to `http://localhost:5002`

## Project Structure

```
pro-blog/
├── public/               # Static assets
│   ├── css/              # CSS files
│   ├── js/               # JavaScript files
│   └── uploads/          # Uploaded images
├── src/                  # Application source code
│   ├── config/           # Configuration files
│   ├── middlewares/      # Custom middlewares
│   ├── Posts/            # Post model and controllers
│   └── User/             # User model and controllers
├── views/                # EJS templates
│   └── layouts/          # Layout templates
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies
├── README.md             # Project documentation
└── server.mjs            # Entry point
```

## License

This project is licensed under the MIT License.
