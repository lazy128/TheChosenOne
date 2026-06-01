import { prisma } from "../common/prisma/connect.prisma.js";
import { BadRequestException } from "../common/helpers/exception.helper.js";

function sendUuDaiResponse(res, data, message, statusCode = 200) {
  res.status(200).json({
    status: statusCode === 200 ? "success" : "error",
    statusCode,
    message,
    data,
    content: data,
  });
}

const quanLyUuDaiController = {
  layDanhSachUuDai: async (req, res, next) => {
    try {
      const now = new Date();
      const danhSach = await prisma.uu_dai.findMany({
        where: {
          is_deleted: false,
          ngay_het_han: {
            gt: now,
          },
        },
      });
      sendUuDaiResponse(res, danhSach, "Lay danh sach uu dai thanh cong");
    } catch (err) {
      next(err);
    }
  },

  layTatCaUuDai: async (req, res, next) => {
    try {
      const danhSach = await prisma.uu_dai.findMany({
        where: { is_deleted: false },
        orderBy: { created_at: "desc" },
      });
      sendUuDaiResponse(res, danhSach, "Lay tat ca uu dai thanh cong");
    } catch (err) {
      next(err);
    }
  },

  themUuDai: async (req, res, next) => {
    try {
      const { tieu_de, ma_giam_gia, phan_tram_giam, mo_ta, loai_uu_dai, icon, accent, ngay_het_han } = req.body;
      if (!ma_giam_gia?.trim()) {
        throw new BadRequestException("Ma giam gia khong duoc de trong");
      }

      const checkMGG = await prisma.uu_dai.findUnique({
        where: { ma_giam_gia: ma_giam_gia.toUpperCase() },
      });
      if (checkMGG && !checkMGG.is_deleted) {
        throw new BadRequestException("Ma giam gia da ton tai");
      }

      const newUuDai = await prisma.uu_dai.create({
        data: {
          tieu_de,
          ma_giam_gia: ma_giam_gia.toUpperCase(),
          phan_tram_giam: Number(phan_tram_giam),
          mo_ta,
          loai_uu_dai,
          icon,
          accent,
          ngay_het_han: new Date(ngay_het_han),
        },
      });

      sendUuDaiResponse(res, newUuDai, "Them uu dai thanh cong");
    } catch (err) {
      next(err);
    }
  },

  capNhatUuDai: async (req, res, next) => {
    try {
      const { ma_uu_dai, tieu_de, phan_tram_giam, mo_ta, loai_uu_dai, icon, accent, ngay_het_han } = req.body;
      const updated = await prisma.uu_dai.update({
        where: { ma_uu_dai: Number(ma_uu_dai) },
        data: {
          tieu_de,
          phan_tram_giam: Number(phan_tram_giam),
          mo_ta,
          loai_uu_dai,
          icon,
          accent,
          ngay_het_han: new Date(ngay_het_han),
        },
      });

      sendUuDaiResponse(res, updated, "Cap nhat uu dai thanh cong");
    } catch (err) {
      next(err);
    }
  },

  xoaUuDai: async (req, res, next) => {
    try {
      const ma_uu_dai = Number(req.query.MaUuDai);
      await prisma.uu_dai.update({
        where: { ma_uu_dai },
        data: { is_deleted: true },
      });

      sendUuDaiResponse(res, null, "Xoa uu dai thanh cong");
    } catch (err) {
      next(err);
    }
  },

  apDungUuDai: async (req, res, next) => {
    try {
      const { ma_giam_gia } = req.body;
      if (!ma_giam_gia?.trim()) {
        return sendUuDaiResponse(res, null, "Vui long nhap ma giam gia", 400);
      }

      const user = req.user;
      const uuDai = await prisma.uu_dai.findUnique({
        where: { ma_giam_gia: ma_giam_gia.toUpperCase() },
      });

      if (!uuDai || uuDai.is_deleted) {
        return sendUuDaiResponse(res, null, "Ma giam gia khong ton tai", 400);
      }

      if (new Date() > uuDai.ngay_het_han) {
        return sendUuDaiResponse(res, null, "Ma giam gia da het han", 400);
      }

      if (user) {
        const daSuDung = await prisma.lich_su_uu_dai.findUnique({
          where: {
            uq_user_uu_dai: {
              tai_khoan: user.tai_khoan,
              ma_uu_dai: uuDai.ma_uu_dai,
            },
          },
        });
        if (daSuDung) {
          return sendUuDaiResponse(res, null, "Ban da su dung ma giam gia nay roi!", 400);
        }
      }

      sendUuDaiResponse(res, uuDai, "Ap dung thanh cong");
    } catch (err) {
      next(err);
    }
  },

  luuLichSuUuDai: async (req, res, next) => {
    try {
      const { ma_uu_dai } = req.body;
      const user = req.user;
      if (!user) {
        throw new BadRequestException("Chua dang nhap");
      }

      await prisma.lich_su_uu_dai.create({
        data: {
          tai_khoan: user.tai_khoan,
          ma_uu_dai: Number(ma_uu_dai),
        },
      });

      sendUuDaiResponse(res, null, "Luu lich su thanh cong");
    } catch (err) {
      next(err);
    }
  },
};

export default quanLyUuDaiController;
