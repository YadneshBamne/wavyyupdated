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

export default function AddCategoryDrawer({
  open,
  onOpenChange,
  onCategoryAdded,
}) {
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
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
      name: data.name,
      description: data.description,
    };

    try {
      const response = await fetch(`${APIURL}/api/service-categories/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newCategory = await response.json();
        alert("Category added successfully!");
        form.reset(); // Clear the form
        onOpenChange(false); // Close the drawer
        onCategoryAdded(newCategory); // Update the category list in parent
      } else {
        const errorData = await response.json();
        alert("Failed to add category: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Category name is required" }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category description"
                      {...field}
                    />
                  </FormControl>
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
                Add Category
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
