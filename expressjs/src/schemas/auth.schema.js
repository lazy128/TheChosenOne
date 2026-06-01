import { z } from "zod";

export const DangNhapSchema = z.object({
  taiKhoan: z.string().min(1, "Tài khoản không được để trống").max(50),
  matKhau: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(100),
});

export const DangKySchema = z.object({
  taiKhoan: z.string().min(1, "Tài khoản không được để trống").max(50),
  matKhau: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(100),
  email: z.string().email("Email không hợp lệ").max(100),
  soDt: z.string().min(9, "Số điện thoại không hợp lệ").max(20).optional(),
  hoTen: z.string().min(1, "Họ tên không được để trống").max(100).optional(),
  maNhom: z.string().optional(),
});
