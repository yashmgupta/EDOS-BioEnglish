#!/usr/bin/env node
/* Offline companion to EDOS BioEnglish Teaching Studio. Run with Node 18 or newer. */
'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
globalThis.JSZip = require(path.join(__dirname, 'jszip.min.js'));
require(path.join(__dirname, 'office.js'));
async function main() {
  if (!process.argv[2]) throw new Error('Use: node render.cjs material.json [output-folder]');
  const input = path.resolve(process.argv[2]);
  const supplied = JSON.parse(await fs.readFile(input, 'utf8'));
  const adjacent = path.dirname(input);
  const lesson = JSON.parse(await fs.readFile(path.join(adjacent, 'lesson.json'), 'utf8').catch(() => fs.readFile(path.join(__dirname, 'lesson.json'), 'utf8')));
  const draft = require(path.join(__dirname, 'model.js')).validate(supplied, [lesson]);
  if (!draft.title || !draft.objective || !draft.course || !Array.isArray(draft.items) || !Array.isArray(draft.slides)) {
    throw new Error('Use the lesson pack sample.json format. Include title, objective, course, items and slides.');
  }
  const out = path.resolve(process.argv[3] || 'output');
  const files = [];
  if (draft.items.length) {
    files.push(['student.docx', await StudioOffice.word(draft, 'student')], ['teacher.docx', await StudioOffice.word(draft, 'teacher')]);
  }
  if (draft.slides.length) {
    const source = await fs.readFile(path.join(adjacent, 'original.pptx')).catch(() => fs.readFile(path.join(__dirname, 'original.pptx')));
    files.push(['slides.pptx', await StudioOffice.slides(draft, {}, source)]);
  }
  if (!files.length) throw new Error('Add at least one task or slide.');
  await fs.mkdir(out, {recursive: true});
  for (const [name, blob] of files) {
    const target = path.join(out, name);
    await fs.writeFile(target, new Uint8Array(await blob.arrayBuffer()));
    process.stdout.write(target + '\n');
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
