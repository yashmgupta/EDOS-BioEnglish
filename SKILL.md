---
name: prepare-bioenglish-materials
description: Prepare or adapt syllabus-based lessons, speaking activities, worksheets, assessments, rubrics and editable slides for EDOS BioEnglish courses 258200, 258201 and 258202.
---
# Prepare EDOS BioEnglish materials

## Find the right lesson
For a full course ZIP or a GitHub folder, read START-HERE.md and catalog.json. Match the course, chapter or week. For a week-based request, read courses/<code>/weekly-plan.json. Check its reference and the corresponding pages in syllabus.pdf in the same folder. Weeks in grouped syllabus blocks may use a suggested sequence. Keep official assessment conditions separate from optional practice. When the request is clear, begin. When it does not name a course, ask which learning goal the lecturer wants.

Open lessons/<lesson-id>/lesson.json for the learning outcomes, vocabulary and teaching activity. Read teaching-outline.json, teaching.pptx and chapter.pdf for the material students use. Read sample.json for the material format. Form B gives a parallel scenario. A single-lesson ZIP places sample.json and the lesson files at the top level; a course-based lesson pack also contains syllabus.pdf and course-plan.json. Preserve any approved lecturer edits in the supplied sample. For a GitHub link, retrieve the actual files from the accessible repository. If access fails, ask for the ZIP.

## Prepare the material
Write in clear English for Thai university biology students. Use short instructions and explain a new biology term through a concrete example. Keep the requested learning outcome at each English support level. Guided tasks can include a sentence starter or a word bank. Independent tasks should ask students to produce their own wording.

- **258200**. Give students a short spoken model, a job for each partner and something specific to listen for. Keep diagrams or data tables visible when they are part of the task. If a listening activity needs a script, give it to the lecturer separately.
- **258201**. Provide a passage, a figure or values students can use as evidence. Preserve values, units, limits and source labels. The classroom subfolder in four lessons contains extra practice examples. The catalase dataset is simulated. Keep the separate lecturer key with the instructor.
- **258202**. Give students a reason to speak, an audience, a time limit and a question or feedback task for listeners. Keep short practice talks and formal assessed presentations aligned with the weekly plan.
- **Grammar Booster**. Model a pattern in a short biology sentence. Ask students to use it in a new example and explain their choice.

For a lesson plan, provide a learning goal, a worked example, timed activities, student instructions, a check for understanding and lecturer notes. For a worksheet or exam, prepare a student paper and a separate key or rubric. For alternate forms, keep the same outcome, question types, time and total marks and vary the examples. Label original practice data and source records as simulated. For tasks requiring an actual published paper or official test, use lecturer-approved material. Never invent a citation or label practice questions as official exam items.

## Use the studio format
For import or file generation, copy the structure of sample.json into material.json. Preserve version 1, the existing course and lesson ID, and use Exercise, Exam or Slides for type, Guided or Independent for level, and A or B for form. Use whole numbers for minutes and marks. Keep 1–20 items and 1–25 content slides. Each item needs prompt, answer, hint and marks; each slide needs title and body (an array of short strings). Leave hints empty for independent work. Keep answer keys out of student content. The renderer adds the cover slide. Verify totals, units, and that each question can be answered with its supplied material. Lesson plans and rubrics can be additional files or text in the requested format.

In an extracted full kit, place the new JSON beside the matching original.pptx and lesson.json. From that lesson folder run `node ../../render.cjs material.json` with Node 18 or newer. In a single-lesson pack use `node render.cjs material.json`. The renderer writes student.docx, teacher.docx and slides.pptx in output/. Return the requested files and JSON. For a new deck that needs an editable diagram or chart, keep the corresponding native objects from teaching.pptx or add matching visuals. The generic renderer makes editable text slides from the JSON. If execution is unavailable, return the JSON for the lecturer to import and export in the studio. Keep the existing EDOS design and credit Dr Yash Munnalal Gupta.
