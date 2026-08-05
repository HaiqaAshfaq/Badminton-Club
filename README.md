# 🏸 Badminton Club Management System

## Project Brief

The Badminton Club Management System is a modern web application designed to simplify the administration of badminton clubs. It enables club administrators to manage members, attendance, monthly payments, fines, reports, and financial records from a single dashboard. The project was created to replace manual record-keeping with a faster, more organized, and user-friendly solution.

---

## Live Demo

**Live Website:** https://badminton-club-cyan.vercel.app/

---

## GitHub Repository

https://github.com/HaiqaAshfaq/Badminton-Club

---

## Features

- Member Management
- Attendance Tracking
- Monthly Payments
- Fine Management
- Financial Reports
- Dashboard Analytics
- Responsive Design
- Modern UI
- Error Handling
- Data Validation

---

## Tech Stack

Frontend

- React
- Vite
- JavaScript
- Context API
- CSS

Development Tools

- Git
- GitHub
- Vercel
- VS Code

---

## Folder Structure

src/
├── components/
├── pages/
├── context/
├── db/
├── utils/
├── assets/

public/

package.json

README.md

---

## Installation

Clone the repository

```bash
git clone <repository-url>
```

Go into the project

```bash
cd badminton-club
```

Install dependencies

```bash
npm install
```

Run locally

```bash
npm run dev
```

Open

```
http://localhost:5173
```

---

## Architecture Overview

### Components

Reusable UI components used throughout the application.

### Pages

Contains all application pages including Dashboard, Reports, Attendance, Payments, and Members.

### Context API

Handles global application state.

### Database

Stores application seed data.

### Utilities

Contains helper functions for calculations and formatting.

---

## AI Integration

This project currently does not integrate a live LLM API.

AI tools were used during development to:

- Debug complex React issues
- Improve UI/UX
- Refactor components
- Generate documentation
- Optimize code

Future versions will integrate an LLM to automatically:

- Generate monthly financial summaries
- Suggest payment reminders
- Produce attendance insights
- Create administrative reports

---

## Error Handling

The application handles:

- Invalid user input
- Missing data
- Empty reports
- Invalid payment entries

The interface always provides feedback instead of crashing.

---

## Testing

Testing includes:

- Component rendering
- Navigation
- Payment calculations

Future improvements include:

- Complete Vitest coverage
- End-to-end Cypress testing

---

## Performance

Performance optimizations include:

- Lazy rendering
- Efficient React state management
- Optimized assets
- Responsive layouts

Target Lighthouse Score:

- Performance 90+
- Accessibility 90+
- Best Practices 90+
- SEO 90+

---

## Accessibility

Implemented accessibility features include:

- Semantic HTML
- Keyboard navigation
- Proper headings
- Accessible buttons
- Color contrast improvements

---

## Deployment

Hosted on Vercel.

Deployment process:

1. Push to GitHub
2. Automatic Vercel deployment
3. Verify build
4. Test production site

Rollback strategy:

Redeploy any previous successful deployment from Vercel.

---

## Known Limitations

- No backend database
- Local storage only
- No authentication
- No notifications

---

## Future Improvements

- Firebase backend
- Authentication
- AI-generated reports
- Email notifications
- SMS reminders
- Mobile application
- Payment gateway integration

---

## Reflection

The most challenging part of this project was designing a dashboard that remained simple while handling multiple club management features. Managing state across different modules and ensuring a responsive user experience required several iterations.

Working on this project improved my React development skills, debugging abilities, and understanding of production-ready frontend development. If rebuilding the project, I would start with a backend API and automated testing from the beginning to improve scalability and maintainability.

---

## Author

Haiqa Ashfaq

Frontend Developer

FAST NUCES
