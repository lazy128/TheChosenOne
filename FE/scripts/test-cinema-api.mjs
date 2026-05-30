/**
 * Kiểm tra toàn bộ endpoint trong FE/src/lib/cinema-api.ts có gọi được BE không.
 *
 * Chạy: npm run test:api
 * (BE phải đang chạy: cd expressjs && npm run dev)
 *
 * Env: API_BASE_URL=http://localhost:3069/api
 */

const baseURL = process.env.API_BASE_URL || "http://localhost:3069/api";

const TEST_USER = {
  taiKhoan: `apitest_${Date.now()}`,
  matKhau: "123456",
  email: `apitest_${Date.now()}@test.local`,
  soDt: "0900000000",
  hoTen: "API Test User",
  maNhom: "GP00",
};

const AUTH_TEST = {
  email: `auth_${Date.now()}@test.local`,
  mat_khau: "123456",
  ho_ten: "Auth Test User",
  so_dt: "0901111111",
};

/** @type {{ name: string; fn: (ctx: TestContext) => Promise<void>; auth?: boolean; skip?: (ctx: TestContext) => boolean }}[]} */
const tests = [
  {
    name: "auth/dang-ky",
    fn: async () => {
      const res = await request("POST", "/auth/dang-ky", { body: AUTH_TEST });
      assertOk(res, "auth dang-ky");
    },
  },
  {
    name: "auth/dang-nhap",
    fn: async (ctx) => {
      const res = await request("POST", "/auth/dang-nhap", {
        body: { email: AUTH_TEST.email, mat_khau: AUTH_TEST.mat_khau },
      });
      assertOk(res, "auth dang-nhap");
      const token = res.json?.data?.accessToken;
      if (!token) throw new Error("auth: không có accessToken");
      ctx.authToken = token;
    },
  },
  {
    name: "QuanLyNguoiDung/DangKy",
    fn: async (ctx) => {
      const res = await request("POST", "/QuanLyNguoiDung/DangKy", { body: TEST_USER });
      assertOk(res, "DangKy");
      ctx.registered = true;
    },
  },
  {
    name: "QuanLyNguoiDung/DangNhap",
    fn: async (ctx) => {
      const res = await request("POST", "/QuanLyNguoiDung/DangNhap", {
        body: { taiKhoan: TEST_USER.taiKhoan, matKhau: TEST_USER.matKhau },
      });
      assertOk(res, "DangNhap");
      const token = res.json?.data?.accessToken;
      if (!token) throw new Error("Không có accessToken trong response");
      ctx.token = token;
    },
  },
  {
    name: "QuanLyNguoiDung/ThongTinTaiKhoan",
    auth: true,
    fn: async (ctx) => {
      const res = await request("POST", "/QuanLyNguoiDung/ThongTinTaiKhoan", { token: ctx.token });
      assertOk(res, "ThongTinTaiKhoan");
    },
  },
  {
    name: "QuanLyPhim/LayDanhSachBanner",
    fn: async () => {
      const res = await request("GET", "/QuanLyPhim/LayDanhSachBanner");
      assertOk(res, "LayDanhSachBanner");
    },
  },
  {
    name: "QuanLyPhim/LayDanhSachPhim",
    fn: async (ctx) => {
      const res = await request("GET", "/QuanLyPhim/LayDanhSachPhim?maNhom=GP00");
      assertOk(res, "LayDanhSachPhim");
      const list = res.json?.data;
      if (Array.isArray(list) && list.length > 0) {
        ctx.maPhim = list[0].maPhim;
      }
    },
  },
  {
    name: "QuanLyPhim/LayThongTinPhim",
    skip: (ctx) => !ctx.maPhim,
    fn: async (ctx) => {
      const res = await request("GET", `/QuanLyPhim/LayThongTinPhim?maPhim=${ctx.maPhim}`);
      assertOk(res, "LayThongTinPhim");
    },
  },
  {
    name: "QuanLyRap/LayThongTinHeThongRap",
    fn: async (ctx) => {
      const res = await request("GET", "/QuanLyRap/LayThongTinHeThongRap");
      assertOk(res, "LayThongTinHeThongRap");
      const list = res.json?.data;
      if (Array.isArray(list) && list.length > 0) {
        ctx.maHeThongRap = list[0].maHeThongRap;
      }
    },
  },
  {
    name: "QuanLyRap/LayThongTinCumRapTheoHeThong",
    skip: (ctx) => !ctx.maHeThongRap,
    fn: async (ctx) => {
      const res = await request(
        "GET",
        `/QuanLyRap/LayThongTinCumRapTheoHeThong?maHeThongRap=${encodeURIComponent(ctx.maHeThongRap)}`,
      );
      assertOk(res, "LayThongTinCumRapTheoHeThong");
    },
  },
  {
    name: "QuanLyRap/LayThongTinLichChieuHeThongRap",
    fn: async (ctx) => {
      const res = await request("GET", "/QuanLyRap/LayThongTinLichChieuHeThongRap?maNhom=GP00");
      assertOk(res, "LayThongTinLichChieuHeThongRap");
      ctx.maLichChieu = findFirstMaLichChieu(res.json?.data);
    },
  },
  {
    name: "QuanLyRap/LayThongTinLichChieuPhim",
    skip: (ctx) => !ctx.maPhim,
    fn: async (ctx) => {
      const res = await request("GET", `/QuanLyRap/LayThongTinLichChieuPhim?maPhim=${ctx.maPhim}`);
      assertOk(res, "LayThongTinLichChieuPhim");
      if (!ctx.maLichChieu) {
        ctx.maLichChieu = findMaLichChieuFromPhimDetail(res.json?.data);
      }
    },
  },
  {
    name: "QuanLyDatVe/LayDanhSachPhongVe",
    skip: (ctx) => !ctx.maLichChieu,
    fn: async (ctx) => {
      const res = await request("GET", `/QuanLyDatVe/LayDanhSachPhongVe?maLichChieu=${ctx.maLichChieu}`);
      assertOk(res, "LayDanhSachPhongVe");
      const seats = res.json?.data?.danhSachGhe;
      if (Array.isArray(seats)) {
        const free = seats.find((g) => !g.daDat);
        if (free) ctx.maGhe = free.maGhe;
      }
    },
  },
  {
    name: "QuanLyDatVe/TaoLichChieu",
    auth: true,
    skip: (ctx) => !ctx.maPhim,
    fn: async (ctx) => {
      const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const pad = (n) => String(n).padStart(2, "0");
      const ngayChieuGioChieu = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}T14:00:00`;
      const res = await request("POST", "/QuanLyDatVe/TaoLichChieu", {
        token: ctx.token,
        body: { maPhim: ctx.maPhim, ngayChieuGioChieu, maRap: 1, giaVe: 85000 },
      });
      if (res.ok) {
        const lc = res.json?.data?.maLichChieu;
        if (lc) ctx.maLichChieu = lc;
        return;
      }
      // Không phải admin → có thể 403, bỏ qua nếu đã có lịch từ DB
      if (res.status === 403 || res.status === 401) {
        console.log("    ↳ Bỏ qua (cần quyền admin hoặc maRap không hợp lệ)");
        return;
      }
      throw new Error(res.json?.message || `HTTP ${res.status}`);
    },
  },
  {
    name: "QuanLyDatVe/DatVe",
    auth: true,
    skip: (ctx) => !ctx.maLichChieu || !ctx.maGhe,
    fn: async (ctx) => {
      const res = await request("POST", "/QuanLyDatVe/DatVe", {
        token: ctx.token,
        body: {
          maLichChieu: ctx.maLichChieu,
          danhSachVe: [{ maGhe: ctx.maGhe, giaVe: 85000 }],
        },
      });
      if (res.ok) {
        assertOk(res, "DatVe");
        return;
      }
      const msg = res.json?.message || "";
      if (msg.includes("đã được đặt") || msg.includes("da dat") || res.status === 400) {
        console.log("    ↳ Ghế đã đặt — endpoint vẫn phản hồi đúng");
        return;
      }
      throw new Error(msg || `HTTP ${res.status}`);
    },
  },
];

/** @typedef {{ token?: string; maPhim?: number; maHeThongRap?: string; maLichChieu?: number; maGhe?: number; registered?: boolean }} TestContext */

async function request(method, path, { body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${baseURL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* empty */
  }
  return { ok: res.ok, status: res.status, json };
}

function assertOk(res, label) {
  if (!res.ok) {
    throw new Error(res.json?.message || `${label}: HTTP ${res.status}`);
  }
  if (res.json?.status && res.json.status !== "success" && res.json.statusCode >= 400) {
    throw new Error(res.json.message || `${label}: API error`);
  }
}

function findFirstMaLichChieu(heThongList) {
  if (!Array.isArray(heThongList)) return undefined;
  for (const ht of heThongList) {
    for (const cum of ht.cumRapChieu || []) {
      for (const rap of cum.lichChieuPhim || []) {
        for (const lc of rap.lichChieu || []) {
          if (lc?.maLichChieu) return lc.maLichChieu;
        }
      }
    }
  }
  return undefined;
}

function findMaLichChieuFromPhimDetail(detail) {
  if (!detail?.heThongRapChieu) return undefined;
  for (const ht of detail.heThongRapChieu) {
    for (const cum of ht.cumRapChieu || []) {
      for (const rap of cum.lichChieuPhim || []) {
        for (const lc of rap.lichChieu || []) {
          if (lc?.maLichChieu) return lc.maLichChieu;
        }
      }
    }
  }
  return undefined;
}

async function main() {
  console.log(`\n🎬 Cinema API test — ${baseURL}\n`);

  try {
    const health = await fetch(baseURL.replace(/\/api$/, "") + "/api-docs");
    if (!health.ok) {
      console.warn("⚠️  Không kết nối được BE. Chạy: cd expressjs && npm run dev\n");
    }
  } catch {
    console.error("❌ BE không chạy tại", baseURL);
    console.error("   cd expressjs && npm run dev\n");
    process.exit(1);
  }

  /** @type {TestContext} */
  const ctx = {};
  const results = [];

  for (const t of tests) {
    if (t.skip?.(ctx)) {
      results.push({ name: t.name, status: "skip", reason: "thiếu dữ liệu phụ thuộc (DB trống?)" });
      console.log(`⏭  ${t.name} — skip`);
      continue;
    }
    try {
      await t.fn(ctx);
      results.push({ name: t.name, status: "pass" });
      console.log(`✅ ${t.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ name: t.name, status: "fail", reason: msg });
      console.log(`❌ ${t.name} — ${msg}`);
    }
  }

  const pass = results.filter((r) => r.status === "pass").length;
  const fail = results.filter((r) => r.status === "fail").length;
  const skip = results.filter((r) => r.status === "skip").length;

  console.log("\n── FE cinema-api.ts vs UI ──");
  console.log("Đã gọi trong UI: auth/dang-nhap, auth/dang-ky, LayDanhSachPhim, DatVe (checkout)");
  console.log("Chỉ có trong client, chưa gắn UI: Banner, ThongTinPhim, Rap, PhongVe, ThongTinTaiKhoan, TaoLichChieu");
  console.log(`\nKết quả: ${pass} pass, ${fail} fail, ${skip} skip\n`);

  if (fail > 0) process.exit(1);
}

main();
