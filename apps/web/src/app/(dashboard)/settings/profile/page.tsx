"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@diff0/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(64, "Name must be at most 64 characters")
    .transform((s) => s.trim()),
});

type FormValues = z.infer<typeof schema>;

export default function ProfileSettingsPage() {
  const user = useQuery(api.auth.getCurrentUser);
  const updateName = useMutation(api.user.updateUserName);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: user?.name || "",
    },
  });

  // Sync form when user loads (Convex returns undefined while loading)
  useEffect(() => {
    if (user?.name && form.getValues("name") !== user.name) {
      form.reset({ name: user.name });
    }
  }, [user?.name, form]);

  const onSubmit = (values: FormValues) => {
    if (!user?._id) {
      toast.error("Not authenticated");
      return;
    }
    if (values.name === user.name) {
      toast.info("No changes to save");
      return;
    }

    startTransition(async () => {
      try {
        await updateName({ name: values.name });
        toast.success("Name updated");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update name"
        );
      }
    });
  };

  const isSubmitting = form.formState.isSubmitting || isPending;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            className="mr-2 data-[orientation=vertical]:h-4"
            orientation="vertical"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mb-2">
          <h2 className="font-bold text-3xl tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Update your display name. Email is linked to GitHub and cannot be
            changed here.
          </p>
        </div>

        <div className="max-w-full">
          <Card>
            <CardHeader>
              <CardTitle>Personal Info</CardTitle>
              <CardDescription>
                This information will appear across your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="name"
                            aria-required="true"
                            maxLength={64}
                            placeholder="Your name…"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      readOnly
                      disabled
                      aria-readonly="true"
                    />
                    <p className="text-muted-foreground text-xs">
                      Email comes from your GitHub account and cannot be edited.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !user}
                      aria-disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting || !user}
                      onClick={() =>
                        form.reset({ name: user?.name || "" }, {
                          keepErrors: false,
                          keepDirty: false,
                        })
                      }
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
