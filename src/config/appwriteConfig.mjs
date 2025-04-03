// import { Client, Databases, Account, ID, Query } from "appwrite";
// import appConfig from "./appConfig.mjs";

// // Initialize Appwrite client
// const client = new Client()
//    .setEndpoint(appConfig.appwrite.endpoint)
//    .setProject(appConfig.appwrite.projectId);

// // Initialize services
// const account = new Account(client);
// const databases = new Databases(client);

// /**
//  * Appwrite service for handling user and post operations
//  */
// const appwriteService = {
//    // User operations
//    createUser: async (email, password, name) => {
//       try {
//          // Create account in Appwrite Auth
//          const newAccount = await account.create(
//             ID.unique(),
//             email,
//             password,
//             name
//          );

//          // Create user in database
//          const user = await databases.createDocument(
//             appConfig.appwrite.databaseId,
//             appConfig.appwrite.usersCollection,
//             ID.unique(),
//             {
//                userId: newAccount.$id,
//                email,
//                name,
//                avatarUrl: "",
//                bio: "",
//             }
//          );

//          return { newAccount, user };
//       } catch (error) {
//          console.error("Error creating user:", error);
//          throw error;
//       }
//    },

//    loginUser: async (email, password) => {
//       try {
//          const session = await account.createEmailSession(email, password);
//          return session;
//       } catch (error) {
//          console.error("Error logging in:", error);
//          throw error;
//       }
//    },

//    getCurrentUser: async () => {
//       try {
//          const currentAccount = await account.get();

//          // Get user details from database
//          const user = await databases.listDocuments(
//             appConfig.appwrite.databaseId,
//             appConfig.appwrite.usersCollection,
//             [Query.equal("userId", currentAccount.$id)]
//          );

//          if (user.documents.length === 0) {
//             throw new Error("User not found in database");
//          }

//          return {
//             account: currentAccount,
//             user: user.documents[0],
//          };
//       } catch (error) {
//          console.error("Error getting current user:", error);
//          return null;
//       }
//    },

//    logoutUser: async () => {
//       try {
//          return await account.deleteSession("current");
//       } catch (error) {
//          console.error("Error logging out:", error);
//          throw error;
//       }
//    },

//    // Post operations
//    createPost: async (title, content, imageId = "", userId) => {
//       try {
//          const post = await databases.createDocument(
//             appConfig.appwrite.databaseId,
//             appConfig.appwrite.postsCollection,
//             ID.unique(),
//             {
//                title,
//                content,
//                imageId,
//                userId,
//                createdAt: new Date().toISOString(),
//             }
//          );
//          return post;
//       } catch (error) {
//          console.error("Error creating post:", error);
//          throw error;
//       }
//    },

//    getPosts: async () => {
//       try {
//          const posts = await databases.listDocuments(
//             appConfig.appwrite.databaseId,
//             appConfig.appwrite.postsCollection,
//             [Query.orderDesc("createdAt")]
//          );
//          return posts.documents;
//       } catch (error) {
//          console.error("Error getting posts:", error);
//          throw error;
//       }
//    },

//    getPostById: async (postId) => {
//       try {
//          const post = await databases.getDocument(
//             appConfig.appwrite.databaseId,
//             appConfig.appwrite.postsCollection,
//             postId
//          );
//          return post;
//       } catch (error) {
//          console.error("Error getting post by ID:", error);
//          throw error;
//       }
//    },

//    getUserPosts: async (userId) => {
//       try {
//          const posts = await databases.listDocuments(
//             appConfig.appwrite.databaseId,
//             appConfig.appwrite.postsCollection,
//             [Query.equal("userId", userId), Query.orderDesc("createdAt")]
//          );
//          return posts.documents;
//       } catch (error) {
//          console.error("Error getting user posts:", error);
//          throw error;
//       }
//    },

//    updatePost: async (postId, title, content, imageId = "") => {
//       try {
//          const updatedPost = await databases.updateDocument(
//             appConfig.appwrite.databaseId,
//             appConfig.appwrite.postsCollection,
//             postId,
//             {
//                title,
//                content,
//                imageId: imageId || undefined, // Only update if provided
//             }
//          );
//          return updatedPost;
//       } catch (error) {
//          console.error("Error updating post:", error);
//          throw error;
//       }
//    },

//    deletePost: async (postId) => {
//       try {
//          await databases.deleteDocument(
//             appConfig.appwrite.databaseId,
//             appConfig.appwrite.postsCollection,
//             postId
//          );
//          return true;
//       } catch (error) {
//          console.error("Error deleting post:", error);
//          throw error;
//       }
//    },
// };

// export default appwriteService;
