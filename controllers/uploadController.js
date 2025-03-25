const prisma = require("../prisma/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { body, validationResult } = require("express-validator");

const multer = require("multer");
const upload = multer({ dest: "temp-uploads" });

const uploadFileGet = (req, res) => {
    res.render("file-upload-form");
};

const uploadFilePost = [
    upload.single("file"),
    (req, res) => {
        console.log(req.file);
        res.render("index");
    },
];

module.exports = {
    uploadFileGet,
    uploadFilePost,
};
