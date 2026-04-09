import crypto from "crypto";

// Use PBKDF2 for key derivation from passwords to prevent brute-force attacks
// Using 100,000 iterations with SHA-256 HMAC for sufficient computational cost
const PBKDF2_ITERATIONS = 100000;
const FIXED_SALT = Buffer.from("panelio-jdownloader-fixed-salt", "utf8");

export function sha256(data) {
  return crypto.createHash("sha256").update(data).digest();
}

export function deriveKey(password) {
  return crypto.pbkdf2Sync(
    password,
    FIXED_SALT,
    PBKDF2_ITERATIONS,
    32, // 32 bytes = 256 bits
    "sha256"
  );
}

export function uniqueRid() {
  return Math.floor(Math.random() * 10e12);
}

export function validateRid(decryptedData, rid) {
  if (decryptedData.rid !== rid) {
    throw new Error("RequestID mismatch");
  }
  return decryptedData;
}

export function decrypt(data, ivKey) {
  const iv = ivKey.slice(0, ivKey.length / 2);
  const key = ivKey.slice(ivKey.length / 2, ivKey.length);
  const cipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  return Buffer.concat([cipher.update(data, "base64"), cipher.final()]).toString();
}

export function createEncryptionToken(oldTokenBuff, updateToken) {
  const updateTokenBuff = Buffer.from(updateToken, "hex");
  const mergedBuffer = Buffer.concat([oldTokenBuff, updateTokenBuff], oldTokenBuff.length + updateTokenBuff.length);
  return sha256(mergedBuffer);
}

export function encrypt(data, ivKey) {
  if (typeof data !== "string") {
    throw new Error("data no es un string");
  }
  if (!(ivKey instanceof Buffer)) {
    throw new Error("ivKey no es un buffer");
  }
  if (ivKey.length !== 32) {
    throw new Error("ivKey tiene que tener tamaño 32");
  }
  const stringIVKey = ivKey.toString("hex");
  const stringIV = stringIVKey.substring(0, stringIVKey.length / 2);
  const stringKey = stringIVKey.substring(stringIVKey.length / 2, stringIVKey.length);
  const iv = Buffer.from(stringIV, "hex");
  const key = Buffer.from(stringKey, "hex");
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  return cipher.update(data, "utf8", "base64") + cipher.final("base64");
}
