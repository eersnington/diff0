"use node";
import { Buffer as BufferPolyfill } from "buffer";

globalThis.Buffer = BufferPolyfill;
