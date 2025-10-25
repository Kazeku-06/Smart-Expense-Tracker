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
- 🎨 **UI Modern** - Design clean dengan TailwindCSS

## 🆕 Fitur Export Terbaru

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

### 🎯 Cara Menggunakan Export:
1. Buka halaman **Transactions**
2. Atur filter tanggal (opsional)
3. Klik tombol **"Export PDF"** atau **"Export Excel"**
4. File akan otomatis terunduh

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite dengan SQLAlchemy ORM
- **Autentikasi**: JWT (Flask-JWT-Extended)
- **CORS**: Flask-CORS untuk komunikasi dengan frontend
- **Validation**: Werkzeug untuk password hashing
- **PDF Export**: ReportLab
- **Excel Export**: OpenPyXL

### Frontend
- **Framework**: React 18 dengan Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Chart.js dengan react-chartjs-2
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
- `user_id` (UUID) - Foreign Key to User
- `category_id` (UUID) - Foreign Key to Category
- `created_at` (DateTime) - Timestamp
- `updated_at` (DateTime) - Timestamp update

## 🎨 UI Components

### Halaman
- **Login** - Form login user
- **Register** - Form registrasi user baru  
- **Dashboard** - Ringkasan dan grafik pengeluaran
- **Transactions** - Manajemen transaksi + Export data

### Komponen
- **Navbar** - Navigasi utama
- **TransactionForm** - Form tambah/edit transaksi
- **ChartCard** - Komponen grafik pie chart
- **ExportButtons** - Tombol export PDF & Excel

## 🔧 Configuration

### Environment Variables (Backend)

Buat file `backend/.env`:

```env
JWT_SECRET_KEY=your-super-secret-jwt-key-here
DATABASE_URL=sqlite:///db.sqlite3
```

### Dependencies Baru untuk Export
```bash
# Pastikan dependencies ini terinstall
pip install reportlab==4.0.7 openpyxl==3.1.2
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

1. **Port already in use**
   ```bash
   # Change backend port
   python app.py --port 5001
   
   # Change frontend port
   npm run dev -- --port 5174
   ```

2. **CORS errors**
   - Pastikan backend berjalan di port 5000
   - Check Flask-CORS configuration di app.py

3. **Database errors**
   ```bash
   # Delete database dan buat ulang
   rm backend/db.sqlite3
   python backend/app.py
   ```

4. **Node modules error**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Export errors**
   ```bash
   # Pastikan dependencies export terinstall
   pip install reportlab openpyxl
   
   # Restart backend server
   python app.py
   ```

## 📱 Usage Guide

### 1. Registrasi User Baru
- Buka http://localhost:5173/register
- Isi form registrasi
- Sistem akan auto-login setelah registrasi

### 2. Tambah Transaksi
- Klik "Tambah Transaksi" di halaman Transactions
- Isi amount, deskripsi, pilih kategori dan tanggal
- Simpan transaksi

### 3. Lihat Dashboard  
- Buka halaman Dashboard
- Lihat grafik pengeluaran per kategori
- Filter berdasarkan bulan

### 4. Export Data
- Buka halaman Transactions
- Atur filter tanggal (opsional)
- Klik "Export PDF" atau "Export Excel"
- File akan otomatis terunduh

### 5. Kelola Kategori
- Default kategori sudah dibuat otomatis
- Bisa tambah kategori custom di halaman Transactions

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

---

**⭐ Jangan lupa kasih star jika project ini membantu!**

---

<div align="center">

**Happy Coding!** 🚀

</div>