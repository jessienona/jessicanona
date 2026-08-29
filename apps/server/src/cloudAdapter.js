import fs from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "./db.js";

/**
 * Pluggable destination for the cloud-sync queue. Swap in a real object
 * store by setting AWS_S3_BUCKET (+ the usual AWS_* credentials) — until
 * then everything lands on local disk under data/cloud/, which is enough
 * to exercise the full queue → upload → "synced" flow without needing
 * cloud credentials in dev.
 */
class LocalDiskAdapter {
  constructor() {
    this.dir = path.join(DATA_DIR, "cloud");
  }
  async upload({ sessionId, photoId, filePath }) {
    const destDir = path.join(this.dir, sessionId);
    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(filePath, path.join(destDir, `${photoId}.jpg`));
    return { url: `local://cloud/${sessionId}/${photoId}.jpg` };
  }
}

class S3Adapter {
  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET;
    this._client = null;
  }
  async _getClient() {
    if (!this._client) {
      const { S3Client } = await import("@aws-sdk/client-s3");
      this._client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
    }
    return this._client;
  }
  async upload({ sessionId, photoId, filePath }) {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this._getClient();
    const body = await fs.readFile(filePath);
    const key = `${sessionId}/${photoId}.jpg`;
    await client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: "image/jpeg" })
    );
    return { url: `s3://${this.bucket}/${key}` };
  }
}

export function getCloudAdapter() {
  if (process.env.AWS_S3_BUCKET) return new S3Adapter();
  return new LocalDiskAdapter();
}
