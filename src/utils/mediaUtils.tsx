export const MINIO_BASE_URL = "http://127.0.0.1:9000";
export const MINIO_BUCKET_NAME = "learn-with-me";

export const getImageUrl = (
  imageUrl?: string,
  imageKey?: string,
  type: "course" | "profile" = "course"
): string | null => {
  if (imageUrl && imageUrl.startsWith("http")) {
    return imageUrl.replace("localhost", "192.168.9.93");
  }

  const folder = type === "profile" ? "profile-images" : "course-images";

  if (imageKey) {
    return `${MINIO_BASE_URL}/${MINIO_BUCKET_NAME}/${folder}/${imageKey}`;
  }

  if (imageUrl) {
    return `${MINIO_BASE_URL}/${MINIO_BUCKET_NAME}/${folder}/${imageUrl}`;
  }

  return null;
};

export const getVideoUrl = (
  videoUrl?: string,
  videoKey?: string
): string | null => {
  if (videoUrl && videoUrl.startsWith("http")) {
    return videoUrl.replace("localhost", "192.168.9.93");
  }

  if (videoKey) {
    return `${MINIO_BASE_URL}/${MINIO_BUCKET_NAME}/course-videos/${videoKey}`;
  }

  if (videoUrl) {
    return `${MINIO_BASE_URL}/${MINIO_BUCKET_NAME}/course-videos/${videoUrl}`;
  }

  return null;
};
