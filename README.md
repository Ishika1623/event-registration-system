# Campus Event Registration & Management System

A web-based prototype for managing and registering for college and university campus events, built with HTML, CSS, and JavaScript.

## Features

- **Event Discovery & Filtering:** Browse upcoming events by category (Fests, Workshops, Sports Meets, Seminars) with real-time seat availability tracking.
- **Student Registration & QR Ticketing:** Simple registration flow generating printable event tickets with dynamic QR codes.
- **Event Feedback & Rating System:** Students can rate events (1–5 stars) and submit suggestions. Real-time average rating badges on event cards and detail pages, plus admin management to review, filter, delete, and export feedback to CSV.
- **Organizer Portal:** Submit new event proposals for admin review, track submission status, and export event request JSONs.
- **Admin Dashboard:** PIN-protected administrative panel to approve/reject event requests, verify registrations, mark attendance, and export attendee lists to CSV.
- **Calendar Integration:** One-click `.ics` calendar event generation to easily add events to Google Calendar, Apple Calendar, or Outlook.

## File Structure

- `index.html` / `lpu-event-system.html` - Main single-page application
- `script.js` - Logic for auth, event catalog, tickets, and local storage state
- `style.css` - Responsive layout and styling
- `README.md` - Documentation and setup guide

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Ishika1623/event-registration-system.git
   ```
2. Open `index.html` directly in any web browser.

## Demo Credentials & Access PINs

- **Student:** Select "Student" and log in with your Name, Registration No., and Roll No.
- **Organizer PIN:** `2222`
- **Admin PIN:** `1234`
