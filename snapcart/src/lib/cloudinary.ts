import {v2 as cloudinary} from 'cloudinary';

 cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

 const uploadOnCloudinary = async (file: Blob): Promise<string | null> => {
    if(!file) throw new Error("No file provided for upload");
    try {
        // A Blob cannot directly be uploaded to Cloudinary. 
        const arrayBuffer=await file.arrayBuffer();
        // Now we convert it to Node.js Buffer. Cloudinary upload streams require Buffer data.
        const buffer=Buffer.from(arrayBuffer);
        // Because upload_stream uses callbacks, not promises.
        return new Promise((resolve,reject)=>{
            const uploadStream=cloudinary.uploader.upload_stream({resource_type:'auto'},(error,result)=>{
                if(error) return reject(error);
                resolve(result?.secure_url ?? null);
            }).end(buffer);
        });
    } catch (error: any) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
 }   

 export default uploadOnCloudinary;