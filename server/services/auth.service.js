// server/services/auth.service.js

//its going to contain the business logic for our backend
const bcrypt = require("bcrypt");//used for password hashing
const jwt = require("jsonwebtoken");//library for JWT authentication
const env = require("../config/env");//loads the .env
const usersRepo = require("../repositories/user.repo");
const AppError = require("../utils/AppError");

//it hundles the user regestration
async function signup({ email, password, name }) {
    //when email, password, name dont exist
  if (!email || !password || !name) {
    //conflict error
    throw new AppError("email, password, and name are required", 400);
  }
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const existing = await usersRepo.findByEmail(email);
  if (existing) {
    throw new AppError("An account with that email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  //passwordhash->we are not storing the raw password
  const user = await usersRepo.insert({ email, passwordHash, name });
  const token = signToken(user);
  return { user, token };
}

//hundles authentication
async function login({ email, password }) {
    //when not email or password
  if (!email || !password) {
    throw new AppError("email and password are required", 400);
  }

  const user = await usersRepo.findByEmail(email);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  //password verification
  //                bcrypt.compare->the system going to compare the password
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw new AppError("Invalid credentials", 401);
  }

  // Strip the hash before returning
  //we are removing the password hash from object
  const { password_hash, ...safeUser } = user;
  //generating a token
  const token = signToken(safeUser);//
  return { user: safeUser, token };
}

function signToken(user) {
  return jwt.sign(
    //sub-subject, 
    { sub: user.id, email: user.email, role: user.role },
    //used for crypographicallly sighn token
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

//checking whether the JWT is valid
function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    throw new AppError("Invalid or expired token", 401);
  }
}

module.exports = { signup, login, verifyToken };