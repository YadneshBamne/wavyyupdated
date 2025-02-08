import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, CalendarIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { format, parseISO } from "date-fns";
import { APIURL } from "@/url.config";

export default function EditClientDrawer({ open, onOpenChange, client }) {
  const [metadata, setMetadata] = useState(null);

  // Fetch metadata on component mount
  useEffect(() => {
    const fetchMetadata = async () => {
      const response = await fetch(
        `${APIURL}/api/client-metadata/`
      );
      if (response.ok) {
        const data = await response.json();
        setMetadata(data);
      } else {
        console.error("Failed to fetch metadata");
      }
    };

    fetchMetadata();
  }, []);

  // Initialize the form
  const form = useForm({
    defaultValues: {
      clientName: "",
      clientType: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
    },
  });

  const { reset, control } = form;

  // Update the form values when the `client` changes
  useEffect(() => {
    if (client) {
      reset({
        clientName: client.client_name || "",
        clientType: client.client_type || "",
        email: client.client_email || "",
        phone: client.client_phone || "",
        dateOfBirth: client.client_dob ? parseISO(client.client_dob) : "",
        gender: client.client_gender || "",
      });
    }
  }, [client, reset]);

  const onSubmit = async (data) => {
    const businessId = localStorage.getItem("businessId");
    if (!businessId) {
      console.error("Business ID not found in localStorage");
      alert("Business ID is required");
      return;
    }

    const clientData = {
      business_id: businessId,
      client_name: data.clientName,
      client_type: data.clientType,
      client_email: data.email,
      client_phone: data.phone,
      client_dob: data.dateOfBirth
        ? format(new Date(data.dateOfBirth), "yyyy-MM-dd")
        : null,
      client_gender: data.gender,
    };

    try {
      const response = await fetch(
        `${APIURL}/api/clients/${client.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clientData),
        }
      );

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("API Error:", errorDetails);
        throw new Error("Failed to edit client. Status: " + response.status);
      }

      const result = await response.json();
      console.log("Client edited successfully:", result);
      onOpenChange(false); // Close the drawer
    } catch (error) {
      console.error("Error editing client:", error);
    }
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Edit Client
            </DialogTitle>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Client name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} // Prefill the value
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {metadata.client_type.choices.map((choice) => (
                        <SelectItem key={choice[0]} value={choice[0]}>
                          {choice[1]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@company.com" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="0000000" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className="w-full">
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} // Prefill the value
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {metadata.client_gender.choices.map((choice) => (
                        <SelectItem key={choice[0]} value={choice[0]}>
                          {choice[1]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
