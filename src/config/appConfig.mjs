import  dotenv  from "dotenv";
dotenv.config();

const overAllConfig = {
  port: process.env.PORT,
  dbString: process.env.MONGO_CONNECTION_STRING,
  nodeEnv: process.env.NODE_ENV,
  appwrite: {
    endpoint: process.env.APPWRITE_ENDPOINT,
    projectId: process.env.APPWRITE_PROJECT_ID,
    apiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID,
    usersCollection: process.env.APPWRITE_COLLECTION_USERS,
    postsCollection: process.env.APPWRITE_COLLECTION_POSTS,
  },
  // google: {
  //   clientId: process.env.GOOGLE_CLIENT_ID,
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //   callbackURL: process.env.GOOGLE_CALLBACK_URL,
  // },
  sessionSignatureKey: process.env.SESSION_SECRET_FOR_SIGN,
};

const appConfig = Object.freeze(overAllConfig);

export default appConfig;
