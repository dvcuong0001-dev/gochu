import { NextRequest, NextResponse } from "next/server";
import { authenticateStudent } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = (body.username || "").toString().trim();
    const pin = (body.pin || "").toString().trim();
    const avatar = (body.avatar || "🐱").toString().trim();

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên tài khoản!" },
        { status: 400 }
      );
    }

    if (!pin) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập mã PIN bí mật 6 số!" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: "Mã PIN phải bao gồm đúng 6 chữ số!" },
        { status: 400 }
      );
    }

    const result = await authenticateStudent(username, pin, avatar);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Đăng nhập thất bại" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      isNew: result.isNew,
    });
  } catch (err: any) {
    console.error("Auth API Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ nội bộ khi xác thực" },
      { status: 500 }
    );
  }
}
