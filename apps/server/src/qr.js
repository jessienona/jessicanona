import QRCode from "qrcode";
import { guestJoinUrl } from "./network.js";

export async function sessionQr(session) {
  const joinUrl = guestJoinUrl(session);
  const dataUrl = await QRCode.toDataURL(joinUrl, {
    margin: 1,
    width: 380,
    color: { dark: "#0B0B0C", light: "#F2F0EC" },
  });
  return { joinUrl, dataUrl };
}
