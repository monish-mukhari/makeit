import axios from "axios";


export async function uploadImage (file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', "token_upload_preset");

    const response = await axios.post("https://api.cloudinary.com/v1_1/dkjysr4mp/image/upload", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    
    return response.data.secure_url;
}