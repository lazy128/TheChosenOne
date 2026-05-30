/**
 * Seed lịch chiếu cho các phim đã có trong DB.
 * Chạy: node FE/scripts/seed-showtimes.mjs
 *
 * Yêu cầu: Backend đang chạy ở localhost:5000
 */

const API = process.env.API_BASE_URL || "http://localhost:5000/api";

const LOGIN = {
  email: "admin01@cinema.vn",
  mat_khau: "123456",
};

const TIMES = ["10:30", "13:15", "16:00", "18:45", "21:30", "23:15"];
const RAPS = [1, 2, 3];
const PRICES = [75000, 85000, 95000, 110000, 120000, 150000];

async function request(method, path, { body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

async function main() {
  console.log("=== Seed Lịch Chiếu ===\n");

  // 1. Login to get token
  console.log("1. Đăng nhập admin...");
  const res = await request("POST", "/auth/dang-nhap", { body: LOGIN });
  const token = res.json?.data?.accessToken;

  if (!token) {
    console.error("Không thể đăng nhập admin! Response:", JSON.stringify(res.json));
    console.error("Hãy đảm bảo DB đã có seed user admin01@cinema.vn / 123456");
    process.exit(1);
  }
  console.log("   OK - có admin token\n");

  // 2. Get list of movies
  console.log("2. Lấy danh sách phim...");
  const moviesRes = await request("GET", "/QuanLyPhim/LayDanhSachPhim?maNhom=GP00");
  const movies = moviesRes.json?.data || [];
  console.log(`   Tìm thấy ${movies.length} phim\n`);

  if (movies.length === 0) {
    console.error("Không có phim nào trong DB!");
    process.exit(1);
  }

  // 3. Create showtimes for next 7 days
  console.log("3. Tạo lịch chiếu cho 7 ngày tới...\n");

  const today = new Date();
  let created = 0;
  let failed = 0;

  for (const movie of movies) {
    const maPhim = movie.maPhim;
    console.log(`   Phim: ${movie.tenPhim} (maPhim=${maPhim})`);

    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      const dateStr = date.toISOString().slice(0, 10);

      for (let i = 0; i < TIMES.length; i++) {
        const time = TIMES[i];
        const maRap = RAPS[i % RAPS.length];
        const giaVe = PRICES[i % PRICES.length];
        const ngayChieuGioChieu = `${dateStr} ${time}:00`;

        const createRes = await request("POST", "/QuanLyDatVe/TaoLichChieu", {
          token,
          body: { maPhim, ngayChieuGioChieu, maRap, giaVe },
        });

        if (createRes.status >= 200 && createRes.status < 300) {
          created++;
        } else {
          failed++;
          if (failed <= 3) {
            console.log(`     FAIL: ${ngayChieuGioChieu} rap=${maRap} → ${createRes.json?.message || createRes.status}`);
          }
        }
      }
    }
  }

  console.log(`\n=== Kết quả ===`);
  console.log(`   Tạo thành công: ${created}`);
  console.log(`   Thất bại: ${failed}`);
  console.log(`\nXong! Reload app để thấy lịch chiếu.`);
}
