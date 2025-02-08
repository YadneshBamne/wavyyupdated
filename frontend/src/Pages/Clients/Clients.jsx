import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "../Components/Navbar";
import { BarLoader } from "react-spinners";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Calendar, Pen, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import AddClientDrawer from "../Components/AddClients";
import EditClientDrawer from "../Components/EditClientDrawer";
import { useNavigate } from "react-router-dom";
import { APIURL } from "@/url.config";

export default function ClientsList() {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [businessId, setBusinessId] = useState(
    localStorage.getItem("businessId")
  );

  const deleteClient = async (clientId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this client?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${APIURL}/api/clients/${clientId}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Remove the deleted client from the local state
        setClients((prevClients) =>
          prevClients.filter((client) => client.id !== clientId)
        );
        alert("Client deleted successfully!");
      } else {
        const errorData = await response.json();
        console.error("Failed to delete client:", errorData);
        alert("Failed to delete client. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    const businessId = localStorage.getItem("businessId");
    if (!businessId) {
      navigate("/login");
    }
  }, [navigate]);
  
  // Function to toggle drawer visibility
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Fetch clients data from the API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(
          `${APIURL}/api/business/${businessId}/`
        );
        const data = await response.json();
        setClients(data.clients);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [businessId]);

  return (
    <div>
      <Navbar />
      <div className="p-8">
        <div className="flex items-center mb-4 justify-between p-8">
          <div className="flex flex-col mb-7">
            <span className="text-black font-bold text-3xl">Clients List</span>
            <span className="text-gray-500 font-thin text-xl">
              view, add, edit and delete your client's details.
            </span>
          </div>
          <div className="space-x-4">
            <Link to="/bookings">
              <Button className="border-purple-600" variant="outline">
                Back to Appointments
              </Button>
            </Link>
            <Button
              onClick={toggleDrawer} // Open the AddClientDrawer
              variant="secondary"
              className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-2 rounded-lg"
            >
              Add Clients
            </Button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-sm">
          <div className="flex space-x-4 p-7">
            <Input
              type="text"
              placeholder="Search by name, email or mobile number"
              className="flex-grow p-6 rounded-lg border-gray-300 shadow-sm"
            />
            <Input
              type="text"
              placeholder="Filters"
              className="flex-grow p-6 border-gray-300 rounded-lg shadow-sm"
            />
            <Button
              variant="outline"
              className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-2 rounded-lg"
            >
              Export
            </Button>
          </div>

          {isLoading ? (
            <div className="p-5"><BarLoader className="mb-4" width={"100%"} color="#C3B1E1" /></div>
          ) : (
            <Table className="w-full bg-white shadow-md rounded-lg">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-black">Client Name</TableHead>
                  <TableHead className="text-black">Phone number</TableHead>
                  <TableHead className="text-black">Email address</TableHead>
                  <TableHead className="text-black">Client Type</TableHead>
                  <TableHead className="text-black">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="flex items-center space-x-4">
                      <span>{client.client_name}</span>
                    </TableCell>
                    <TableCell>{client.client_phone}</TableCell>
                    <TableCell>{client.client_email}</TableCell>
                    <TableCell>{client.client_type}</TableCell>
                    <TableCell className="flex space-x-2">
                      <button
                        className="text-black"
                        onClick={() => {
                          setSelectedClient(client); // Set the selected client
                          setIsEditDrawerOpen(true); // Open the drawer
                        }}
                      >
                        <Pen className="w-4 h-4" />
                      </button>
                      <button
                        className="text-black"
                        onClick={() => deleteClient(client.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Add Client Drawer */}
      <AddClientDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      <EditClientDrawer
        open={isEditDrawerOpen} // Controls whether the drawer is open
        onOpenChange={setIsEditDrawerOpen} // Function to close the drawer
        client={selectedClient} // Pass the selected client for editing
      />
    </div>
  );
}
