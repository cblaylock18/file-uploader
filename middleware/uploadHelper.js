require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { Readable } = require("stream");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function handleCloudinaryUpload(buffer, originalName) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                public_id: originalName.split(".")[0],
                format: originalName.split(".").pop(),
                use_filename: true,
                unique_filename: false,
                filename_override: originalName,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
}

async function handleCloudinaryDestroy(publicId, resourceType) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
            publicId,
            { resource_type: resourceType },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
    });
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = { handleCloudinaryUpload, upload, handleCloudinaryDestroy };
