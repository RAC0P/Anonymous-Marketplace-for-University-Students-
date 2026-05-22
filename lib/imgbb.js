const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

export async function uploadToImgBB(file) {
  if (!IMGBB_API_KEY) {
    console.error("❌ ImgBB API Key is missing!");
    throw new Error("ImgBB API Key is not configured. Check your .env.local file.");
  }

  try {
    console.log("📤 Uploading image to ImgBB:", file.name);

    const formData = new FormData();
    formData.append("key", IMGBB_API_KEY);
    formData.append("image", file);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.status !== 200) {
      console.error("❌ ImgBB Error:", data);
      throw new Error(data.error?.message || "Image upload failed");
    }

    console.log("✅ Image uploaded successfully:", data.data.url);
    return data.data.url;

  } catch (error) {
    console.error("🚨 ImgBB Upload Failed:", error.message);
    throw error;
  }
}
