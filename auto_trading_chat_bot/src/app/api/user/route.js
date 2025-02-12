import connectDatabase from "@/app/libs/database";
import Users from "@/app/model/User";
import bcrypt from 'bcrypt';


export const POST = async (req) => {
  try {
    await connectDatabase();
    const {
      password,
      email,
    } = await req.json();

    if ( !password || !email) {
      return new Response(
        JSON.stringify({ success: false, status: 400, error: "Missing required fields" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, status: 409, error: "User with this email already exists" }),
        { headers: { "Content-Type": "application/json" }, status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // Create a new user
    const newUser = await Users.create({
      password: hashedPassword,
      email,
    });

    return new Response(
      JSON.stringify({ success: true, status: 201, message: "User registered successfully", data: newUser }),
      { headers: { "Content-Type": "application/json" }, status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/users:", error);
    return new Response(
      JSON.stringify({ success: false, status: 500, error: "Internal Server Error", details: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
};

// GET Request to fetch all users
export const GET = async (request) => {
  try {
    await connectDatabase();
    const data = await Users.find();

    return new Response(
      JSON.stringify({
        success: true,
        status: 200,
        data,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in GET /api/Users:", error);
    return new Response(
      JSON.stringify({
        success: false,
        status: 500,
        error: "Internal Server Error",
        details: error.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};
