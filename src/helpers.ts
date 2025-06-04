import { fetch } from "@tauri-apps/plugin-http";
import { setActivity } from "tauri-plugin-drpc";
import { Activity, Assets, Timestamps } from "tauri-plugin-drpc/activity";

export const jsonRequest = async <T>(
  url: string,
  method: string,
  body?: any,
): Promise<{ data: T; request: Response }> => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data;

  try {
    data = await response.json();
  } catch (error) {
    console.error(error);
  }

  return { data: data as T, request: response };
};

export const initializeDiscordState = async ({
  stateText,
  largeImage,
  largeText,
  details,
}: {
  clientId: string;
  stateText: string;
  largeImage: string;
  largeText: string;
  details: string;
}) => {
  const activity = new Activity()
    .setAssets(new Assets().setLargeImage(largeImage).setLargeText(largeText))
    .setDetails(details)
    .setState(stateText)
    .setTimestamps(new Timestamps(Date.now()));

  await setActivity(activity);
};

export function base64ToFile(
  base64: string,
  filename: string,
  mimeType: string,
) {
  let byteString = atob(base64.split(",")[1]); // Decode Base64
  let arrayBuffer = new ArrayBuffer(byteString.length);
  let uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new File([uint8Array], filename, { type: mimeType });
}

export function blobToBase64(blob: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // Includes `data:image/...;base64,...`
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
