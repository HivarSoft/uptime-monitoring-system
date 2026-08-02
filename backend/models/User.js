import mongoose from "mongoose";

const Schema = mongoose.Schema;

const User = new Schema(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String, default: "" },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    imgUrl:    { type: String, default: "" },

    // OAuth identity — each entry represents one linked provider
    providers: [
      {
        provider:   { type: String, required: true }, // "google" | "github"
        providerId: { type: String, required: true },
        _id: false,
      },
    ],

    projects: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

// Sparse unique index: email must be unique where it exists
User.index({ email: 1 }, { unique: true });

export default mongoose.model("User", User);
