import React, { useState } from "react";
import { MEDIA_URL } from "@/services/global_config";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EchoAvatarProps {
  size: "mini" | "small" | "normal" | "medium" | "large" | "extra-large" | "extra-extra-large";
  mainImage?: string;
  fallbackImage: string;
  alt: string;
  radius?: string;
  className?: string;
  initialsFallback?: string;
}

const EchoAvatar: React.FC<EchoAvatarProps> = ({
  size,
  mainImage,
  fallbackImage,
  alt,
  radius,
  className,
  initialsFallback,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const imageUrl =
    mainImage && mainImage !== "null" && mainImage !== "undefined"
      ? MEDIA_URL + mainImage
      : fallbackImage;
  const imageSize = getSize(size);
  const fontSize = getFontSize(size);
  const borderRadius = getRounded(radius || "none");
  const initials = initialsFallback
    ? initialsFallback.substring(0, 2).toUpperCase()
    : null;

  // Handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
  };
  //console.log('Radius is ', radius)

  // const colors = [
  //   "rgba(255, 0, 0, 0.5)", // Red
  //   "rgba(0, 255, 0, 0.5)", // Green
  //   "rgba(0, 0, 255, 0.5)", // Blue
  //   "rgba(255, 165, 0, 0.5)", // Orange
  //   "rgba(255, 192, 203, 0.5)", // Pink
  //   "rgba(128, 0, 128, 0.5)", // Purple
  //   "rgba(0, 255, 255, 0.5)", // Cyan
  //   "rgba(139, 69, 19, 0.5)", // Brown
  //   "rgba(0, 128, 0, 0.5)", // Dark green
  //   "rgba(0, 0, 128, 0.5)", // Dark blue
  //   "rgba(255, 20, 147, 0.5)", // Deep pink
  //   "rgba(75, 0, 130, 0.5)", // Indigo
  //   "rgba(0, 128, 128, 0.5)", // Teal
  //   "rgba(255, 215, 0, 0.5)", // Gold
  //   "rgba(255, 99, 71, 0.5)", // Tomato
  //   "rgba(255, 69, 0, 0.5)", // Orange red
  //   "rgba(154, 205, 50, 0.5)", // Yellow green
  //   "rgba(255, 228, 181, 0.5)", // Moccasin
  //   // Add more colors as needed
  // ];

  // const randomColor = colors[Math.floor(Math.random() * colors.length)];

  if (initials) {
    return (
      <div
        className={cn("  flex items-center justify-center", className)}
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: borderRadius,
          fontSize: fontSize, // Adjust font size to fit the container
          backgroundColor: "#E4E1DC",
          fontWeight: 600,
          color: "rgba(34, 34, 68, 0.9)",
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div>
      {imageLoading && <Skeleton className={cn(className)} style={{
        width: imageSize,
        height: imageSize,
        borderRadius: borderRadius
      }} />}
      <img
        src={imageUrl}
        alt={alt}
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: borderRadius,
          display: imageLoading ? "none" : "block",
        }}
        className={cn('object-cover', className)}
        onLoad={handleImageLoad}
        onError={() => setImageLoading(false)} // Handle image load error
      />
    </div>
  );
};

const getRounded = (size: string): string => {
  switch (size) {
    case "zero":
      return "0px";
    case "none":
      return "4px";
    case "small":
      return "6px";
    case "medium":
      return "8px";
    case "large":
      return "10px";
    case "xl":
      return "12px";
    default:
      return "0px";
  }
};

const getFontSize = (
  size: "mini" | "small" | "normal" | "medium" | "large" | "extra-large" | "extra-extra-large"
): string => {
  switch (size) {
    case "mini":
      return "10px";
    case "small":
      return "12px";
    case "medium":
      return "15px";
    case "normal":
      return "18px";
    case "large":
      return "22px";
    case "extra-large":
      return "44px";
    case "extra-extra-large":
      return "64px";
    default:
      return "28px";
  }
};

const getSize = (
  size: "mini" | "small" | "normal" | "medium" | "large" | "extra-large" | "extra-extra-large"
): string => {
  switch (size) {
    case "mini":
      return "20px";
    case "small":
      return "24px";
    case "medium":
      return "32px";
    case "normal":
      return "40px";
    case "large":
      return "48px";
    case "extra-large":
      return "128px";
    case "extra-extra-large":
      return "462px";
    default:
      return "60px";
  }
};

export default EchoAvatar;
