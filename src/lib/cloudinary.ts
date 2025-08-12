import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'auto',
            folder: 'hotel-website',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result!.secure_url);
            }
          }
        )
        .end(buffer);
    });
  } catch (error) {
    throw new Error('Error uploading to Cloudinary');
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error('Error deleting from Cloudinary');
  }
};

export const listCloudinaryImages = async (folder = 'hotel-website', max = 100) => {
  const result: any = await (cloudinary as any).search
    .expression(`folder=${folder}`)
    .sort_by('created_at','desc')
    .max_results(Math.min(max, 100))
    .execute();
  return result.resources || [];
};

export default cloudinary;
