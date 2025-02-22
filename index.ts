import { AssemblyAI } from "assemblyai";
import consola from 'consola';
import fs from "fs/promises";
import minimist from "minimist";

const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY;

const args = minimist(process.argv.slice(2));
const pathOrUrl = args._[0];
const outFile = args._[1];

if (!ASSEMBLY_API_KEY) {
    consola.fail("ASSEMBLY_API_KEY env var not defined");
    process.exit(1);
}

if (!pathOrUrl || !outFile) {
    consola.fail("Usage: bun run index.ts <path_or_url> <output_file>");
    process.exit(1);
}

const language = await consola.prompt("Select the language(s) to be transcribed", {
    type: "select",
    options: ["en", "en", "en_au", "en_uk", "en_us", "ja"]
});

const diarize = await consola.prompt("Enable speaker diarization?", {
    type: "confirm"
});

const numSpeakers = diarize ? await consola.prompt("How many speakers are there?", {
    type: "select",
    initial: "2",
    options: ["1", "2", "3"]
}) : "1";

const client = new AssemblyAI({
    apiKey: ASSEMBLY_API_KEY,
});

try {
    consola.start("Starting transcription...");
    const transcript = await client.transcripts.transcribe({
        audio: pathOrUrl,
        language_code: language,
        speaker_labels: diarize,
        speakers_expected: diarize ? Number.parseInt(numSpeakers) : null
    });

    await fs.writeFile(outFile, JSON.stringify(transcript, null, 2));
    consola.success(`Transcription saved to ${outFile}`);
} catch (err) {
    consola.fail(err);
}
