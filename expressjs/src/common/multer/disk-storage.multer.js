import multer from "multer";
import path from "path";
import { BadRequestException } from "../helpers/exception.helper.js";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/");
    },
    filename: function (req, file, cb) {
        const fileExt = path.extname(file.originalname);

        // console.log({ file, fileExt });

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, "local" + "-" + uniqueSuffix + fileExt);
    },
});

export const uploadDiskStorage = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: function (req, file, cb) {
        if (!allowedImageTypes.has(file.mimetype)) {
            cb(new BadRequestException("Chỉ cho phép upload ảnh JPG, PNG hoặc WEBP"));
            return;
        }
        cb(null, true);
    },
});
{/* <img src="http://localhost:3069/images/local-1773542909818-273064792.jpg"></img> */}
