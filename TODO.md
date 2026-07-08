# AlumniConnect - TODO List

## Immediate Tasks
- [ ] **Socket.IO Integration:** Implement real-time messaging using Socket.IO (Server & Client).
- [ ] **File Uploads:** Replace media URL simulation with actual file uploads (AWS S3 or Local Storage).
- [ ] **Server Settings:** Feature to change server description, name, or graduation year (Owner only).
- [ ] **Edit/Delete Archive:** Implement edit and delete functionality for Contacts and Memories (Admin Code required).

## Features & Improvements
- [ ] **Profile Page:** Allow users to update their full name and profile picture.
- [ ] **Notifications:** Real-time notifications for new chat messages.
- [ ] **Search Optimization:** Add debounce to search inputs in Contacts.
- [ ] **UI Polish:** 
    - Add skeleton loaders for better UX during data fetching.
    - Improve mobile responsiveness for the Chat layout.
    - Add "Copy Server ID" button in Dashboard.

## Technical Debt / Cleanup
- [ ] **Service Layer:** Move database logic from API routes to dedicated service files in `src/features/[feature]/services/`.
- [ ] **Testing:** Add unit tests for Auth logic and integration tests for API routes.
- [ ] **Logging:** Implement a formal logging system (e.g., Winston or Pino).

## Future Scalability
- [ ] **Events Feature:** Create and manage alumni reunion events.
- [ ] **Polls:** Simple polling system for alumni decisions.
- [ ] **Private Messaging:** Direct messages between alumni.
