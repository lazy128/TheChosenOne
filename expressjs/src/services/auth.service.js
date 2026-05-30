import { prisma } from "../common/prisma/connect.prisma.js";
import { BadRequestException, NotfoundException } from "../common/helpers/exception.helper.js";
import { tokenService } from "./token.service.js";

import { quanLyNguoiDungService } from "./quan-ly-nguoi-dung.service.js";

export const authService = {
  async login(req) {
    // Map payload from { email/taiKhoan, mat_khau } to { taiKhoan, matKhau } expected by QuanLyNguoiDung
    const mappedReq = {
      ...req,
      body: {
        taiKhoan: req.body.taiKhoan || req.body.email,
        matKhau: req.body.mat_khau || req.body.matKhau
      }
    };
    return await quanLyNguoiDungService.DangNhap(mappedReq);
  },
  async register(req) {
    const mappedReq = {
      ...req,
      body: {
        taiKhoan: req.body.taiKhoan || req.body.email, // fallback if taiKhoan missing
        matKhau: req.body.mat_khau || req.body.matKhau,
        email: req.body.email,
        soDt: req.body.so_dt || req.body.soDt || "0000000000",
        maNhom: req.body.ma_nhom || req.body.maNhom || "GP00",
        hoTen: req.body.ho_ten || req.body.hoTen || req.body.taiKhoan || req.body.email
      }
    };
    return await quanLyNguoiDungService.DangKy(mappedReq);
  },
  async refreshToken(req) {
    return { accessToken: "placeholder" };
  }
};
