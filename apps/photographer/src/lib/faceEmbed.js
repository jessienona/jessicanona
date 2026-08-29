import * as faceapi from "face-api.js";

let loadPromise = null;

/** Loads the three small face-api.js nets from /public/models once per session. */
export function ensureModelsLoaded() {
  if (!loadPromise) {
    loadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
  }
  return loadPromise;
}

/**
 * Computes a 128-float face descriptor for the first face found in an
 * image, entirely in the browser — this is "the photographer's device"
 * from the design's privacy note. Returns null when no face is detected
 * (a landscape, a detail shot, an empty aisle before the ceremony...).
 */
export async function computeFaceEmbedding(imageUrl) {
  await ensureModelsLoaded();
  const img = await faceapi.fetchImage(imageUrl);
  const result = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  return result ? Array.from(result.descriptor) : null;
}
