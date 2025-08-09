import { Card, CardContent } from "@/components/ui/card";
import { getEventCodeSnippet } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const CategoryEmptyState = ({
  categoryName,
}: {
  categoryName: string;
}) => {
  const codeSnippet = getEventCodeSnippet(categoryName);

  return (
    <Card
      //   contentClassName="max-w-2xl w-full flex flex-col items-center p-6"
      className="flex-1 flex items-center justify-center"
    >
      <CardContent className="max-w-2xl w-full flex flex-col items-center p-6">
        <h2 className="text-xl/8 font-medium text-center tracking-tight">
          Create your first {categoryName} event
        </h2>
        <p className="text-sm/6 text-muted-foreground mb-8 max-w-md text-center text-pretty">
          Get started by sending a request to our tracking API:
        </p>

        <div className="w-full max-w-3xl bg-accent rounded-lg shadow-lg overflow-hidden">
          <div className="bg-accent px-4 py-2 flex justify-between items-center">
            <div className="flex space-x-2">
              <div className="size-3 rounded-full bg-red-500" />
              <div className="size-3 rounded-full bg-yellow-500" />
              <div className="size-3 rounded-full bg-green-500" />
            </div>

            <span className="text-foreground text-sm">your-first-event.js</span>
          </div>

          <SyntaxHighlighter
            language="javascript"
            style={atomDark}
            customStyle={{
              borderRadius: "0px",
              margin: 0,
              padding: "1rem",
              fontSize: "0.875rem",
              lineHeight: "1.5",
            }}
          >
            {codeSnippet}
          </SyntaxHighlighter>
        </div>

        <div className="mt-8 flex flex-col items-center space-x-2">
          <div className="flex gap-2 items-center">
            <div className="size-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Listening to incoming events...
            </span>
          </div>

          <p className="text-sm/6 text-muted-foreground mt-2">
            Need help? Check out our{" "}
            <a href="#" className="text-primary hover:underline">
              documentation
            </a>{" "}
            or{" "}
            <a href="#" className="text-primary hover:underline">
              contact support
            </a>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
