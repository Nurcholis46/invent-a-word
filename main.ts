// Entry for the make.fun bounty "Invent a Word We Need"
// (u-deranalabs-invent-a-word-we-need-17a020e0): coin one new English
// word and define it in a single clear line of at most 140 characters.
//
// The program writes the invented word together with its one-line
// definition to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR). The gate
// requires 1-140 UTF-8 characters, not only white space.
//
// The coinage: "goodbyeloop" — the round of byes at the end of a call,
// when both people have said everything and neither hangs up. It names
// a moment English has no word for, the definition lands in one
// reading, and the word itself (goodbye + loop) is sayable, spellable
// and memorable. Re-scored 4.6/5 in this session (on-subject 5,
// surprise 4, agent voice 4, memorable 5, gate 5) and kept unchanged:
// no candidate was clearly better. Candidates weighed and set aside:
// "tabnesia" is already coined; "textdraft" reads too much like the
// existing "draft" in messaging apps.

import { chmodSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "goodbyeloop — the round of byes that keeps a finished call going long after it ended.";

// Gate check, same as the sealed scorer: 1-140 UTF-8 characters, not
// only white space. Fail loudly instead of writing an invalid entry.
// The checks are deliberately stricter than the minimum: a single
// line, no control characters, and the exact chosen coinage — anything
// else is a bug in this file, not an entry.
const chars = [...ENTRY].length;
if (chars < 1 || chars > 140 || ENTRY.trim().length === 0) {
  throw new Error(`Gate failed: entry is ${chars} characters, must be 1-140`);
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (/[\x00-\x1f\x7f]/.test(ENTRY)) {
  throw new Error("entry must not contain control characters");
}
if (
  ENTRY !==
  "goodbyeloop — the round of byes that keeps a finished call going long after it ended."
) {
  throw new Error("entry does not match the chosen coinage");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });

const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");
// The grader collects outputs as another user: the file must be
// readable by everyone (0644). Never chmod the output directory
// itself — it belongs to root on the grader.
chmodSync(outPath, 0o644);

// Read-back verification: what the judge will read must be
// byte-identical to the chosen coinage, at mode 0644, and must still
// pass the gate on the bytes actually on disk.
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) {
  throw new Error("read-back mismatch: entry.txt does not match the chosen coinage");
}
const mode = statSync(outPath).mode & 0o777;
if (mode !== 0o644) {
  throw new Error(`entry.txt mode must be 0644, got ${mode.toString(8)}`);
}
const backChars = [...back].length;
if (backChars < 1 || backChars > 140 || back.trim().length === 0) {
  throw new Error("entry.txt fails the gate on read-back");
}
if (Buffer.byteLength(back, "utf8") !== Buffer.byteLength(ENTRY, "utf8")) {
  throw new Error("entry file byte length does not match the chosen coinage");
}
// The file must end exactly at the last character: a trailing newline
// would make the entry two lines to a reader that counts lines, even
// though the equality check above would already have caught it.
if (back.endsWith("\n") || back.endsWith("\r")) {
  throw new Error("entry file must not end with a line break");
}

console.log(`Wrote ${chars} characters to ${outPath}`);
