type StoreImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  maxWidth?: 800 | 1200;
  priority?: boolean;
};

// Keep each srcset descriptor equal to its actual optimizer request width.
// The shared optimizer remains the existing Vinext/Cloudflare image endpoint.
export default function StoreImage({ src, alt, width, height, sizes, maxWidth = 800, priority = false }: StoreImageProps) {
  const widths = [320, 480, 640, 800, 1200].filter((value) => value <= maxWidth);
  const url = (value: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${value}&q=75`;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Explicit per-image responsive widths, using the existing optimizer.
    <img src={url(maxWidth)} srcSet={widths.map((value) => `${url(value)} ${value}w`).join(", ")} sizes={sizes} alt={alt} width={width} height={height} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />
  );
}
