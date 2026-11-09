# Web-Based LGU Student Assistance Management System - San Jose, Dinagat Islands

## Run it

1. Create the database in MySQL:  `CREATE DATABASE lgu_student_assistance;`
2. Open `server/config/config.json` and set your MySQL `password` (development).
3. Server:
   ```
   cd server
   npm install
   npm start            # http://localhost:3006  (tables are created automatically)
   npm run seed         # in another terminal: admin account, schools, requirements
   npm run seed:sample  # same as above + sample students/applications/records
   ```
4. Client:
   ```
   cd client
   npm install
   npm run dev
   ```
5. Login with `admin` / `admin123` and change the password in the Users page.

## API (all start with /api)

| Path | Used by |
|---|---|
| /auth/login | Login page |
| /dashboard/stats, /dashboard/recent | Dashboard |
| /school, /student, /application, /requirement, /assistance-record, /user | CRUD pages (GET /, GET /:id, POST /new, PUT /:id, DELETE /:id) |
| /application-requirement?application_id= | Requirements checklist inside an application |
| /report?academic_year= | Reports page |


## Student portal updates
- The login screen now includes **Register as Student**. Registration creates a Student role on the server; visitors cannot choose or promote their own role.
- Student accounts are redirected to a limited portal showing posted requirements and assistance release dates only.
- The admin sidebar now contains Dashboard, Applications, Requirements, Assistance Records, and Reports. Students, Schools, and Users management pages are no longer routed or displayed.
- Existing admin login and database records are retained. No database schema migration is required.


## Updates: student requirement submissions and cash assistance release information

1. Before starting the updated server on an existing database, run the SQL in `server/migrations/2026_add_student_submissions_and_release_location.sql` once. This adds the cash assistance release location and instruction columns. Sequelize creates the new `StudentSubmissions` table automatically on startup.
2. Student accounts now have a Student Portal module where they can upload PDF, JPG, or PNG requirements (maximum 5 MB), view their submission status, and see posted cash assistance release dates, locations, and instructions.
3. Admin accounts have a Requirement Submissions module to download documents and mark them Accepted, Denied, or Needs Revision with remarks.
4. Admins can accept or deny applications directly from the Applications table.
5. Cash assistance release locations and instructions are entered in the Assistance Records form and displayed in the student portal.
6. The Dashboard no longer displays the Released Assistance statistic.

## Requirement submission review workflow

- Students continue to submit documents from **Student Portal → Submit Requirements**.
- Admins review incoming student accounts and uploaded documents inside **Applications → Students Who Submitted Requirements**.
- Select a student account to preview PDF, JPG, and PNG files inside the application without downloading them.
- When creating or editing an application, select the student's registered login account in **Student Login Account**. This links the uploaded documents to that application record.
- The separate admin **Requirement Submissions** navigation module has been removed. Application approval/denial remains in the Applications list.


## Application acceptance and denial
- In **Admin → Applications**, pending and under-review applications display **Accept** and **Deny** actions.
- Each action asks the administrator to confirm before saving.
- Decisions are saved through `PATCH /api/application/:id/decision` and update only the application status.
- Approved, Denied, and Rejected applications are treated as final and no longer show decision buttons.

## Requirement deadlines and cash assistance workflow

- Admins can set a submission deadline when creating or editing each requirement.
- Student uploads are blocked by the API after the deadline (not only hidden in the UI).
- The Applications page shows applicants in “Applicants Ready for Cash Assistance” only when every currently posted requirement has an Accepted submission.
- Admins can post the approved amount, release date, location, and instructions from that eligible-applicant list.
- The student portal displays the posted release date and amount.
- In Assistance Records, the admin uses “Mark Received” only after the student physically receives the money. The system records the receipt date.

The server uses Sequelize `sync({ alter: true })`, so the new nullable `Requirement.deadline` field is added when the backend starts. Back up the database before deploying schema changes.
