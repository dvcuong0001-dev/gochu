"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Copy, Check, ArrowLeft, ExternalLink, Sparkles } from "lucide-react";

export const SheetsGuideView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [copied, setCopied] = useState(false);

  const scriptCode = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date().toISOString(),
      data.username || "Ẩn danh",
      data.lessonId || "",
      data.drillId || "",
      Number(data.wpm) || 0,
      Number(data.accuracy) || 0,
      Number(data.timeSpent) || 0
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
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
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
  var drillFilter = e && e.parameter && e.parameter.drillId ? e.parameter.drillId : null;
  var results = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[1]) continue;
    if (drillFilter && r[3] != drillFilter) continue;
    results.push({
      createdAt: r[0], username: r[1], lessonId: r[2], drillId: r[3],
      wpm: Number(r[4]) || 0, accuracy: Number(r[5]) || 0, timeSpent: Number(r[6]) || 0
    });
  }
  results.sort(function(a, b) { return b.wpm - a.wpm; });
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
            <span>Quay lại luyện gõ</span>
          </button>

          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <FileSpreadsheet className="text-emerald-400" />
              <span>Hướng Dẫn Kết Nối Google Sheets</span>
            </h2>
            <p className="text-xs text-gray-400">
              Lưu bảng xếp hạng miễn phí vào bảng tính Google trong 3 bước
            </p>
          </div>
        </div>

        <a
          href="https://sheets.new"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium transition-all flex items-center gap-1.5"
        >
          <span>Mở Google Sheets</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="p-6 rounded-3xl bg-[#0c1322] border border-white/10 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h3 className="text-base font-bold text-white">Tạo Google Sheet & Tiêu đề cột</h3>
          </div>
          <p className="text-xs text-gray-300 mb-3">
            Truy cập <a href="https://sheets.new" target="_blank" className="text-cyan-400 underline">sheets.new</a> để tạo 1 file trang tính mới. Điền dòng 1 làm tiêu đề:
          </p>
          <div className="grid grid-cols-7 gap-1 p-2.5 bg-black/50 border border-white/10 rounded-xl font-mono text-[11px] text-center text-gray-300">
            <div className="bg-white/5 py-1 rounded">A: Timestamp</div>
            <div className="bg-white/5 py-1 rounded">B: Username</div>
            <div className="bg-white/5 py-1 rounded">C: LessonId</div>
            <div className="bg-white/5 py-1 rounded">D: DrillId</div>
            <div className="bg-white/5 py-1 rounded">E: WPM</div>
            <div className="bg-white/5 py-1 rounded">F: Accuracy</div>
            <div className="bg-white/5 py-1 rounded">G: TimeSpent</div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-3xl bg-[#0c1322] border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                2
              </span>
              <h3 className="text-base font-bold text-white">Dán mã Google Apps Script</h3>
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
            Trên thanh menu Google Sheet: Vào <strong>Tiện ích mở rộng (Extensions) → Apps Script</strong>. Xóa hết nội dung cũ và dán đoạn mã dưới đây vào:
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
            <li>Dán vào file <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded">.env.local</code> hoặc trên Vercel Environment Variables:
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
