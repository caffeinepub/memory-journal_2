# Memory Journal

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Home / Feed: book-spread card layout browsing all memory entries (title, date, location, photos, narrative excerpt)
- Add Memory form: title, date picker, location input, multi-photo upload, rich text narrative
- Archive view: memories grouped by Date (year/month timeline) or Place (location grouping), switchable
- On This Day: highlights memories from the same calendar day in prior years
- Memory Detail View: immersive full-page with photo gallery/slideshow and full narrative
- Search: filter memories by title, place, or date string
- Management Panel: inline edit and delete for all entries
- Sample seed memories pre-loaded so app looks populated on first launch

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan

### Backend (Motoko)
- MemoryEntry type: id, title, date (text), location, photoIds (blob IDs), narrative, createdAt
- CRUD: createMemory, getMemories, getMemory, updateMemory, deleteMemory
- Query: searchMemories (by title/place/date substring), getOnThisDay (match month+day across years), getByLocation, getByDate
- Seed: insert ~6 sample memories at deploy time if store is empty

### Components
- blob-storage: for multi-photo upload and retrieval
- authorization: to protect management/edit/delete operations

### Frontend
- Pages: Home (feed + On This Day), Archive (date/place grouping), Detail, Search results, Add/Edit form, Management panel
- Warm parchment aesthetic: #F3EBDD bg, serif headings, warm brown accents #8B6A4A
- Book-spread card layout on home feed
- Photo carousel in detail view
- Responsive layout
