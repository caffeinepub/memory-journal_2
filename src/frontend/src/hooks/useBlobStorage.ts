import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export const BLOB_SENTINEL = "!caf!";

type LoadedConfig = Awaited<ReturnType<typeof loadConfig>>;
let configCache: LoadedConfig | null = null;
let configPromise: Promise<LoadedConfig> | null = null;

function getConfigCached(): Promise<LoadedConfig> {
  if (configCache) return Promise.resolve(configCache);
  if (!configPromise) {
    configPromise = loadConfig().then((c) => {
      configCache = c;
      return c;
    });
  }
  return configPromise;
}

export function buildBlobUrl(config: LoadedConfig, hash: string): string {
  return `${config.storage_gateway_url}/v1/blob/?blob_hash=${encodeURIComponent(hash)}&owner_id=${encodeURIComponent(config.backend_canister_id)}&project_id=${encodeURIComponent(config.project_id)}`;
}

export function useMemoryPhoto(
  photoId: string | undefined,
  fallbackSeed: string,
): string {
  const fallbackUrl = `https://picsum.photos/seed/${fallbackSeed}/800/600`;
  const [url, setUrl] = useState(fallbackUrl);

  useEffect(() => {
    const seed = fallbackSeed;
    if (!photoId || !photoId.startsWith(BLOB_SENTINEL)) {
      setUrl(`https://picsum.photos/seed/${seed}/800/600`);
      return;
    }
    let cancelled = false;
    getConfigCached()
      .then((config) => {
        if (cancelled) return;
        const hash = photoId.substring(BLOB_SENTINEL.length);
        setUrl(buildBlobUrl(config, hash));
      })
      .catch(() => {
        if (!cancelled) setUrl(`https://picsum.photos/seed/${seed}/800/600`);
      });
    return () => {
      cancelled = true;
    };
  }, [photoId, fallbackSeed]);

  return url;
}

export function useUploadPhoto() {
  const { identity } = useInternetIdentity();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadPhoto = useCallback(
    async (file: File): Promise<string> => {
      setUploading(true);
      setProgress(0);
      try {
        const config = await getConfigCached();
        const agent = new HttpAgent({
          identity: identity ?? undefined,
          host: config.backend_host,
        });
        if (config.backend_host?.includes("localhost")) {
          await agent.fetchRootKey().catch(() => {});
        }
        const client = new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );
        const bytes = new Uint8Array(await file.arrayBuffer());
        const { hash } = await client.putFile(bytes, (pct) => setProgress(pct));
        return BLOB_SENTINEL + hash;
      } finally {
        setUploading(false);
      }
    },
    [identity],
  );

  return { uploadPhoto, uploading, progress };
}
