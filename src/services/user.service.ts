import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { safeExec } from "../sqlhelpers/safeExec";
import { exec } from "../sqlhelpers/exec";

export const registerUser = async (data: any) => {
  data.id = uuidv4();
  data.email.toLowerCase().trim();
  data.password = await hashPassword(data.password);
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
  return result;
};

export const getUserByEmail = async (email: string) => {
  email = email.toLowerCase().trim();
    const result = await safeExec("get-user-by-email", () =>
    exec((req) =>
      req
        .input("email", email)
        .query("SELECT * FROM [User] WHERE email = @email")
    )
  );
  return result;
}

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
