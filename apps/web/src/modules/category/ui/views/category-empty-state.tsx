import { Card, CardContent } from "@/components/ui/card";
import { EventsCodeBlock } from "../components/events-code-block";

export const CategoryEmptyState = ({
  categoryName,
}: {
  categoryName: string;
}) => {
  return (
    <Card
      //   contentClassName="max-w-2xl w-full flex flex-col items-center p-6"
      className="flex-1 flex items-center justify-center"
    >
      <CardContent className="max-w-2xl w-full flex flex-col items-center p-6">
        <h2 className="text-xl/8 font-semibold text-center tracking-tight">
          Create your first {categoryName} event
        </h2>
        <p className="text-sm/6 text-muted-foreground mb-8 max-w-md text-center text-pretty">
          Get started by sending a request to our tracking API:
        </p>

        <EventsCodeBlock categoryName={categoryName} />

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
