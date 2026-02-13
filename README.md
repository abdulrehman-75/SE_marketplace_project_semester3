# Marketplace Application

## 📝 Project Description
A full-stack marketplace application built with React (Vite) and ASP.NET Core Web API.

## 👥 Roles
- Customer
- Seller
- Admin
- Delivery Staff
- Support Staff
- Inventory Manager

## 🛠️ Technology Stack

### Frontend
- React 18 with Vite
- React Router DOM
- Tailwind CSS
- Axios
- React Hook Form + Zod

### Backend
- ASP.NET Core 8.0 Web API
- Entity Framework Core
- PostgreSQL Database
- JWT Authentication
- Cloudinary (Image Upload)
- Email Service

---

## 📦 Installation & Setup

### Prerequisites
1. **.NET 8.0 SDK**: https://dotnet.microsoft.com/download/dotnet/8.0
2. **Node.js 18+**: https://nodejs.org/
3. **PostgreSQL 14+**: https://www.postgresql.org/download/
4. **Visual Studio 2022 or VS Code**

---

## 🚀 Backend Setup

### Step 1: Open Backend in Visual Studio
1. Navigate to `MarketPlace` folder
2. Double-click `MarketPlace.sln`
3. Wait for Visual Studio to load

### Step 2: Update Database Connection String
Open `appsettings.json` and update:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=MarketplaceDB;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

### Step 3: Update Configuration Settings
In `appsettings.json`, configure:
- **JWT Settings**: Update secret key
- **Email Settings**: Configure SMTP (Gmail/Outlook)
- **Cloudinary**: Add your credentials (optional for images)

### Step 4: Restore Packages & Apply Migrations
Open **Package Manager Console** in Visual Studio:
```bash
# Restore NuGet packages
dotnet restore

# Apply database migrations
Update-Database
```

Or using Command Prompt:
```bash
cd MarketPlace
dotnet restore
dotnet ef database update
```

### Step 5: Run Backend
Press **F5** in Visual Studio or:
```bash
dotnet run
```

Backend will start at: `https://localhost:7xxx` or `http://localhost:5xxx`

---

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Folder
```bash
cd "FrontEnd\marketplace-frontend"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure API Base URL
Create `.env` file in `marketplace-frontend` root:
```env
VITE_API_BASE_URL=https://localhost:7xxx
```
Replace `7xxx` with your actual backend port.

### Step 4: Run Frontend
```bash
npm run dev
```

Frontend will start at: `http://localhost:5173`

---

## 🧪 Testing the Application

### Test Accounts
After running migrations, test with:
- **Email**: test@example.com
- **Password**: Test@123

Or register new accounts through the UI.

### Available Routes
- `/login` - Login page
- `/register/customer` - Customer registration
- `/register/seller` - Seller registration
- `/forgot-password` - Password recovery
- `/reset-password` - Password reset

---

## 📂 Project Structure

### Backend Structure
MarketPlace/
├── Controllers/        # API endpoints
├── Models/            # Entity models & DTOs
├── Services/          # Business logic
├── Data/              # DbContext & migrations
├── Configuration/     # App settings
├── Extensions/        # Service extensions
├── Helpers/           # Utility classes
└── Program.cs         # Entry point

### Frontend Structure
marketplace-frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── context/       # React Context
│   ├── hooks/         # Custom hooks
│   ├── routes/        # Routing configuration
│   ├── utils/         # Utilities & validators
│   └── layouts/       # Layout components
└── public/            # Static assets

---

## 🔧 Troubleshooting

### Backend Issues
1. **Port already in use**: Change port in `launchSettings.json`
2. **Database connection failed**: Check PostgreSQL is running
3. **Migration failed**: Delete migrations folder and recreate

### Frontend Issues
1. **Module not found**: Run `npm install` again
2. **API connection failed**: Check `.env` file has correct backend URL
3. **CORS error**: Ensure backend CORS is configured for `http://localhost:5173`

---

## 📧 Contact
Student Name: [AbdulRehman Nseem, Ali Shahzad, Saifullah Chaudhary]
Student ID: [2024-cs-743, 2024-cs-732, 2024-cs-739]
Course: [Software Engineering]