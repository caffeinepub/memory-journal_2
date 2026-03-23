import { useMemoryPhoto } from "../hooks/useBlobStorage";

interface PhotoImageProps {
  photoId?: string;
  fallbackSeed: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PhotoImage({
  photoId,
  fallbackSeed,
  alt = "",
  className = "",
  style,
}: PhotoImageProps) {
  const url = useMemoryPhoto(photoId, fallbackSeed);
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
    />
  );
}
