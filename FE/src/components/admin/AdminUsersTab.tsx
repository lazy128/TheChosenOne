import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Loader2, Edit, Trash2, Shield, User } from "lucide-react";
import { quanLyNguoiDungApi } from "@/lib/cinema-api";
import type { NguoiDung } from "@/lib/cinema-api";

export function AdminUsersTab() {
  const [users, setUsers] = useState<NguoiDung[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [result, setResult] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<NguoiDung | null>(null);
  
  // Form states
  const [taiKhoan, setTaiKhoan] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [email, setEmail] = useState("");
  const [soDt, setSoDt] = useState("");
  const [hoTen, setHoTen] = useState("");
  const [maLoaiNguoiDung, setMaLoaiNguoiDung] = useState("KhachHang");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await quanLyNguoiDungApi.layDanhSachNguoiDung(debouncedSearch || undefined);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setResult({ type: "err", msg: "Lỗi tải danh sách người dùng" });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (account: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng: ${account}?`)) return;
    try {
      await quanLyNguoiDungApi.xoaNguoiDung(account);
      setResult({ type: "ok", msg: "Xóa thành công!" });
      fetchUsers();
    } catch (err: any) {
      setResult({ type: "err", msg: err.message || "Xóa thất bại" });
    }
  };

  const openModal = (user?: NguoiDung) => {
    if (user) {
      setEditingUser(user);
      setTaiKhoan(user.taiKhoan);
      setMatKhau(""); // Don't show password for edit
      setEmail(user.email);
      setSoDt(user.soDT || user.soDt || "");
      setHoTen(user.hoTen);
      setMaLoaiNguoiDung(user.maLoaiNguoiDung || "KhachHang");
    } else {
      setEditingUser(null);
      setTaiKhoan("");
      setMatKhau("");
      setEmail("");
      setSoDt("");
      setHoTen("");
      setMaLoaiNguoiDung("KhachHang");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        taiKhoan, matKhau, email, soDt, hoTen, maLoaiNguoiDung, maNhom: "GP00"
      };
      if (editingUser) {
        await quanLyNguoiDungApi.capNhatThongTinNguoiDung(payload);
        setResult({ type: "ok", msg: "Cập nhật thành công!" });
      } else {
        if (!matKhau) throw new Error("Vui lòng nhập mật khẩu");
        await quanLyNguoiDungApi.themNguoiDung(payload);
        setResult({ type: "ok", msg: "Thêm thành công!" });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setResult({ type: "err", msg: err.message || "Thao tác thất bại" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {result && (
        <div className={`rounded-lg p-4 text-sm ${result.type === "ok" ? "bg-emerald-500/10 text-emerald-500" : "bg-accent-blood/10 text-accent-blood"}`}>
          {result.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm tài khoản, họ tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-accent-blood focus:outline-none focus:ring-1 focus:ring-accent-blood"
          />
        </div>
        <button
          onClick={() => openModal()}
          className="shrink-0 flex items-center gap-2 rounded-md bg-accent-blood px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-blood/80"
        >
          <Plus size={16} /> Thêm Người Dùng
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-muted">
            <thead className="bg-white/5 text-xs uppercase text-white/60">
              <tr>
                <th className="px-4 py-3">Tài Khoản</th>
                <th className="px-4 py-3">Họ Tên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">SĐT</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-accent-blood" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/40">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.taiKhoan} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-medium text-white">{u.taiKhoan}</td>
                    <td className="px-4 py-3">{u.hoTen}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.soDT || u.soDt}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${
                        u.maLoaiNguoiDung === "QuanTri" ? "bg-accent-ember/20 text-accent-ember" : "bg-white/10 text-white/70"
                      }`}>
                        {u.maLoaiNguoiDung === "QuanTri" ? <Shield size={10} /> : <User size={10} />}
                        {u.maLoaiNguoiDung}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(u)} className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(u.taiKhoan)} className="p-1.5 rounded-md hover:bg-accent-blood/20 text-accent-blood transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
          >
            <h3 className="mb-4 font-display text-xl text-white">
              {editingUser ? "Cập Nhật Người Dùng" : "Thêm Người Dùng Mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-text-muted">Tài Khoản</label>
                <input required disabled={!!editingUser} type="text" value={taiKhoan} onChange={e => setTaiKhoan(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white disabled:opacity-50" />
              </div>
              {!editingUser && (
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Mật Khẩu</label>
                  <input required={!editingUser} type="password" value={matKhau} onChange={e => setMatKhau(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white" />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs text-text-muted">Họ Tên</label>
                <input required type="text" value={hoTen} onChange={e => setHoTen(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Số Điện Thoại</label>
                <input required type="tel" value={soDt} onChange={e => setSoDt(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Loại Người Dùng</label>
                <select value={maLoaiNguoiDung} onChange={e => setMaLoaiNguoiDung(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white [&>option]:bg-zinc-900">
                  <option value="KhachHang">Khách Hàng</option>
                  <option value="QuanTri">Quản Trị Viên</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md px-4 py-2 text-sm text-text-muted hover:text-white">Hủy</button>
                <button disabled={submitting} type="submit" className="rounded-md bg-accent-blood px-4 py-2 text-sm font-medium text-white hover:bg-accent-blood/80 flex items-center gap-2">
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingUser ? "Lưu Thay Đổi" : "Tạo Mới"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
