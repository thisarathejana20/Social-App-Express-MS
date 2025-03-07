const mongoose = require("mongoose");
const argon2 = require("argon2");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

//add extra functionality
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await argon2.hash(this.password);
    } catch (error) {
      console.error("Error hashing password:", error);
      next(error);
    }
  }
});

userSchema.method.comparePassword = async function (candidatePasswords) {
  try {
    return await argon2.verify(this.password, candidatePasswords);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

userSchema.index({ ussername: "text" });

module.exports = mongoose.model("User", userSchema);
