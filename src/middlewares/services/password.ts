import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  static async hash(password: string) {
    const salt = randomBytes(8).toString("hex");
    const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buffer.toString("hex")}.${salt}`;
  }

  static async compareHash(password: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
    return buffer.toString("hex") === hashed;
  }
}
