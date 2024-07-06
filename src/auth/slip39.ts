import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator";

// @ts-expect-error untyped
import slip39 from "slip39";

const crypto =
  typeof window === "undefined"
    ? require("node:crypto").webcrypto
    : window.crypto;

export const split = (
  key: string,
  totalShares: number,
  threshold: number
): string[] => {
  const masterSecretBytes = hexToBytes(key);
  const slip = slip39.fromArray(masterSecretBytes, {
    passphrase: "",
    threshold,
    groups: new Array(totalShares).fill([1, 1]),
  });

  let sharesString = "";
  for (let index = 0; index < totalShares; index++) {
    const derivationPath = `r/${index}`;
    sharesString += `${slip.fromPath(derivationPath).mnemonics}\n\n`;
  }

  return sharesString
    .trim()
    .split("\n")
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
};

export const combine = (shares: string[]): string => {
  const mnemonics = shares.map((m) => m.trim()).filter((m) => m.length > 0);
  const secretBytes = slip39.recoverSecret(mnemonics, "");
  return bytesToHex(secretBytes);
};

export async function sha256(message: string) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export function stringToName(str: string) {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: "-",
    seed: str,
  });
}

export async function generateKey(strengthBits: number) {
  const buffer = new Uint8Array(strengthBits / 8);
  crypto.getRandomValues(buffer);
  return bytesToHex(buffer);
}

function hexToBytes(hex: string): number[] {
  if (hex.length === 0) {
    return [];
  }
  if (hex.length % 2 !== 0) {
    hex = `0${hex}`;
  }
  const byteArray: number[] = [];
  for (let index = 0; index < hex.length; index += 2) {
    const byte = Number.parseInt(hex.substring(index, index + 2), 16);
    byteArray.push(byte);
  }
  return byteArray;
}

function bytesToHex(byteArray: Uint8Array): string {
  const hexArray: string[] = [];
  for (const byte of byteArray) {
    const hex = byte.toString(16).padStart(2, "0");
    hexArray.push(hex);
  }
  return hexArray.join("");
}
