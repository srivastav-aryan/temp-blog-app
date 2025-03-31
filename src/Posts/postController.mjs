import Post from "./postModel.mjs";
import User from "../User/userModel.mjs";
import appwriteService from "../config/appwriteConfig.mjs";

/**
 * Create a new post
 */
export const createPost = async (req, res, next) => {
   try {
      if (!req.session.user) {
         return res.status(401).json({ message: "Not authenticated" });
      }

      const { title, content } = req.body;
      const userId = req.session.user._id;

      // Validate input
      if (!title || !content) {
         return res
            .status(400)
            .json({ message: "Title and content are required" });
      }

      // Create post in MongoDB
      let imageUrl = "";
      let appwriteImageId = "";

      // Handle file upload if present
      if (req.file) {
         imageUrl = `/uploads/${req.file.filename}`;
      }

      // Create post in MongoDB
      const post = await Post.create({
         title,
         content,
         imageUrl,
         appwriteImageId,
         author: userId,
      });

      // Try to create post in Appwrite
      try {
         const appwritePost = await appwriteService.createPost(
            title,
            content,
            appwriteImageId,
            userId.toString()
         );

         // Update the MongoDB post with Appwrite ID
         await Post.findByIdAndUpdate(post._id, {
            appwriteUserId: appwritePost.$id,
         });
      } catch (appwriteError) {
         console.error("Appwrite post creation failed:", appwriteError);
         // Continue with local post creation
      }

      res.status(201).json({
         message: "Post created successfully",
         post,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get all posts
 */
export const getAllPosts = async (req, res, next) => {
   try {
      // First try to get posts from Appwrite
      let posts = [];
      try {
         posts = await appwriteService.getPosts();
      } catch (appwriteError) {
         console.error("Appwrite get posts failed:", appwriteError);
         // Fall back to MongoDB
         posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate("author", "username displayName avatarUrl");
      }

      res.status(200).json({ posts });
   } catch (error) {
      next(error);
   }
};

/**
 * Get single post by ID
 */
export const getPostById = async (req, res, next) => {
   try {
      const { id } = req.params;

      // First try to get post from Appwrite
      let post;
      try {
         post = await appwriteService.getPostById(id);
      } catch (appwriteError) {
         console.error("Appwrite get post failed:", appwriteError);
         // Fall back to MongoDB
         post = await Post.findById(id).populate(
            "author",
            "username displayName avatarUrl"
         );

         if (!post) {
            return res.status(404).json({ message: "Post not found" });
         }
      }

      res.status(200).json({ post });
   } catch (error) {
      next(error);
   }
};

/**
 * Update a post
 */
export const updatePost = async (req, res, next) => {
   try {
      if (!req.session.user) {
         return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.session.user._id;

      // First check if post exists and user is the author
      const post = await Post.findById(id);

      if (!post) {
         return res.status(404).json({ message: "Post not found" });
      }

      if (post.author.toString() !== userId.toString()) {
         return res
            .status(403)
            .json({ message: "Not authorized to update this post" });
      }

      // Update image if there is a new file
      let updateData = { title, content };
      if (req.file) {
         updateData.imageUrl = `/uploads/${req.file.filename}`;
      }

      // Update in MongoDB
      const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
         new: true,
      }).populate("author", "username displayName avatarUrl");

      // Try to update in Appwrite
      try {
         if (post.appwriteUserId) {
            await appwriteService.updatePost(
               post.appwriteUserId,
               title,
               content,
               post.appwriteImageId
            );
         }
      } catch (appwriteError) {
         console.error("Appwrite post update failed:", appwriteError);
         // Continue with local update
      }

      res.status(200).json({
         message: "Post updated successfully",
         post: updatedPost,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Delete a post
 */
export const deletePost = async (req, res, next) => {
   try {
      if (!req.session.user) {
         return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const userId = req.session.user._id;

      // First check if post exists and user is the author
      const post = await Post.findById(id);

      if (!post) {
         return res.status(404).json({ message: "Post not found" });
      }

      if (post.author.toString() !== userId.toString()) {
         return res
            .status(403)
            .json({ message: "Not authorized to delete this post" });
      }

      // Try to delete from Appwrite
      try {
         if (post.appwriteUserId) {
            await appwriteService.deletePost(post.appwriteUserId);
         }
      } catch (appwriteError) {
         console.error("Appwrite post deletion failed:", appwriteError);
         // Continue with local deletion
      }

      // Delete from MongoDB
      await Post.findByIdAndDelete(id);

      res.status(200).json({ message: "Post deleted successfully" });
   } catch (error) {
      next(error);
   }
};

/**
 * Get posts by user
 */
export const getUserPosts = async (req, res, next) => {
   try {
      const { userId } = req.params;

      // Try to get user posts from Appwrite
      let posts = [];
      try {
         posts = await appwriteService.getUserPosts(userId);
      } catch (appwriteError) {
         console.error("Appwrite get user posts failed:", appwriteError);
         // Fall back to MongoDB
         posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .populate("author", "username displayName avatarUrl");
      }

      res.status(200).json({ posts });
   } catch (error) {
      next(error);
   }
};
