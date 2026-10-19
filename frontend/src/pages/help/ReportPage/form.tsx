// src/components/ReportBugForm.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { postReport } from "@/services/support/report";
import { Spinner } from "@/components/ui/spinner";

// Define the schema for the form data
const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const ReportBugForm: React.FC = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { toast } = useToast();
  const token = useSelector((state: RootState) => state.auth.token) || "";
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = (data: FormData) => {
    Object.keys(data).forEach(key => {
      form.setValue(key as keyof FormData, "");
    });
  };

  const onSubmit = async (data: FormData) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await postReport(data, token);
      // console.log('Response at Form is ', response);

      if (!response.success) {
        throw new Error("Failed to submit bug report");
      }

      toast({
        title: "Bug Reported Successfully",
        description: "Thank you for helping us improve.",
      });
      // console.log('Bug report submitted successfully');
      resetForm(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with reporting bug.",
      });
      console.error("Error submitting bug report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // <ScrollArea>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="ring-1 ring-gray-300 focus:ring-black"
                />
              </FormControl>
              <FormDescription>
                Please provide a brief, descriptive title for the bug you've
                encountered.
              </FormDescription>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="ring-1 ring-gray-300 focus:ring-black"
                />
              </FormControl>
              <FormDescription>
                Kindly describe the bug in detail, including any steps to
                reproduce it.
              </FormDescription>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>
                Notes
                <span className="text-[11px] pl-1 text-inactive">
                  (Optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="ring-1 ring-gray-300 focus:ring-black"
                />
              </FormControl>
              <FormDescription>
                {" "}
                Feel free to add any additional notes or information that may be
                helpful.
              </FormDescription>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Spinner className="text-white h-4 w-4 mr-1" />}
          <span>Submit</span>
        </Button>
      </form>
      {/* </ScrollArea> */}
    </Form>
  );
};

export default ReportBugForm;
