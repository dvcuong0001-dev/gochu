/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CHO BẢNG XẾP HẠNG TUHOC TYPING
 * =========================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT (MẤT 1 PHÚT):
 * 1. Mở https://sheets.google.com và tạo 1 Google Sheet mới.
 * 2. Đặt tên Sheet (ví dụ: "TuhocTyping_Leaderboard").
 * 3. Hàng 1 (Tiêu đề cột):
 *    Cột A: Timestamp
 *    Cột B: Username
 *    Cột C: LessonId
 *    Cột D: DrillId
 *    Cột E: WPM
 *    Cột F: Accuracy
 *    Cột G: TimeSpent
 * 
 * 4. Trên menu của Google Sheets: Chọn "Tiện ích mở rộng" (Extensions) > "Apps Script".
 * 5. Xóa hết code mặc định, copy toàn bộ nội dung file này dán vào.
 * 6. Bấm "Triển khai" (Deploy) > "Triển khai mới" (New deployment).
 *    - Chọn loại: "Ứng dụng web" (Web app).
 *    - Mô tả: "Leaderboard API".
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me).
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 7. Bấm "Triển khai" (Deploy), cấp quyền truy cập tài khoản Google khi được hỏi.
 * 8. Copy đường link "URL ứng dụng web" (dạng: https://script.google.com/macros/s/.../exec).
 * 9. Dán URL này vào file `.env.local` của Web App:
 *    GOOGLE_SHEET_WEBAPP_URL="https://script.google.com/macros/s/.../exec"
 * 
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    var timestamp = new Date();
    var username = data.username || "Ẩn danh";
    var lessonId = data.lessonId || "";
    var drillId = data.drillId || "";
    var wpm = Number(data.wpm) || 0;
    var accuracy = Number(data.accuracy) || 0;
    var timeSpent = Number(data.timeSpent) || 0;

    sheet.appendRow([
      timestamp.toISOString(),
      username,
      lessonId,
      drillId,
      wpm,
      accuracy,
      timeSpent
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Đã lưu kết quả thành công" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    
    if (rows.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var drillFilter = e && e.parameter && e.parameter.drillId ? e.parameter.drillId : null;
    var results = [];

    // Bỏ qua hàng 0 (Header)
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r[1]) continue; // Không có username

      if (drillFilter && r[3] != drillFilter) {
        continue;
      }

      results.push({
        createdAt: r[0],
        username: r[1],
        lessonId: r[2],
        drillId: r[3],
        wpm: Number(r[4]) || 0,
        accuracy: Number(r[5]) || 0,
        timeSpent: Number(r[6]) || 0
      });
    }

    // Sắp xếp theo WPM giảm dần
    results.sort(function(a, b) {
      return b.wpm - a.wpm;
    });

    // Giới hạn top 50
    results = results.slice(0, 50);

    return ContentService
      .createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
