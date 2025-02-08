"use client";
import Calendar from "react-calendar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "../Components/Navbar";
import 'react-calendar/dist/Calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppointmentCalendar } from "../Components/AppointmentCalendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { APIURL } from "@/url.config";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const businessId = localStorage.getItem("businessId");
      if (!businessId) return;

      try {
        const response = await fetch(`${APIURL}/api/business/${businessId}/`);
        if (response.ok) {
          const data = await response.json();
          const formattedAppointments = data.business_appointments.map(
            (appointment) => {
              const client = data.clients.find(
                (client) => client.id === appointment.client_appointments
              );
              const staff = data.business_team_members.find(
                (member) => member.id === appointment.staff
              );
              const services = appointment.services.map((serviceId) => {
                const service = data.business_services.find(
                  (s) => s.id === serviceId
                );
                return service?.service_name || "Unknown Service";
              });
              const packages = appointment.packages.map((packageId) => {
                const pkg = data.business_packages.find(
                  (p) => p.id === packageId
                );
                return pkg?.package_name || "Unknown Package";
              });

              return {
                id: appointment.id,
                clientName: client?.client_name || "Unknown Client",
                staffName: staff
                  ? `${staff.first_name} ${staff.last_name}`
                  : "Unknown Staff",
                services,
                packages,
                appointmentDate: appointment.appointment_date,
                appointmentTime: appointment.appointment_time.slice(0, 5),
                totalAmount: appointment.total_amount,
                paymentStatus: appointment.payment_status,
                payMode: appointment.pay_mode,
              };
            }
          );

          setAppointments(formattedAppointments);
        } else {
          console.error("Failed to fetch appointments:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!date) return;
    const selectedDateString = date.toISOString().split("T")[0];
    const filtered = appointments.filter(
      (appointment) => appointment.appointmentDate === selectedDateString
    );
    setFilteredAppointments(filtered);
  }, [date, appointments]);

  return (
    <div>
      <Navbar />
      <div className="p-4 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center mb-4 justify-between py-4">
          <div>
            <span className="text-black font-bold text-2xl md:text-3xl">
              Calendar
            </span>
            <span className="block text-gray-500 font-thin text-lg md:text-xl">
              View all the activity
            </span>
          </div>
        </div>

        {/* Filters and Add Button */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 border border-gray-300 rounded-md px-2 py-4 bg-white">
          <div className="w-full flex flex-col md:flex-row md:items-center md:space-x-4 p-2 space-y-2 md:space-y-0">
            <Input
              type="text"
              placeholder="Search"
              className="w-full md:w-auto p-2 border border-gray-300 rounded-md"
            />
            <Input
              type="date"
              value={date.toISOString().split("T")[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                if (!isNaN(newDate.getTime())) {
                  setDate(newDate);
                }
              }}
              className="w-full md:w-auto p-2 border border-gray-300 rounded-md"
            />
            <Input
              type="text"
              placeholder="Filters"
              className="w-full md:w-auto p-2 border border-gray-300 rounded-md"
            />
          </div>
          <Button className="w-full md:w-auto bg-purple-600 text-white hover:bg-purple-700 rounded-lg">
            Add
          </Button>
        </div>

        {/* Main Content */}
        <div className="mt-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {/* Calendar Section */}
          <div className="w-full md:w-3/4 border border-gray-300 rounded-xl">
            <ScrollArea>
              <AppointmentCalendar
                selectedDate={date}
                appointments={appointments}
                onDateChange={setDate}
              />
            </ScrollArea>
          </div>

          {/* Side Panel */}
          <div className="w-full md:w-1/4 space-y-4">
            {/* Mini Calendar (Mobile) */}
            <div className="block md:hidden border border-gray-300 rounded-lg p-2">
              <Calendar onChange={setDate} value={date} />
            </div>

            {/* Mini Calendar (Desktop) */}
            <div className="hidden md:block">
              <Calendar onChange={setDate} value={date} />
            </div>

            {/* Upcoming Appointments */}
            <Card className="border border-gray-300">
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {appointment.clientName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">
                              {appointment.clientName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Staff: {appointment.staffName}
                            </p>
                            {appointment.services.length > 0 && (
                              <p className="text-sm text-gray-500">
                                Services: {appointment.services.join(", ")}
                              </p>
                            )}
                            {appointment.packages.length > 0 && (
                              <p className="text-sm text-gray-500">
                                Packages: {appointment.packages.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {appointment.appointmentTime}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No appointments for today.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
