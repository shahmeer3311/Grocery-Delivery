// declare is used when something already exists in JavaScript at runtime,
// but TypeScript doesn’t know about it.
// So you tell TypeScript:
// “Trust me, this thing exists — and this is what it looks like.”

import { Connection } from "mongoose"

declare global {
    var mongoose: {
        conn: Connection | null;
        promise: Promise<Connection> | null;
    }
}

export {};

// It makes this file a module instead of a script.
// TypeScript only allows declare global {} inside a module.