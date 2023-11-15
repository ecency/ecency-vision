import crypto from "crypto";

export namespace EncryptionTools {
  export function encrypt(privateKey: string, pin: string, initialVector: Buffer) {
    const cipher = crypto.createCipheriv("aes-256-cbc", pin + pin + pin + pin, initialVector);
    let encryptedKey = cipher.update(privateKey, "utf8", "hex");
    encryptedKey += cipher.final("hex");
    return encryptedKey;
  }

  export function decrypt(encryptedData: string, pin: string, initialVector: Buffer) {
    const decipher = crypto.createDecipheriv("aes-256-cbc", pin + pin + pin + pin, initialVector);
    let decryptedKey = decipher.update(encryptedData, "hex", "utf8");
    decryptedKey += decipher.final("utf8");
    return decryptedKey;
  }
}
