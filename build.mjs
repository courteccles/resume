#!/usr/bin/env node
// Builds resume.pdf from resume.md using marked + headless Chromium.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { marked } from "marked";

const root = resolve(import.meta.dirname);
const input = join(root, process.argv[2] ?? "resume.md");
const output = join(root, process.argv[3] ?? "Courtenay-Eccles-Resume.pdf");
const browser = process.env.CHROMIUM ?? "chromium";

const body = marked.parse(readFileSync(input, "utf8"));
const css = readFileSync(join(root, "style.css"), "utf8");
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Courtenay Eccles — Resume</title><style>${css}</style></head><body>${body}</body></html>`;

const dir = mkdtempSync(join(tmpdir(), "resume-"));
try {
  const htmlPath = join(dir, "resume.html");
  writeFileSync(htmlPath, html);
  execFileSync(browser, [
    "--headless", "--disable-gpu", "--no-pdf-header-footer",
    `--user-data-dir=${join(dir, "profile")}`,
    `--print-to-pdf=${output}`, pathToFileURL(htmlPath).href,
  ], { stdio: "inherit" });
  console.log(`Wrote ${output}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
