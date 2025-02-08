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
    const businessId = localStorage.getItem("businessId");
    if (!businessId) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch team members from business ID
  useEffect(() => {
    async function fetchBusinessData() {
      if (!businessId) {
        console.error("No business ID found in localStorage.");
        return;
      }

      try {
        const response = await fetch(
          `${APIURL}/api/business/${businessId}/`
        );
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

  // Add a new team member
  const addTeamMember = async (newMember) => {
    try {
      const response = await fetch(`${APIURL}/api/team-members/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMember),
      });

      if (response.ok) {
        const addedMember = await response.json();
        setTeamMembers((prev) => [...prev, addedMember]);
        alert("Team member added successfully.");
      } else {
        console.error("Failed to add team member");
      }
    } catch (error) {
      console.error("Error adding team member:", error);
    }
  };

  // Edit an existing team member
  const editTeamMember = async (updatedMember) => {
    try {
      const response = await fetch(
        `${APIURL}/api/team-members/${updatedMember.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedMember),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTeamMembers((prev) =>
          prev.map((member) => (member.id === data.id ? data : member))
        );
        alert("Team member updated successfully.");
      } else {
        console.error("Failed to update team member");
      }
    } catch (error) {
      console.error("Error updating team member:", error);
    }
  };

  // Delete a team member
  const deleteTeamMember = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this team member?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${APIURL}/api/team-members/${id}/`,
        {
          method: "DELETE",
        }
      );

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
      <div className="p-16">
        <div className="flex items-center mb-4 justify-between">
          <div className="flex flex-col mb-7">
            <span className="text-black font-bold text-3xl">Manage Team</span>
            <span className="text-gray-500 font-thin text-xl">
              View and manage your team members
            </span>
          </div>
          <Button
            variant="secondary"
            className="bg-purple-600 text-white hover:bg-purple-700 px-6 py-2 rounded-lg"
            onClick={() => setIsDrawerOpen(true)}
          >
            Invite
          </Button>
        </div>
        <div className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex items-center mb-4 space-x-4 p-5">
            <Input
              type="text"
              placeholder="Search"
              className="flex-grow p-3 border border-gray-300 rounded-lg"
            />
          </div>
          {loading ? (
            <div className="w-full items-center"><BarLoader className="mb-4" width={"100%"} color="#CF9FFF" /></div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : (
          <table className="min-w-full bg-white">
          
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Team Member
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Email Address
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Date of Joining
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Access Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id} className="border-b hover:bg-gray-100">
                  <td className="px-6 py-4 text-sm">
                    {member.first_name} {member.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm">{member.phone_number}</td>
                  <td className="px-6 py-4 text-sm">{member.member_email}</td>
                  <td className="px-6 py-4 text-sm">
                    {member.date_of_joining}
                  </td>
                  <td className="px-6 py-4 text-sm">{member.access_type}</td>
                  <td className="px-6 py-4  text-sm space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingMember(member);
                        setIsEditDrawerOpen(true);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <PenIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => deleteTeamMember(member.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            
          </table>
          )}
        </div>
      </div>
      <InviteDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        addTeamMember={addTeamMember}
      />
      <EditTeamDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        teamMember={editingMember}
        updateTeamMember={editTeamMember}
      />
    </div>
  );
}
