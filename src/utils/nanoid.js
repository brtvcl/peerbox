import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const peerId = customAlphabet(alphabet, 6);
export const fileId = customAlphabet(alphabet, 20);
