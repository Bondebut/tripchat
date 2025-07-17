import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { safeExec } from "../sqlhelpers/safeExec";
import { exec } from "../sqlhelpers/exec";

export const registerUser = async (data: any) => {
  // console.log("Registering user with data:", data);
  data.id = uuidv4();

  data.email.toLowerCase().trim();

  data.password = await hashPassword(data.password);

  const existingUser = await safeExec("check-user-exists", () =>
    exec((req) =>
      req
        .input("email", data.email)
        .query("SELECT * FROM [User] WHERE email = @email")
    )
  );

  if (existingUser && existingUser.recordset.length > 0) {
    throw new Error("Email already exists!");
  }

  const result = await safeExec("create-user", () =>
    exec((req) =>
      req
        .input("id", data.id)
        .input("username", data.username)
        .input("email", data.email)
        .input("password", data.password)
        .query(
          `INSERT INTO [User] (id, username, email, password) VALUES (@id, @username, @email, @password) 
          
          SELECT username,email FROM [User] WHERE id = @id`
        )
    )
  );

  if (!result) {
    throw new Error("User registration failed try again");
  }

  return result.recordset[0];
};

export const loginUser = async (data: any) => {
  // console.log("User login data:", data);
  data.email = data.email.toLowerCase().trim();
  const user = await getUserExits(data.email);
  // console.log("User found:", user);

  if (!user || user.recordset.length === 0) {
    throw new Error("Invalid email!");
  }

  const isPasswordValid = await comparePassword(
    data.password,
    user.recordset[0].password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid password!");
  }

  return user.recordset[0];
};

export const getUserExits = async (email: string) => {
  email = email.toLowerCase().trim();
  const user = await safeExec("get-user-by-email", () =>
    exec((req) =>
      req
        .input("email", email)
        .query("SELECT * FROM [User] WHERE email = @email")
    )
  );
  return user;
};



export const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};
