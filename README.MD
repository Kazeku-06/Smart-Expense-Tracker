# 🧾 Smart Expense Tracker

Aplikasi pencatat keuangan pribadi berbasis Flask (Python) dan React (TailwindCSS). 
Dibuat dengan arsitektur modern untuk memudahkan pengelolaan pengeluaran pribadi.

![Smart Expense Tracker](https://img.shields.io/badge/Status-Ready%20to%20Use-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Fitur Utama

- 🔐 **Autentikasi Aman** - Register & Login dengan JWT
- 💰 **Manajemen Transaksi** - CRUD lengkap untuk transaksi pengeluaran
- 📊 **Dashboard Interaktif** - Grafik pie chart untuk visualisasi pengeluaran
- 🏷️ **Kategori Custom** - Kelola kategori pengeluaran sesuai kebutuhan
- 📱 **Responsive Design** - Tampilan optimal di desktop dan mobile
- 🔍 **Filter Data** - Filter transaksi berdasarkan kategori dan bulan
- 📈 **Ringkasan Bulanan** - Laporan pengeluaran per bulan
- 📤 **Export Data** - Export ke PDF dan Excel dengan filter tanggal
- 💸 **Budget Tracking** - Notifikasi saat pengeluaran mendekati batas budget
- 🌍 **Multi-Currency** - Support berbagai mata uang (IDR, USD, EUR, dll.)
- 🎨 **UI Modern** - Design clean dengan TailwindCSS

## 🆕 Fitur Terbaru

### 💰 Budget Limit Notifications
- Atur budget limit bulanan
- Progress bar visual di dashboard
- Notifikasi real-time saat pengeluaran mendekati/melampaui budget
- Toast notifications saat membuat transaksi baru

### 🌍 Multi-Currency Support
- Support 10+ mata uang (IDR, USD, EUR, GBP, JPY, SGD, MYR, AUD, CAD, CHF)
- Pilih mata uang saat membuat transaksi
- Konversi otomatis ke base currency user
- Format currency yang sesuai dengan locale
- Tampilan simbol mata uang yang benar

### 📄 Export ke PDF
- Generate laporan PDF profesional dengan ReportLab
- Layout tabel yang rapi dan mudah dibaca
- Include summary total pengeluaran
- Filter berdasarkan rentang tanggal

### 📊 Export ke Excel  
- Export data ke spreadsheet Excel dengan OpenPyXL
- Format kolom otomatis disesuaikan
- Header dengan styling profesional
- Mudah untuk analisa data lebih lanjut

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite dengan SQLAlchemy ORM
- **Autentikasi**: JWT (Flask-JWT-Extended)
- **CORS**: Flask-CORS untuk komunikasi dengan frontend
- **Validation**: Werkzeug untuk password hashing
- **PDF Export**: ReportLab
- **Excel Export**: OpenPyXL
- **Currency API**: Frankfurter.app (free exchange rates)

### Frontend
- **Framework**: React 18 dengan Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Chart.js dengan react-chartjs-2
- **Notifications**: React Hot Toast
- **Icons**: SVG dan emoji

## 📦 Installation

### Prerequisites
- Python 3.8 atau lebih tinggi
- Node.js 16 atau lebih tinggi
- npm atau yarn

### 1. Clone Repository
```bash
git clone https://github.com/Kazeku-06/Smart-Expense-Tracker.git
cd smart-expense-tracker
```

### 2. Setup Backend

```bash
# Masuk ke directory backend
cd backend

# Buat virtual environment (recommended)
python -m venv venv

# Aktifkan virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env

# Generate JWT secret key
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))" >> .env

# Jalankan backend server
python app.py
```

Backend akan berjalan di **http://localhost:5000**

### 3. Setup Frontend

```bash
# Buka terminal baru, masuk ke directory frontend
cd frontend

# Install dependencies
npm install

# Setup TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Jalankan development server
npm run dev
```

Frontend akan berjalan di **http://localhost:5173**

## 🚀 Quick Start

Untuk yang ingin langsung menjalankan tanpa setup manual:

```bash
# Backend (Terminal 1)
cd backend 
pip install -r requirements.txt
python app.py

# Frontend (Terminal 2) 
cd frontend
npm install
npm run dev
```

Kemudian buka http://localhost:5173 di browser.

## 📚 API Documentation

### Autentikasi
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/register` | Registrasi user baru |
| `POST` | `/api/login` | Login user |
| `GET` | `/api/profile` | Get profil user (JWT required) |

### Transaksi
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transactions` | Get semua transaksi user |
| `POST` | `/api/transactions` | Buat transaksi baru |
| `PUT` | `/api/transactions/:id` | Update transaksi |
| `DELETE` | `/api/transactions/:id` | Hapus transaksi |
| `GET` | `/api/transactions/summary` | Ringkasan pengeluaran |

### Kategori
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories` | Get semua kategori user |
| `POST` | `/api/categories` | Buat kategori baru |
| `PUT` | `/api/categories/:id` | Update kategori |
| `DELETE` | `/api/categories/:id` | Hapus kategori |

### 💰 Budget & Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications/budget-check` | Cek status budget |
| `PUT` | `/api/notifications/budget-limit` | Set budget limit |
| `GET` | `/api/notifications` | Get notifikasi |

### 🌍 Currency
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/currency/supported` | Daftar mata uang yang didukung |
| `GET` | `/api/currency/exchange-rate` | Dapatkan exchange rate |
| `PUT` | `/api/currency/base-currency` | Set base currency user |
| `POST` | `/api/currency/convert` | Konversi amount |

### 📤 Export Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/export/pdf` | Export data ke PDF |
| `GET` | `/api/export/excel` | Export data ke Excel |

**Parameters Export (optional):**
- `start_date` - Tanggal mulai (format: YYYY-MM-DD)
- `end_date` - Tanggal selesai (format: YYYY-MM-DD)

## 🗃️ Database Models

### User
- `id` (UUID) - Primary Key
- `username` (String) - Unique username
- `email` (String) - Unique email
- `password_hash` (String) - Hashed password
- `budget_limit` (Float) - Budget limit bulanan
- `base_currency` (String) - Mata uang utama user
- `created_at` (DateTime) - Timestamp

### Category
- `id` (UUID) - Primary Key  
- `name` (String) - Nama kategori
- `description` (Text) - Deskripsi kategori
- `color` (String) - Warna kategori (hex)
- `user_id` (UUID) - Foreign Key to User
- `created_at` (DateTime) - Timestamp

### Transaction
- `id` (UUID) - Primary Key
- `amount` (Float) - Jumlah transaksi
- `description` (String) - Deskripsi transaksi
- `date` (DateTime) - Tanggal transaksi
- `currency` (String) - Mata uang transaksi
- `exchange_rate` (Float) - Nilai tukar ke base currency
- `user_id` (UUID) - Foreign Key to User
- `category_id` (UUID) - Foreign Key to Category
- `created_at` (DateTime) - Timestamp
- `updated_at` (DateTime) - Timestamp update

### BudgetNotification
- `id` (UUID) - Primary Key
- `user_id` (UUID) - Foreign Key to User
- `message` (Text) - Pesan notifikasi
- `type` (String) - Tipe notifikasi (warning, danger, info)
- `is_read` (Boolean) - Status baca
- `created_at` (DateTime) - Timestamp

## 🎨 UI Components

### Halaman
- **Login** - Form login user
- **Register** - Form registrasi user baru  
- **Dashboard** - Ringkasan dan grafik pengeluaran + Budget tracking
- **Transactions** - Manajemen transaksi + Export data

### Komponen
- **Navbar** - Navigasi utama
- **TransactionForm** - Form tambah/edit transaksi dengan currency selector
- **ChartCard** - Komponen grafik pie chart
- **ExportButtons** - Tombol export PDF & Excel
- **BudgetAlert** - Komponen tracking budget dengan progress bar
- **CurrencySelector** - Dropdown pilihan mata uang

## 🔧 Configuration

### Environment Variables (Backend)

Buat file `backend/.env`:

```env
JWT_SECRET_KEY=your-super-secret-jwt-key-here
DATABASE_URL=sqlite:///db.sqlite3
```

### Dependencies Lengkap

**Backend:**
```bash
pip install flask flask-sqlalchemy flask-cors flask-jwt-extended python-dotenv werkzeug reportlab openpyxl requests
```

**Frontend:**
```bash
npm install react react-dom react-router-dom axios chart.js react-chartjs-2 react-hot-toast
npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-react vite
```

### Development Scripts (Frontend)

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint checking
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Migration Error**
   ```bash
   # Hapus database lama dan buat baru
   cd backend
   del db.sqlite3  # Windows
   # atau rm db.sqlite3  # Linux/Mac
   python app.py
   ```

2. **Port already in use**
   ```bash
   # Change backend port
   python app.py --port 5001
   
   # Change frontend port
   npm run dev -- --port 5174
   ```

3. **CORS errors**
   - Pastikan backend berjalan di port 5000
   - Check Flask-CORS configuration di app.py

4. **Node modules error**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Currency API errors**
   - Aplikasi menggunakan Frankfurter.app (free)
   - Jika API down, akan fallback ke rate 1.0
   - Cache exchange rates selama 1 jam

## 📱 Usage Guide

### 1. Registrasi User Baru
- Buka http://localhost:5173/register
- Isi form registrasi
- Sistem akan auto-login setelah registrasi

### 2. Atur Budget & Currency
- Buka Dashboard
- Klik "Atur Budget" untuk set budget bulanan
- Sistem akan otomatis memberi notifikasi

### 3. Tambah Transaksi
- Klik "Tambah Transaksi" di halaman Transactions
- Isi amount, deskripsi, pilih kategori, mata uang, dan tanggal
- Simpan transaksi - sistem akan beri notifikasi budget jika perlu

### 4. Lihat Dashboard  
- Buka halaman Dashboard
- Lihat grafik pengeluaran per kategori
- Monitor progress budget dengan progress bar
- Filter berdasarkan bulan

### 5. Export Data
- Buka halaman Transactions
- Atur filter tanggal (opsional)
- Klik "Export PDF" atau "Export Excel"
- File akan otomatis terunduh

### 6. Kelola Kategori
- Default kategori sudah dibuat otomatis
- Bisa tambah kategori custom di halaman Transactions

## 🎯 Fitur Keamanan

- **Password Hashing** - Menggunakan Werkzeug security
- **JWT Tokens** - Autentikasi stateless yang aman
- **CORS Protection** - Konfigurasi domain yang diizinkan
- **Input Validation** - Validasi di backend dan frontend
- **SQL Injection Protection** - Menggunakan SQLAlchemy ORM

## 🚀 Deployment

### Backend (Production)
```bash
# Gunakan production WSGI server
pip install gunicorn
gunicorn app:create_app() -w 4 -b 0.0.0.0:5000
```

### Frontend (Production)
```bash
npm run build
# Serve folder 'dist' dengan Nginx/Apache
```

### Environment Production
```env
JWT_SECRET_KEY=your-production-secret-key
DATABASE_URL=your-production-database-url
FLASK_ENV=production
DEBUG=False
```

## 🤝 Contributing

Kontribusi sangat diterima! Ikuti langkah berikut:

1. Fork project ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)  
5. Buat Pull Request

### Development Guidelines
- Follow PEP 8 untuk Python code
- Use ESLint untuk JavaScript/React code
- Test semua endpoint API
- Update documentation sesuai perubahan

## 📋 Changelog

### v1.2.0 - Budget & Multi-Currency
- ✅ Budget limit tracking dengan notifikasi
- ✅ Multi-currency support (10+ mata uang)
- ✅ Real-time exchange rates
- ✅ Currency conversion otomatis
- ✅ Progress bar visual di dashboard

### v1.1.0 - Export Feature
- ✅ Export data ke PDF dengan ReportLab
- ✅ Export data ke Excel dengan OpenPyXL  
- ✅ Filter export berdasarkan tanggal
- ✅ Loading indicators dan error handling
- ✅ Auto-download file

### v1.0.0 - Initial Release
- ✅ Authentication system dengan JWT
- ✅ CRUD transactions & categories
- ✅ Dashboard dengan grafik pie chart
- ✅ Responsive design dengan TailwindCSS

## 🐛 Bug Reports

Jika menemukan bug, silakan buat issue dengan template berikut:

```markdown
## Bug Description
[Deskripsi bug yang jelas]

## Steps to Reproduce
1. [Langkah 1]
2. [Langkah 2] 
3. [Langkah 3]

## Expected Behavior
[Apa yang diharapkan terjadi]

## Actual Behavior
[Apa yang sebenarnya terjadi]

## Environment
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Backend Version: [commit hash atau version]
- Frontend Version: [commit hash atau version]
```

## 📄 License

Distributed under MIT License. See `LICENSE` file untuk detail lengkap.

## 👨‍💻 Developer

Dibuat dengan ❤️ oleh [nopalll](https://github.com/Kazeku-06)

**Contact**: 
- Email: tssytari@gmail.com
- GitHub: [Kazeku-06](https://github.com/Kazeku-06)

## 🙏 Acknowledgments

- Flask community untuk framework yang powerful
- React team untuk library frontend yang amazing  
- TailwindCSS untuk utility-first CSS framework
- Chart.js untuk visualisasi data yang interaktif
- ReportLab & OpenPyXL untuk fitur export data
- Frankfurter.app untuk free exchange rates API
- React Hot Toast untuk notifikasi yang elegant

---

**⭐ Jangan lupa kasih star jika project ini membantu!**

---

<div align="center">

**Happy Coding!** 🚀

</div>