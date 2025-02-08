import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { APIURL } from "@/url.config";

export default function AddPackageDrawer({
  open,
  onOpenChange,
  onPackageAdded,
}) {
  const form = useForm({
    defaultValues: {
      packageName: "",
      packageDuration: "",
      packagePrice: "",
    },
  });

  const businessId = localStorage.getItem("businessId");

  const onSubmit = async (data) => {
    if (!businessId) {
      alert("Business ID is required");
      return;
    }

    const payload = {
      business_id: businessId,
      package_name: data.packageName,
      package_duration_in_mins: parseInt(data.packageDuration, 10),
      package_price: parseFloat(data.packagePrice),
    };

    try {
      const response = await fetch(`${APIURL}/api/packages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newPackage = await response.json();
        alert("Package added successfully!");
        form.reset(); // Clear the form
        onOpenChange(false); // Close the drawer
        onPackageAdded(newPackage); // Update the packages list in parent
      } else {
        const errorData = await response.json();
        alert("Failed to add package: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Error adding package:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Package</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="packageName"
              rules={{ required: "Package name is required" }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Package Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter package name" {...field} />
                  </FormControl>
                  {fieldState.error && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packageDuration"
              rules={{
                required: "Package duration is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Duration must be a valid number",
                },
              }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Duration (in minutes)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter duration" {...field} />
                  </FormControl>
                  {fieldState.error && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packagePrice"
              rules={{
                required: "Package price is required",
                pattern: {
                  value: /^[0-9.]+$/,
                  message: "Price must be a valid number",
                },
              }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Price (₹)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter price" {...field} />
                  </FormControl>
                  {fieldState.error && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button className="border-purple-500 text-purple-900" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add Package
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
