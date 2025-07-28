"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Modal } from "./modal";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validators/category-validator";
import { Alert, AlertDescription } from "./ui/alert";
import { Check } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useTRPC } from "@/trpc/client";

const EVENT_CATEGORY_VALIDATOR = z.object({
  name: CATEGORY_NAME_VALIDATOR,
  color: z
    .string()
    .min(1, "Color is required")
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format."),
  emoji: z.emoji("Invalid emoji").optional(),
});

type EventCategoryForm = z.infer<typeof EVENT_CATEGORY_VALIDATOR>;

const COLOR_OPTIONS = [
  "#FF6B6B", // bg-[#FF6B6B] ring-[#FF6B6B] Bright Red
  "#4ECDC4", // bg-[#4ECDC4] ring-[#4ECDC4] Teal
  "#45B7D1", // bg-[#45B7D1] ring-[#45B7D1] Sky Blue
  "#FFA07A", // bg-[#FFA07A] ring-[#FFA07A] Light Salmon
  "#98D8C8", // bg-[#98D8C8] ring-[#98D8C8] Seafoam Green
  "#FDCB6E", // bg-[#FDCB6E] ring-[#FDCB6E] Mustard Yellow
  "#6C5CE7", // bg-[#6C5CE7] ring-[#6C5CE7] Soft Purple
  "#FF85A2", // bg-[#FF85A2] ring-[#FF85A2] Pink
  "#2ECC71", // bg-[#2ECC71] ring-[#2ECC71] Emerald Green
  "#E17055", // bg-[#E17055] ring-[#E17055] Terracotta
];

const EMOJI_OPTIONS = [
  { emoji: "💰", label: "Money (Sale)" },
  { emoji: "👤", label: "User (Sign-up)" },
  { emoji: "🎉", label: "Celebration" },
  { emoji: "📅", label: "Calendar" },
  { emoji: "🚀", label: "Launch" },
  { emoji: "📢", label: "Announcement" },
  { emoji: "🎓", label: "Graduation" },
  { emoji: "🏆", label: "Achievement" },
  { emoji: "💡", label: "Idea" },
  { emoji: "🔔", label: "Notification" },
];

interface CreateEventCategoryModel extends PropsWithChildren {
  containerClassName?: string;
}

export const CreateEventCategoryModal = ({
  children,
  containerClassName,
}: CreateEventCategoryModel) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const trpc = useTRPC();

  const { mutate: createEventCategory, isPending } = useMutation(
    trpc.category.createEventCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.category.getEventCategories.infiniteQueryOptions()
        );
        setIsOpen(false);
      },
      onError: (error) => {
        setError(error.message);
      },
    })
  );

  const form = useForm<EventCategoryForm>({
    resolver: zodResolver(EVENT_CATEGORY_VALIDATOR),
  });

  const color = form.watch("color");
  const selectedEmoji = form.watch("emoji");

  const onSubmit = (data: EventCategoryForm) => {
    setError(null);
    createEventCategory(data);
  };

  return (
    <>
      <div className={containerClassName} onClick={() => setIsOpen(true)}>
        {children}
      </div>

      <Modal
        className="max-w-xl p-8"
        showModal={isOpen}
        setShowModal={setIsOpen}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h2 className="text-lg/7 font-medium tracking-tight text-gray-950">
                New Event Category
              </h2>
              <p className="text-sm/6 text-gray-600">
                Create a new category to organize your events.
              </p>
            </div>

            <div className="space-y-5">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="color"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-5 gap-2">
                        {COLOR_OPTIONS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => field.onChange(color)}
                            className={`relative h-10 w-full rounded-xl hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg`}
                            style={{
                              backgroundColor: color,
                              boxShadow:
                                selectedEmoji === color
                                  ? `0 0 0 2px ${color}`
                                  : "none",
                            }}
                          >
                            {field.value === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="h-5 w-5 text-white drop-shadow-lg" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="emoji"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emoji</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-3">
                        {EMOJI_OPTIONS.map(({ emoji, label }) => (
                          <button
                            key={emoji}
                            type="button"
                            className={cn(
                              "size-10 flex items-center justify-center text-xl rounded-md transition-all",
                              selectedEmoji === emoji
                                ? "bg-accent ring-2 ring-ring scale-110"
                                : "bg-accent hover:bg-accent/50"
                            )}
                            onClick={() => field.onChange(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? "Creating..." : "Create Category"}{" "}
              </Button>
            </div>
          </form>
        </Form>
      </Modal>
    </>
  );
};
