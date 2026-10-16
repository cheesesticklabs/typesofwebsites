# Cheesestick Labs — reusable lesson-lab preview

Open `index.html` in a browser. No build or installation is required. Keep the four source files together. The separate single-file preview also works by itself.

## Try the lesson

The six-page sample is a demonstration of the teaching structure, rather than your first actual lesson:

Do Now → Routes → Routers → Build & test → Exit Ticket → Submit.

Teacher-paced mode uses Wizard of Oz trivia checkpoints. After class, share the configured master password so students can unlock the full lab for independent work. There is no pacing selector.

The Routes page has a live slider. The Routers page has a message animation, a connection toggle, and pause/resume. The independent lab accepts drag-and-drop stops, with tap/click as an alternative, animates valid paths, and keeps test evidence beside the activity.

## Customize a lesson

Edit `lesson.js`. Branding, bilingual lesson text, questions, terms, page names, trivia prompts, accepted answers, master answers, optional extension, slide links, and Firebase settings live there. The sample interactions are implemented in `app.js`; swap or add activity renderers there for new topics. `styles.css` contains the shared design system.

Give each new lesson a unique `id`; this keeps browser drafts separate. Keep question IDs stable when editing an existing lesson so answers remain associated correctly. Set `extensionEnabled: true` to include the Extension page. Add a direct slide URL under `slides`, keyed by page ID, to display its supporting-slide button. Optional Learn more sections are already included on the topic pages.

Text pairs are `[English, Spanish]`. Vocabulary entries are explicitly marked in lesson text as `<b data-term="route">route</b>` and listed in each page’s `vocab` array. The drawer accumulates terms from visited pages and stays available at the right edge while scrolling.

## Saving and submission

Drafts save locally while typing and on navigation, tab hiding, and page exit. Recovery uses the same browser, device, and address. Theme, language, teacher unlocks, responses, and activity state are restored. Draft saving never submits work.

Firebase is deliberately unconfigured in this preview. Add your own Firebase web app config to `firebase` and set the Firestore `collection` you have authorized for classroom submissions. The template loads Firebase only when submitting. Check your project's access rules before classroom use. It writes one document per draft with a stable ID so a retry updates the same record instead of making a duplicate. A confirmation ID appears only after Firestore acknowledges the write. Existing Firebase projects from reference ZIPs were not modified or contacted.

Download Answers works without Firebase. Print / Save PDF produces completed responses; Help includes a blank printable worksheet. The print view is a question worksheet with static activity context, not an interactive replica.

Checkpoints are pacing controls, not account authentication. Accepted answers and the master answer live in the client-side configuration. Teacher answer guidance is supplied separately from the student site.

## Preview limits

No slideshow has been created yet. Supporting-slide links appear when configured. The optional extension is disabled by default. Firebase success/failure handling is implemented, but live Firebase submission is unverified until a project and rules are configured. No student records are sent anywhere in this preview.

© Robert Pino • robertpino.com
