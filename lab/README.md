# Website Purpose lab source

This directory is the current modular version of Why Websites Exist / How Design Demonstrates Purpose.

- `index.html`: header, navigation, dialogs, and script loading.
- `lesson.js`: bilingual lesson content, checkpoints, page order, and navigation groups.
- `app.js`: page rendering, local drafts, glossary, printing, downloads, and optional submission integration.
- `purpose.js`: lesson activities, share-out gallery, and evidence export.
- `annotation-archive.js`: freezes original site documents, viewport dimensions, annotation geometry, and lossless PNG captures; prepares atomic Firestore snapshot records.
- `annotator.js` / `annotator.css`: DOM annotation workspace, highlights, arrows, connections, movable endpoints, pins, and comments.
- `fix-site.js` / `fix-site.css`: Do Now design activity and Purpose overview styles.
- `styles.css`: lab styles and current navigation grouping.
- `assets/`: supplied Cheesestick Labs logo and proportionally resized dog photo.

Run `python build-portable.py` from the extracted package root after editing these files. The standalone HTML embeds assets and runs without a server. Firebase client configuration is set for learnball-25d68; submissions target lesson_submissions. Teacher notes and passwords are documented outside this directory in the package root.
