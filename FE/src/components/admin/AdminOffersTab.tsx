import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { quanLyUuDaiApi, type UuDai } from "@/lib/cinema-api";

export function AdminOffersTab() {
  const [offers, setOffers] = useState<UuDai[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<UuDai | null>(null);
  
  // Form states
  const [maUuDai, setMaUuDai] = useState(0);
  const [tieuDe, setTieuDe] = useState("");
  const [maGiamGia, setMaGiamGia] = useState("");
  const [phanTramGiam, setPhanTramGiam] = useState(10);
  const [moTa, setMoTa] = useState("");
  const [loaiUuDai, setLoaiUuDai] = useState("all");
  const [icon, setIcon] = useState("ticket");
  const [accent, setAccent] = useState("blood");
  const [ngayHetHan, setNgayHetHan] = useState("");
  
  const [submitting, setSubmitting] = useState(false);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await quanLyUuDaiApi.layTatCaUuDai();
      setOffers(data);
    } catch (err) {
      console.error(err);
      setResult({ type: "err", msg: "Lỗi tải danh sách ưu đãi" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleDelete = async (maUuDai: number, code: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa mã giảm giá: ${code}?`)) return;
    try {
      await quanLyUuDaiApi.xoaUuDai(maUuDai);
      setResult({ type: "ok", msg: "Xóa thành công!" });
      fetchOffers();
    } catch (err: any) {
      setResult({ type: "err", msg: err.message || "Xóa thất bại" });
    }
  };

  const openModal = (offer?: UuDai) => {
    if (offer) {
      setEditingOffer(offer);
      setMaUuDai(offer.ma_uu_dai);
      setTieuDe(offer.tieu_de);
      setMaGiamGia(offer.ma_giam_gia);
      setPhanTramGiam(offer.phan_tram_giam);
      setMoTa(offer.mo_ta || "");
      setLoaiUuDai(offer.loai_uu_dai);
      setIcon(offer.icon);
      setAccent(offer.accent);
      // Format YYYY-MM-DD
      setNgayHetHan(new Date(offer.ngay_het_han).toISOString().split('T')[0]);
    } else {
      setEditingOffer(null);
      setMaUuDai(0);
      setTieuDe("");
      setMaGiamGia("");
      setPhanTramGiam(10);
      setMoTa("");
      setLoaiUuDai("all");
      setIcon("ticket");
      setAccent("blood");
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setNgayHetHan(nextMonth.toISOString().split('T')[0]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        ma_uu_dai: maUuDai,
        tieu_de: tieuDe,
        ma_giam_gia: maGiamGia,
        phan_tram_giam: Number(phanTramGiam),
        mo_ta: moTa,
        loai_uu_dai: loaiUuDai,
        icon,
        accent,
        ngay_het_han: new Date(ngayHetHan).toISOString(),
      };

      if (editingOffer) {
        await quanLyUuDaiApi.capNhatUuDai(payload);
        setResult({ type: "ok", msg: "Cập nhật thành công!" });
      } else {
        await quanLyUuDaiApi.themUuDai(payload);
        setResult({ type: "ok", msg: "Thêm thành công!" });
      }
      setIsModalOpen(false);
      fetchOffers();
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

      <div className="flex justify-end">
        <button
          onClick={() => openModal()}
          className="shrink-0 flex items-center gap-2 rounded-md bg-accent-blood px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-blood/80"
        >
          <Plus size={16} /> Thêm Ưu Đãi
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-muted">
            <thead className="bg-white/5 text-xs uppercase text-white/60">
              <tr>
                <th className="px-4 py-3">Mã GG</th>
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Giảm (%)</th>
                <th className="px-4 py-3">Hết Hạn</th>
                <th className="px-4 py-3">Trạng Thái</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-accent-blood" />
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/40">
                    Không có mã ưu đãi nào.
                  </td>
                </tr>
              ) : (
                offers.map((o) => {
                  const isExpired = new Date() > new Date(o.ngay_het_han);
                  return (
                    <tr key={o.ma_uu_dai} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="px-4 py-3 font-medium text-white">{o.ma_giam_gia}</td>
                      <td className="px-4 py-3">{o.tieu_de}</td>
                      <td className="px-4 py-3 uppercase text-[10px] tracking-wider">{o.loai_uu_dai}</td>
                      <td className="px-4 py-3 text-accent-ember font-bold">{o.phan_tram_giam}%</td>
                      <td className="px-4 py-3">{new Date(o.ngay_het_han).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${
                          isExpired ? "bg-white/10 text-white/70" : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {isExpired ? "Hết hạn" : "Còn hạn"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openModal(o)} className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(o.ma_uu_dai, o.ma_giam_gia)} className="p-1.5 rounded-md hover:bg-accent-blood/20 text-accent-blood transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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
            className="w-full max-w-lg rounded-xl border border-white/10 bg-zinc-950 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="mb-4 font-display text-xl text-white">
              {editingOffer ? "Cập Nhật Ưu Đãi" : "Thêm Ưu Đãi Mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs text-text-muted">Tiêu Đề (Title)</label>
                  <input required type="text" value={tieuDe} onChange={e => setTieuDe(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white" placeholder="Giảm 10% xem phim..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Mã Giảm Giá (Code)</label>
                  <input required disabled={!!editingOffer} type="text" value={maGiamGia} onChange={e => setMaGiamGia(e.target.value)} className="w-full uppercase rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white disabled:opacity-50" placeholder="VD: REEL10" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Phần Trăm Giảm (%)</label>
                  <input required type="number" min="1" max="100" value={phanTramGiam} onChange={e => setPhanTramGiam(Number(e.target.value))} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs text-text-muted">Mô Tả</label>
                  <textarea rows={3} value={moTa} onChange={e => setMoTa(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white" placeholder="Áp dụng cho mọi giao dịch..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Loại Ưu Đãi</label>
                  <select value={loaiUuDai} onChange={e => setLoaiUuDai(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white [&>option]:bg-zinc-900">
                    <option value="all">Tất cả</option>
                    <option value="student">Học sinh / Sinh viên</option>
                    <option value="vip">Thành viên VIP</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Ngày Hết Hạn</label>
                  <input required type="date" value={ngayHetHan} onChange={e => setNgayHetHan(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white [color-scheme:dark]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Icon</label>
                  <select value={icon} onChange={e => setIcon(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white [&>option]:bg-zinc-900">
                    <option value="ticket">Ticket</option>
                    <option value="student30">Graduation Cap</option>
                    <option value="vip15">Crown</option>
                    <option value="duodate">Heart</option>
                    <option value="midnight">Moon</option>
                    <option value="imaxweek">Film</option>
                    <option value="combo15">Popcorn</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Màu sắc (Accent)</label>
                  <select value={accent} onChange={e => setAccent(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white [&>option]:bg-zinc-900">
                    <option value="blood">Đỏ (Blood)</option>
                    <option value="gold">Vàng (Gold)</option>
                    <option value="ice">Xanh dương (Ice)</option>
                    <option value="ember">Cam (Ember)</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md px-4 py-2 text-sm text-text-muted hover:text-white">Hủy</button>
                <button disabled={submitting} type="submit" className="rounded-md bg-accent-blood px-4 py-2 text-sm font-medium text-white hover:bg-accent-blood/80 flex items-center gap-2">
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingOffer ? "Lưu Thay Đổi" : "Tạo Mới"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
