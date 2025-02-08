import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./GoogleCalender.css";

export const Calendar = () => {
  const [events, setEvents] = useState([
    { id: "1", title: "New Year's Day", date: "2025-01-01" },
    { id: "2", title: "Pending Task", start: "2025-01-02T14:00:00" },
  ]);

  const [newEvent, setNewEvent] = useState({ title: "", start: "", end: "" });

  const handleAddEvent = () => {
    // Validate input
    if (!newEvent.title || !newEvent.start) {
      alert("Please provide a title and start date/time for the event!");
      return;
    }

    // Add the new event
    setEvents([
      ...events,
      { ...newEvent, id: String(events.length + 1) }, // Generate unique ID
    ]);

    // Reset the form fields
    setNewEvent({ title: "", start: "", end: "" });
  };

  const handleDateClick = (info) => {
    const title = prompt("Enter event title:");
    if (title) {
      const newEvent = {
        id: String(events.length + 1), // Generate unique ID
        title,
        start: info.dateStr,
        end: null, // Optional, you can extend this to ask for end time if needed
      };
      setEvents([...events, newEvent]);
    }
  };

  const handleEventClick = (info) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the event "${info.event.title}"?`
    );
    if (confirmDelete) {
      setEvents(events.filter((event) => event.id !== info.event.id));
    }
  };

  return (
    <div>
      <h1>Dynamic Calendar</h1>

      {/* Form for Adding Events */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Event Title"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="datetime-local"
          placeholder="Start Date & Time"
          value={newEvent.start}
          onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="datetime-local"
          placeholder="End Date & Time (Optional)"
          value={newEvent.end}
          onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={handleAddEvent} style={{ padding: "5px 10px" }}>
          Add Event
        </button>
      </div>

      {/* Calendar Component */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        editable={true}
        selectable={true}
        dateClick={handleDateClick} // Handle date click
        eventClick={handleEventClick} // Handle event click
      />
    </div>
  );
};

export default Calendar;
