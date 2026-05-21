const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

export async function uploadToImgBB(file) {
  if (!IMGBB_API_KEY) {
    throw new Error("ImgBB API key is missing. Please check your .env file.");
  }

  const formData = new FormData();
  formData.append("key", IMGBB_API_KEY);
  formData.append("image", file);

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (data.status !== 200) {
    throw new Error(data.error?.message || "Image upload failed");
  }

  return data.data.url; // Returns the direct image URL
}
