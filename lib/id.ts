// Generate a Mongo-like ObjectId as a 24-character hex string
export function newObjectId(): string {
    // 12 bytes -> 24 hex chars
    const bytes = new Uint8Array(12);
    // Use crypto if available (Node 19+); fall back to Math.random
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
        crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < 12; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
