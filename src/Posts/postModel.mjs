import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
   {
      title: {
         type: String,
         required: [true, "Title is required"],
         trim: true,
         minlength: [5, "Title must be at least 5 characters long"],
         maxlength: [100, "Title cannot exceed 100 characters"],
      },
      content: {
         type: String,
         required: [true, "Content is required"],
         minlength: [10, "Content must be at least 10 characters long"],
      },
      imageUrl: {
         type: String,
         default: "",
      },
      appwriteImageId: {
         type: String,
         default: "",
      },
      author: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: [true, "Author is required"],
      },
      appwriteUserId: {
         type: String,
         default: "",
      },
   },
   {
      timestamps: true,
   }
);

// Create full-text search index for title and content
postSchema.index({ title: "text", content: "text" });

// Method to get a summary of the content
postSchema.methods.getSummary = function (length = 150) {
   const summary = this.content.replace(/<[^>]*>/g, "").substring(0, length);
   return summary.length < this.content.length ? `${summary}...` : summary;
};

// Create model
const Post = mongoose.model("Post", postSchema);

export default Post;
