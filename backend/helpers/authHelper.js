import jwt from "jsonwebtoken";

export const generateToken = (id, email, firstName, lastName) => {
  return jwt.sign(
    {
      id: id,
      email,
      firstName,
      lastName,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
