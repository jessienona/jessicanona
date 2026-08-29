import * as faceapi from "face-api.js";

let loadPromise = null;

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
 * Takes the guest's selfie (a File from an <input capture>) and returns its
 * face descriptor — computed entirely on-device. The selfie image itself
 * never leaves this function; only the caller decides what to do with the
 * descriptor, and per the design it should never be uploaded either.
 */
export async function embedSelfie(file) {
  await ensureModelsLoaded();
  const img = await faceapi.bufferToImage(file);
  const result = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  return result ? Array.from(result.descriptor) : null;
}

function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

// face-api.js's own docs suggest ~0.6 as a reasonable same-person cutoff for
// its FaceRecognitionNet descriptors.
const MATCH_THRESHOLD = 0.58;

/** Filters a {photoId, embedding}[] list down to the ones matching the selfie. */
export function findMatches(selfieEmbedding, embeddings) {
  return embeddings
    .filter(({ embedding }) => euclideanDistance(selfieEmbedding, embedding) < MATCH_THRESHOLD)
    .map(({ photoId }) => photoId);
}
