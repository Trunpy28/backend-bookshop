import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadFile = async (file) => {
    if (!file) {
        throw new Error('File not found');
    }

    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const fileName = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
    
    try {
        const result = await cloudinary.uploader.upload(dataUrl, {
            public_id: fileName,
            resource_type: 'auto',
            folder: 'Edupress',
            overwrite: true
        });
        
        return result.secure_url;
    } catch (err) {
        throw new Error(`Upload failed: ${err.message}`);
    }
};

export const uploadFiles = async (listFile) => {
    const listResult = [];
    const errorList = [];

    if (!listFile || listFile.length === 0) {
        throw new Error('There is no file to upload');
    }

    for (const file of listFile) {
        const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const fileName = file.originalname.substring(0, file.originalname.lastIndexOf('.'));

        try {
            const result = await cloudinary.uploader.upload(dataUrl, {
                public_id: fileName,
                resource_type: 'auto',
                folder: 'Edupress',
                overwrite: true
            });
            listResult.push(result);
        } catch (err) {
            errorList.push(`Upload failed for ${file.originalname}: ${err.message}`);
        }
    }

    return { listResult, errorList };
};

export default { uploadFile, uploadFiles }