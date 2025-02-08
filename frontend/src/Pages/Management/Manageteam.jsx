import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, PenIcon, Trash2Icon } from "lucide-react";
import { Navbar } from "../Components/Navbar";
import { InviteDrawer } from "@/Pages/Components/TeamInvite";
import { EditTeamDrawer } from "@/Pages/Components/TeamEdit";
import { useNavigate } from "react-router-dom";
import { APIURL } from "@/url.config";
import { BarLoader } from "react-spinners";

export function ManageTeam() {
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const businessId = localStorage.getItem("businessId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!businessId) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    async function fetchBusinessData() {
      if (!businessId) return;
      try {
        const response = await fetch(`${APIURL}/api/business/${businessId}/`);
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.business_team_members || []);
        } else {
          console.error("Failed to fetch business data");
        }
      } catch (error) {
        console.error("Error fetching business data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBusinessData();
  }, [businessId]);

  const addTeamMember = async (newMember) => {
    try {
      const response = await fetch(`${APIURL}/api/team-members/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      });
      if (response.ok) {
        setTeamMembers(async (prev) => [...prev, await response.json()]);
        alert("Team member added successfully.");
      } else {
        console.error("Failed to add team member");
      }
    } catch (error) {
      console.error("Error adding team member:", error);
    }
  };

  const editTeamMember = async (updatedMember) => {
    try {
      const response = await fetch(`${APIURL}/api/team-members/${updatedMember.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMember),
      });

      if (response.ok) {
        setTeamMembers((prev) =>
          prev.map((member) => (member.id === updatedMember.id ? updatedMember : member))
        );
        alert("Team member updated successfully.");
      } else {
        console.error("Failed to update team member");
      }
    } catch (error) {
      console.error("Error updating team member:", error);
    }
  };

  const deleteTeamMember = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) return;

    try {
      const response = await fetch(`${APIURL}/api/team-members/${id}/`, { method: "DELETE" });
      if (response.ok) {
        setTeamMembers((prev) => prev.filter((member) => member.id !== id));
        alert("Team member deleted successfully.");
      } else {
        console.error("Failed to delete team member");
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-4 md:p-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <h1 className="text-black font-bold text-2xl md:text-3xl">Manage Team</h1>
            <p className="text-gray-500 text-sm md:text-lg">View and manage your team members</p>
          </div>
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg"
            onClick={() => setIsDrawerOpen(true)}
          >
            Invite
          </Button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <Input type="text" placeholder="Search team members" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>

        {/* Loader */}
        {loading && <BarLoader className="mt-4" color="#CF9FFF" width={"100%"} />}

        {/* Error Message */}
        {error && <div className="text-red-500 text-center py-4">{error}</div>}

        {/* Team Members Table (Desktop) */}
        {!loading && !error && (
          <div className="hidden md:block overflow-x-auto mt-4">
            <table className="w-full bg-white border border-gray-300 shadow-md rounded-lg">
              <thead>
                <tr className="border-b">
                  {["Team Member", "Phone Number", "Email", "Date of Joining", "Access Type", "Actions"].map((heading) => (
                    <th key={heading} className="px-6 py-3 text-left text-sm font-semibold text-gray-800">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-100">
                    <td className="px-6 py-4">{member.first_name} {member.last_name}</td>
                    <td className="px-6 py-4">{member.phone_number}</td>
                    <td className="px-6 py-4">{member.member_email}</td>
                    <td className="px-6 py-4">{member.date_of_joining}</td>
                    <td className="px-6 py-4">{member.access_type}</td>
                    <td className="px-6 py-4 flex space-x-2">
                      <Button variant="outline" onClick={() => { setEditingMember(member); setIsEditDrawerOpen(true); }}>
                        <PenIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" onClick={() => deleteTeamMember(member.id)}>
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Team Members (Mobile Cards) */}
        {!loading && !error && (
          <div className="block md:hidden mt-4 space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{member.first_name} {member.last_name}</h3>
                    <p className="text-sm text-gray-500">{member.member_email}</p>
                    <p className="text-sm text-gray-500">Phone: {member.phone_number}</p>
                    <p className="text-sm text-gray-500">Joined: {member.date_of_joining}</p>
                    <p className="text-sm text-gray-500">Access: {member.access_type}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => { setEditingMember(member); setIsEditDrawerOpen(true); }}>
                      <PenIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={() => deleteTeamMember(member.id)}>
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawers */}
      <InviteDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} addTeamMember={addTeamMember} />
      <EditTeamDrawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen} teamMember={editingMember} updateTeamMember={editTeamMember} />
    </div>
  );
}