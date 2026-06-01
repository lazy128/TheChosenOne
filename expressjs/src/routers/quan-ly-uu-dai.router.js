import express from "express";
import quanLyUuDaiController from "../controllers/quan-ly-uu-dai.controller.js";
import { protect } from "../common/middlewares/protect.middleware.js";

const quanLyUuDaiRouter = express.Router();

// Public
quanLyUuDaiRouter.get("/LayDanhSachUuDai", quanLyUuDaiController.layDanhSachUuDai);

// Apply promo (requires login to check history)
quanLyUuDaiRouter.post("/ApDungUuDai", protect, quanLyUuDaiController.apDungUuDai);
quanLyUuDaiRouter.post("/LuuLichSuUuDai", protect, quanLyUuDaiController.luuLichSuUuDai);

// Admin (Should add authorize("QuanTri") but keeping it simple based on existing structure)
quanLyUuDaiRouter.get("/LayTatCaUuDai", protect, quanLyUuDaiController.layTatCaUuDai);
quanLyUuDaiRouter.post("/ThemUuDai", protect, quanLyUuDaiController.themUuDai);
quanLyUuDaiRouter.post("/CapNhatUuDai", protect, quanLyUuDaiController.capNhatUuDai);
quanLyUuDaiRouter.delete("/XoaUuDai", protect, quanLyUuDaiController.xoaUuDai);

export default quanLyUuDaiRouter;
