/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CHO BẢNG XẾP HẠNG TỔNG TOÀN NỀN TẢNG (TUHOC TYPING)
 * =========================================================================
 * 
 * TIÊU ĐỀ CỘT TRÊN GOOGLE SHEETS (DÒNG 1):
 * Cột A: Username
 * Cột B: Avatar
 * Cột C: Level
 * Cột D: XP
 * Cột E: BestWPM
 * Cột F: AvgAccuracy
 * Cột G: TotalTimeSeconds
 * Cột H: CompletedDrills
 * Cột I: LastUpdated
 * 
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    var username = (data.username || "Ẩn danh").trim();
    var avatar = data.avatar || "🐱";
    var wpm = Number(data.wpm) || 0;
    var accuracy = Number(data.accuracy) || 100;
    var timeSpent = Number(data.timeSpent) || 0;
    var earnedXp = Number(data.earnedXp) || Math.max(10, Math.round(wpm * 0.8));

    var rows = sheet.getDataRange().getValues();
    var userRowIndex = -1;

    // Tìm xem user đã tồn tại trong Sheet chưa
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().toLowerCase() === username.toLowerCase()) {
        userRowIndex = i + 1; // 1-based index cho Sheet
        break;
      }
    }

    var now = new Date().toISOString();

    if (userRowIndex > 0) {
      // Cập nhật người chơi đã có
      var currentXp = Number(rows[userRowIndex - 1][3]) || 0;
      var currentBestWpm = Number(rows[userRowIndex - 1][4]) || 0;
      var currentAcc = Number(rows[userRowIndex - 1][5]) || 100;
      var currentTime = Number(rows[userRowIndex - 1][6]) || 0;
      var currentCompleted = Number(rows[userRowIndex - 1][7]) || 0;

      var newXp = currentXp + earnedXp;
      var newLevel = 1 + Math.floor(newXp / 100);
      var newBestWpm = Math.max(currentBestWpm, wpm);
      var newAcc = Math.round(((currentAcc + accuracy) / 2) * 10) / 10;
      var newTotalTime = currentTime + timeSpent;
      var newCompleted = currentCompleted + 1;

      sheet.getRange(userRowIndex, 2).setValue(avatar);
      sheet.getRange(userRowIndex, 3).setValue(newLevel);
      sheet.getRange(userRowIndex, 4).setValue(newXp);
      sheet.getRange(userRowIndex, 5).setValue(newBestWpm);
      sheet.getRange(userRowIndex, 6).setValue(newAcc);
      sheet.getRange(userRowIndex, 7).setValue(newTotalTime);
      sheet.getRange(userRowIndex, 8).setValue(newCompleted);
      sheet.getRange(userRowIndex, 9).setValue(now);
    } else {
      // Thêm người chơi mới
      var initXp = earnedXp;
      var initLevel = 1 + Math.floor(initXp / 100);

      sheet.appendRow([
        username,
        avatar,
        initLevel,
        initXp,
        wpm,
        accuracy,
        timeSpent,
        1,
        now
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Đã cập nhật bảng xếp hạng tổng" }))
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
        .createTextOutput("[]")
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sortBy = e && e.parameter && e.parameter.sort ? e.parameter.sort : "xp";
    var results = [];

    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r[0]) continue;

      results.push({
        username: r[0],
        avatar: r[1] || "🐱",
        level: Number(r[2]) || 1,
        xp: Number(r[3]) || 0,
        bestWpm: Number(r[4]) || 0,
        avgAccuracy: Number(r[5]) || 100,
        totalTimeSeconds: Number(r[6]) || 0,
        completedDrills: Number(r[7]) || 1,
        lastActive: r[8] || ""
      });
    }

    // Sắp xếp
    if (sortBy === "wpm") {
      results.sort(function(a, b) { return b.bestWpm - a.bestWpm; });
    } else if (sortBy === "time") {
      results.sort(function(a, b) { return b.totalTimeSeconds - a.totalTimeSeconds; });
    } else {
      results.sort(function(a, b) { return b.xp - a.xp; });
    }

    return ContentService
      .createTextOutput(JSON.stringify(results.slice(0, 50)))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
