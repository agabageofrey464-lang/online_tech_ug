// A photograph made ready to send, in the browser, before it is uploaded.
//
// A phone's camera picture is several megabytes — slow to send on mobile
// data, and sometimes over what the server accepts, so the same product that
// uploads from a laptop would fail from a phone. Here it is turned the right
// way up and brought down to a size a product photo needs. The server then
// lays it on a white square of one standard size, so the result is the same
// whichever device it came from.

const LONGEST = 1600;

export async function preparePhoto(file: File): Promise<File> {
  try {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, LONGEST / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // White behind anything see-through, as the site will show it.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", 0.92));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "photo"}.jpg`, { type: "image/jpeg" });
  } catch {
    // A browser that cannot do this sends the picture as it is; the server
    // still standardises it.
    return file;
  }
}
