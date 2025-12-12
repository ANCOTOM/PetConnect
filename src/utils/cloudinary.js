export async function uploadToCloudinary(file, preset = "petconnect_posts") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dz5kj8xph/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) throw new Error("Error al subir imagen");

  const data = await response.json();
  return data.secure_url; // URL final de la imagen
}
