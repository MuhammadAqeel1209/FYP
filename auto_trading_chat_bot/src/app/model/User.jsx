import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// Export the User model
const User = mongoose.models.Users || mongoose.model("Users", userSchema);
export default User;
