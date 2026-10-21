# 🚀 Tự Học Typing Web (Next.js + 3D Arcade + Google Sheets)

Nền tảng Web luyện gõ 10 ngón tiếng Việt được chuyển đổi từ phần mềm **Tự Học Typing Desktop (v3.1.0)**, sẵn sàng 100% để triển khai lên **Vercel** và lưu bảng xếp hạng qua **Google Sheets**.

---

## 🌟 Tính Năng Nổi Bật

1. **Kho Bài Học Đồ Sộ (81 Bài học & 414 Bài tập)**:
   - Toàn bộ dữ liệu bài học đã được giải mã và cấu trúc hóa chuẩn JSON trong thư mục `src/data/`.
   - Lộ trình bài học chuẩn từ hàng phím cơ sở (Home row `asdf jkl;`), phím trên, phím dưới, số, ký tự đặc biệt đến văn bản tiếng Việt có dấu.
2. **Khu Trò Chơi 3D Arcade Độc Đáo**:
   - Toàn bộ các trò chơi 3D WebGL / Three.js và mô hình 3D (`.glb`) được đưa trực tiếp vào thư mục `public/arcade/`:
     - **Quyết Đấu 3D** (`/arcade/quyetdau.html`)
     - **Chiến Dịch Diệt Bug** (`/arcade/index.html`)
     - **Nấu Phở Gia Truyền** (`/arcade/pho.html`)
     - **Cyber Runner 3D** (`/arcade/runner.html`)
     - **Rhythm Beat** (`/arcade/rhythm.html`)
     - Cùng các mini-game: `orbit`, `echo`, `signal`, `memory`,...
3. **Bàn Phím Ảo Thông Minh (Virtual Keyboard)**:
   - Giao diện trực quan theo chuẩn vị trí 10 ngón tay với màu sắc phân biệt rõ từng ngón (ngón út, áp út, ngón giữa, ngón trỏ, ngón cái).
   - Tự động highlight phím và ngón tay cần nhấn theo thời gian thực.
4. **Bảng Xếp Hạng Kết Nối Google Sheets (Leaderboard)**:
   - Tự động ghi nhận: Tên người chơi, Tốc độ (WPM), Độ chính xác (%), Thời gian gõ, Ngày giờ.
   - Sử dụng Google Apps Script làm webhook hoàn toàn miễn phí, quản lý điểm trực tiếp trên file Google Sheet mà không cần trang Admin.
   - Có sẵn bộ nhớ dự phòng (Mock/Fallback) nếu chưa cấu hình Google Sheet.
5. **Hiệu Ứng Âm Thanh & Pháo Hoa**:
   - Âm thanh gõ phím chân thực (`click.wav`), âm thanh báo lỗi (`buzz.wav`).
   - Hiệu ứng pháo hoa chúc mừng khi hoàn thành bài gõ.

---

## 📁 Cấu Trúc Dự Án

```text
├── google-apps-script.js     # Mã nguồn Google Apps Script (Copy dán vào Google Sheets)
├── public/
│   ├── arcade/               # 10+ Game 3D WebGL / Three.js & Models (.glb)
│   └── sounds/               # Âm thanh gõ phím (click.wav, buzz.wav)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── drill/        # API tải nội dung bài tập theo yêu cầu
│   │   │   └── leaderboard/  # API nhận & trả về bảng xếp hạng (Google Sheets)
│   │   ├── globals.css       # Tailwind & custom dark theme styling
│   │   ├── layout.tsx
│   │   └── page.tsx          # Trang chủ ứng dụng
│   ├── components/
│   │   ├── ArcadeView.tsx    # Khu trò chơi 3D
│   │   ├── LeaderboardView.tsx # Giao diện bảng xếp hạng
│   │   ├── LessonSelector.tsx  # Bộ chọn 81 bài học & 414 bài tập
│   │   ├── Navbar.tsx        # Thanh điều hướng trên cùng
│   │   ├── SheetsGuideView.tsx # Hướng dẫn cài đặt Google Sheets trực quan
│   │   ├── TypingArea.tsx    # Bộ điều khiển luyện gõ chính (WPM, Accuracy, HUD)
│   │   └── VirtualKeyboard.tsx # Bàn phím ảo mô phỏng ngón tay
│   ├── data/
│   │   ├── lessons.json      # Danh mục 81 bài học
│   │   └── drills/           # 414 bài tập JSON chi tiết
│   └── lib/
│       ├── sheets.ts         # Logic kết nối Google Sheets Web App
│       └── utils.ts
└── .env.example              # Mẫu biến môi trường
```

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Localhost)

1. Mở terminal tại thư mục dự án:
   ```bash
   npm run dev
   ```
2. Mở trình duyệt và truy cập: `http://localhost:3000`

---

## ☁️ Hướng Dẫn Triển Khai Lên Vercel (1-Click)

### Cách 1: Sử dụng GitHub + Vercel Dashboard
1. Tạo một repository mới trên GitHub và push mã nguồn lên.
2. Truy cập [vercel.com](https://vercel.com) và chọn **Add New Project**.
3. Chọn repository vừa push, Vercel sẽ tự động phát hiện Next.js.
4. (Tùy chọn) Thêm biến môi trường:
   - Key: `GOOGLE_SHEET_WEBAPP_URL`
   - Value: URL Google Apps Script Web App của bạn
5. Bấm **Deploy**. Sau ~1 phút, trang web của bạn sẽ hoạt động toàn cầu!

### Cách 2: Sử dụng Vercel CLI
```bash
npx vercel
```

---

## 📊 Kết Nối Google Sheets Lưu Bảng Xếp Hạng

1. Tạo một Google Sheet mới tại [sheets.new](https://sheets.new).
2. Dòng 1 đặt tên các cột:
   - `Timestamp`, `Username`, `LessonId`, `DrillId`, `WPM`, `Accuracy`, `TimeSpent`
3. Vào **Tiện ích mở rộng (Extensions)** > **Apps Script**.
4. Mở file `google-apps-script.js` trong dự án, copy toàn bộ nội dung và dán vào Apps Script.
5. Bấm **Triển khai (Deploy)** > **Triển khai mới (New deployment)**:
   - Chọn loại: **Ứng dụng web (Web app)**
   - Thực thi dưới dạng: **Tôi (Me)**
   - Ai có quyền truy cập: **Bất kỳ ai (Anyone)**
6. Bấm **Triển khai** và copy đường link URL Web App (dạng `https://script.google.com/macros/s/.../exec`).
7. Tạo file `.env.local` trong dự án (hoặc nhập vào Vercel Environment Variables):
   ```env
   GOOGLE_SHEET_WEBAPP_URL="https://script.google.com/macros/s/.../exec"
   ```
