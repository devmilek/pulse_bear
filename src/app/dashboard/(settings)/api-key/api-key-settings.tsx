"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon, ClipboardIcon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const ApiKeySettings = ({ apiKey }: { apiKey: string }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <Card className="max-w-xl w-full">
      <CardContent>
        <div>
          <Label>Your API Key</Label>
          <div className="mt-1 relative">
            <Input
              type={showApiKey ? "password" : "text"}
              value={apiKey}
              readOnly
            />
            <div className="absolute space-x-0.5 inset-y-0 right-0 flex items-center">
              <Button
                variant="ghost"
                onClick={() => setShowApiKey((prev) => !prev)}
                className="p-1 w-10 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {showApiKey ? (
                  <EyeOff className="size-4 text-brand-900" />
                ) : (
                  <Eye className="size-4 text-brand-900" />
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={copyApiKey}
                className="p-1 w-10 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {copySuccess ? (
                  <CheckIcon className="size-4 text-brand-900" />
                ) : (
                  <ClipboardIcon className="size-4 text-brand-900" />
                )}
              </Button>
            </div>
          </div>

          <p className="mt-2 text-sm/6 text-gray-600">
            Keep your key secret and do not share it with others.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
