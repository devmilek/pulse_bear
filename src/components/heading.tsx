import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
}

export const Heading = ({ children, className, ...props }: HeadingProps) => {
  return (
    <h1
      className={cn(
        "text-3xl sm:text-4xl text-pretty font-semibold tracking-tight text-card-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
};
