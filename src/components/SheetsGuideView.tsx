"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Copy, Check, ArrowLeft, ExternalLink, Sparkles, KeyRound } from "lucide-react";

export const SheetsGuideView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [copied, setCopied] = useState(false);

  const scriptCode = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var action = data.action || "save_score";
    var username = (data.username || "Ẩn danh").trim();
    var pin = (data.pin || "").toString().trim();
    var avatar = data.avatar || "🐱";
    var rows = sheet.getDataRange().getValues();
    var userRowIndex = -1;

    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().toLowerCase() === username.toLowerCase()) {
        userRowIndex = i + 1;
        break;
      }
    }

    var now = new Date().toISOString();

    // 1. XỬ LÝ ĐĂNG NHẬP / XÁC THỰC HỌC SINH (ACTION = 'auth')
    if (action === "auth") {
      if (userRowIndex > 0) {
        var existingPin = (rows[userRowIndex - 1][9] || "").toString().trim();
        // Nếu đã có PIN và không khớp
        if (existingPin && existingPin !== pin) {
          return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: "Mã PIN 6 số không đúng cho tài khoản này!"
          })).setMimeType(ContentService.MimeType.JSON);
        }
        // Nếu tài khoản cũ chưa có PIN thì cập nhật PIN mới
        if (!existingPin && pin) {
          sheet.getRange(userRowIndex, 10).setValue(pin);
        }
        var unlockedJson = rows[userRowIndex - 1][10] || "[]";
        var unlockedLessons = ["lesson1"];
        try { unlockedLessons = JSON.parse(unlockedJson); } catch (_) {}

        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          isNew: false,
          user: {
            username: rows[userRowIndex - 1][0],
            avatar: rows[userRowIndex - 1][1] || avatar,
            level: Number(rows[userRowIndex - 1][2]) || 1,
            xp: Number(rows[userRowIndex - 1][3]) || 0,
            bestWpm: Number(rows[userRowIndex - 1][4]) || 0,
            avgAccuracy: Number(rows[userRowIndex - 1][5]) || 100,
            totalTimeSeconds: Number(rows[userRowIndex - 1][6]) || 0,
            completedDrills: Number(rows[userRowIndex - 1][7]) || 0,
            joinedAt: rows[userRowIndex - 1][8] || now,
            unlockedLessons: unlockedLessons
          }
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        // Tạo tài khoản học sinh mới
        var initialLessons = JSON.stringify(["lesson1"]);
        sheet.appendRow([username, avatar, 1, 0, 0, 100, 0, 0, now, pin, initialLessons]);
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          isNew: true,
          user: {
            username: username,
            avatar: avatar,
            level: 1,
            xp: 0,
            bestWpm: 0,
            avgAccuracy: 100,
            totalTimeSeconds: 0,
            completedDrills: 0,
            joinedAt: now,
            unlockedLessons: ["lesson1"]
          }
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 2. XỬ LÝ LƯU ĐIỂM / ĐỒNG BỘ TIẾN ĐỘ BÀI TẬP (ACTION = 'save_score')
    var wpm = Number(data.wpm) || 0;
    var accuracy = Number(data.accuracy) || 100;
    var timeSpent = Number(data.timeSpent) || 0;
    var earnedXp = Number(data.earnedXp) || Math.max(10, Math.round(wpm * 0.8));
    var unlockedStr = data.unlockedLessons || JSON.stringify(["lesson1"]);

    if (userRowIndex > 0) {
      var currentXp = Number(rows[userRowIndex - 1][3]) || 0;
      var currentBestWpm = Number(rows[userRowIndex - 1][4]) || 0;
      var currentAcc = Number(rows[userRowIndex - 1][5]) || 100;
      var currentTime = Number(rows[userRowIndex - 1][6]) || 0;
      var currentCompleted = Number(rows[userRowIndex - 1][7]) || 0;
      var newXp = currentXp + earnedXp;

      sheet.getRange(userRowIndex, 2).setValue(avatar);
      sheet.getRange(userRowIndex, 3).setValue(1 + Math.floor(newXp / 100));
      sheet.getRange(userRowIndex, 4).setValue(newXp);
      sheet.getRange(userRowIndex, 5).setValue(Math.max(currentBestWpm, wpm));
      sheet.getRange(userRowIndex, 6).setValue(Math.round(((currentAcc + accuracy) / 2) * 10) / 10);
      sheet.getRange(userRowIndex, 7).setValue(currentTime + timeSpent);
      sheet.getRange(userRowIndex, 8).setValue(currentCompleted + 1);
      sheet.getRange(userRowIndex, 9).setValue(now);
      if (pin) sheet.getRange(userRowIndex, 10).setValue(pin);
      if (unlockedStr) sheet.getRange(userRowIndex, 11).setValue(unlockedStr);
    } else {
      sheet.appendRow([username, avatar, 1 + Math.floor(earnedXp / 100), earnedXp, wpm, accuracy, timeSpent, 1, now, pin, unlockedStr]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
  var sortBy = e && e.parameter && e.parameter.sort ? e.parameter.sort : "xp";
  var results = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;
    var unlocked = ["lesson1"];
    try { if (r[10]) unlocked = JSON.parse(r[10]); } catch (_) {}
    results.push({
      username: r[0], avatar: r[1] || "🐱", level: Number(r[2]) || 1, xp: Number(r[3]) || 0,
      bestWpm: Number(r[4]) || 0, avgAccuracy: Number(r[5]) || 100, totalTimeSeconds: Number(r[6]) || 0,
      completedDrills: Number(r[7]) || 1, lastActive: r[8] || "", unlockedLessons: unlocked
    });
  }
  if (sortBy === "wpm") results.sort(function(a, b) { return b.bestWpm - a.bestWpm; });
  else if (sortBy === "time") results.sort(function(a, b) { return b.totalTimeSeconds - a.totalTimeSeconds; });
  else results.sort(function(a, b) { return b.xp - a.xp; });
  return ContentService.createTextOutput(JSON.stringify(results.slice(0, 50))).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 border border-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>

          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <FileSpreadsheet className="text-emerald-400" />
              <span>Kết Nối Bảng Xếp Hạng & Đăng Nhập Học Sinh (Google Sheets)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Đồng bộ dữ liệu điểm số, mã PIN 6 số và bài tập đã mở khóa của học sinh trực tiếp vào Google Sheets
            </p>
          </div>
        </div>
      </div>

      {/* Guide Steps */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="p-6 rounded-3xl bg-[#0c1322] border border-white/10 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h3 className="text-base font-bold text-white">Tạo Google Sheet Mới & Đặt Tên Tiêu Đề Cột</h3>
          </div>
          <p className="text-xs text-gray-300 mb-3">
            Truy cập <a href="https://sheets.new" target="_blank" className="text-cyan-400 underline">sheets.new</a> để tạo 1 file trang tính mới. Điền dòng 1 làm tiêu đề từ Cột A đến Cột K:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-11 gap-1 p-2.5 bg-black/50 border border-white/10 rounded-xl font-mono text-[10px] text-center text-gray-300">
            <div className="bg-white/5 py-1 rounded">A: Username</div>
            <div className="bg-white/5 py-1 rounded">B: Avatar</div>
            <div className="bg-white/5 py-1 rounded">C: Level</div>
            <div className="bg-white/5 py-1 rounded">D: XP</div>
            <div className="bg-white/5 py-1 rounded">E: BestWPM</div>
            <div className="bg-white/5 py-1 rounded">F: AvgAccuracy</div>
            <div className="bg-white/5 py-1 rounded">G: TotalTime</div>
            <div className="bg-white/5 py-1 rounded">H: DrillsCount</div>
            <div className="bg-white/5 py-1 rounded">I: LastUpdated</div>
            <div className="bg-cyan-500/15 text-cyan-300 py-1 rounded border border-cyan-500/30">J: PIN (6 số)</div>
            <div className="bg-amber-500/15 text-amber-300 py-1 rounded border border-amber-500/30">K: Lessons</div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-3xl bg-[#0c1322] border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                2
              </span>
              <h3 className="text-base font-bold text-white">Dán mã Google Apps Script Nâng Cấp</h3>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Đã copy!" : "Copy mã Script"}</span>
            </button>
          </div>
          <p className="text-xs text-gray-300 mb-3">
            Trên thanh menu Google Sheet: Vào <strong>Tiện ích mở rộng (Extensions) → Apps Script</strong>. Xóa hết code cũ và dán đoạn mã này vào:
          </p>

          <pre className="p-4 bg-black/60 border border-white/10 rounded-xl font-mono text-[11px] text-gray-300 overflow-x-auto max-h-56 leading-relaxed">
            {scriptCode}
          </pre>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-3xl bg-[#0c1322] border border-white/10 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h3 className="text-base font-bold text-white">Triển khai Web App & Lấy URL</h3>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-xs text-gray-300 leading-relaxed">
            <li>Nhấn <strong>Triển khai (Deploy)</strong> → <strong>Triển khai mới (New deployment)</strong>.</li>
            <li>Chọn loại bánh răng: <strong>Ứng dụng web (Web app)</strong>.</li>
            <li>Thực thi dưới dạng: <strong>Tôi (Me)</strong>.</li>
            <li>Ai có quyền truy cập: <strong>Bất kỳ ai (Anyone)</strong>.</li>
            <li>Nhấn <strong>Triển khai</strong> và copy đường link URL (kết thúc bằng <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded">/exec</code>).</li>
            <li>Dán vào file <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded">.env.local</code> hoặc trên Vercel:
              <pre className="mt-2 p-2.5 bg-black/50 border border-white/10 rounded-lg text-cyan-300 font-mono text-[11px]">
                GOOGLE_SHEET_WEBAPP_URL=&quot;https://script.google.com/macros/s/AKfycby.../exec&quot;
              </pre>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
