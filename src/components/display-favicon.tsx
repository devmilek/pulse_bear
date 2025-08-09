import { cn } from "@/lib/utils";
import { BoxIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export const DisplayFavicon = ({
  domain,
  className,
}: {
  domain: string;
  className?: string;
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <BoxIcon className={cn("size-8", className)} />;
  }

  return (
    <Image
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={`favicon`}
      className={cn("size-8", className)}
      unoptimized
      width={32}
      height={32}
      onError={() => setHasError(true)}
    />
  );
};
