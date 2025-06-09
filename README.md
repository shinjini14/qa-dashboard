# QA Pipeline - Modern Quality Assurance Dashboard

A sleek, modern web application for managing video content quality assurance workflows with secure authentication and beautiful UI.

## 🚀 Features

- **Secure Authentication**: PostgreSQL-based user authentication with JWT tokens
- **Modern UI**: Sleek design inspired by modern dashboards with Material-UI
- **Protected Routes**: All routes are protected and require authentication
- **Two-Step QA Process**: Comprehensive quality review workflow with customizable checklists
- **Real-time Progress**: Visual progress tracking and auto-saving of checklist items
- **Video Comparison**: Side-by-side reference and QA video playback (YouTube + Google Drive)
- **Smart URL Handling**: Automatic conversion of Google Drive URLs for video playback
- **External Integrations**: Discord rich embeds and Trello card management
- **Report Generation**: Downloadable comprehensive reports with all QA details
- **Real-time Notifications**: Instant Discord and Trello updates upon QA completion
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🛠 Technology Stack

- **Frontend**: Next.js 13, React 18, Material-UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Material-UI with custom theme + CSS
- **External APIs**: Trello, Discord

## 📋 Prerequisites

- Node.js 16+
- PostgreSQL database
- npm or yarn

## 🔧 Installation & Setup

1. **Clone and navigate to the project**
   ```bash
   cd qa-pipeline
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   # Database Configuration
   DB_USER=your_db_user
   DB_HOST=your_db_host
   DB_NAME=your_db_name
   DB_PASS=your_db_password
   DB_PORT=5432

   # JWT Secret (change in production)
   JWT_SECRET=your-super-secret-jwt-key-change-in-production

   # Trello Integration
   TRELLO_DONE_LIST_ID=your_trello_list_id

   # Discord Integration
   DISCORD_WEBHOOK_URL=your_discord_webhook_url

   # Production Settings
   NODE_ENV=development
   QUIET_MODE=false
   ```

4. **Database Initialization**

   **Option A: Using the API endpoint (Recommended)**
   ```bash
   # Start the development server
   npm run dev

   # In another terminal, initialize the database
   curl -X POST http://localhost:3000/api/auth/init-db \
        -H "Content-Type: application/json" \
        -d "{}"
   ```

   **Option B: Manual SQL execution**
   Run the SQL script in `scripts/init-auth.sql` in your PostgreSQL database.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.



## 🎨 UI Features

- **Modern Dark Theme**: Sleek dark interface with #304ffe accent color
- **Animated Components**: Smooth transitions and hover effects
- **Card-based Layout**: Clean, organized interface inspired by modern dashboards
- **Responsive Design**: Optimized for all screen sizes
- **Glass Morphism**: Modern glass effects and gradients
- **Interactive Elements**: Hover states and smooth animations

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **HTTP-only Cookies**: Secure cookie storage
- **Route Protection**: All routes protected by middleware
- **Password Hashing**: bcrypt password hashing
- **Session Management**: Automatic token validation

## 📱 Application Flow

1. **Login**: Secure authentication with username/password
2. **Dashboard**: Modern welcome screen with account selection
3. **QA Step 1**: First review phase with checklist
4. **QA Step 2**: Second review phase with additional checks
5. **Report**: Final summary and submission
6. **Integration**: Automatic Trello and Discord updates

## 🚀 Production Deployment

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure production database
   - Set `QUIET_MODE=true` to disable seed endpoints

2. **Database Setup**
   - Run the initialization script
   - Create production users
   - Set up proper database permissions

3. **Security**
   - Use HTTPS in production
   - Set secure cookie flags
   - Implement rate limiting
   - Regular security updates

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/init-db` - Initialize database

### QA Management
- `GET /api/accounts` - Get active accounts
- `GET /api/qa/next` - Get next QA task
- `POST /api/qa/submit-step` - Submit step results (auto-saves progress)
- `POST /api/qa/complete` - Complete QA task and send notifications
- `GET /api/qa/download-report` - Download comprehensive QA report
- `POST /api/qa/seed-tasks` - Seed QA tasks (dev only)

### Notifications
- `POST /api/notifications/discord` - Send Discord notification
- `POST /api/notifications/trello` - Create/update Trello card

## 🎯 Customization

The application uses a modern design system that can be easily customized:

- **Colors**: Modify the theme in `pages/_app.js`
- **Components**: Update component styles in respective files
- **Layout**: Modify the main layout in `components/Layout.js`
- **Animations**: Customize animations in `styles/globals.css`

## 📄 License

This project is proprietary software for QA workflow management.

## 🤝 Support

For support and questions, please contact the development team.
