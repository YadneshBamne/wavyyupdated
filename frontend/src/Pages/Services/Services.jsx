import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BarLoader, BeatLoader } from "react-spinners";
import { Navbar } from "../Components/Navbar";
import AddServiceDrawer from "../Components/AddServices";
import EditServiceDrawer from "../Components/EditServiceDrawer";
import AddCategoryDrawer from "../Components/AddCategory";
import AddPackageDrawer from "../Components/AddPackages";
import { APIURL } from "@/url.config";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EllipsisVertical } from "lucide-react";

export default function Services() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isPackageDrawerOpen, setIsPackageDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const navigate = useNavigate();
  const businessId = localStorage.getItem("businessId");

  if (!businessId) {
    navigate("/login");
  }

  const handleServiceAdded = (newService) => {
    setServices((prevServices) => [...prevServices, newService]);
  };

  const handleCategoryAdded = (newCategory) => {
    setCategories((prevCategories) => [...prevCategories, newCategory]);
  };

  const handlePackageAdded = (newPackage) => {
    setPackages((prevPackages) => [...prevPackages, newPackage]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${APIURL}/api/business/${businessId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setServices(data.business_services || []);
        setPackages(data.business_packages || []);
        setCategories([
          { id: 0, name: "All Services" },
          ...data.business_categories,
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = async (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 0) {
      // Show all services
      const response = await fetch(`${APIURL}/api/business/${businessId}`);
      const data = await response.json();
      setServices(data.business_services || []);
    } else {
      // Fetch services for a specific category
      try {
        const response = await fetch(
          `${APIURL}/api/service-categories/${categoryId}/`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setServices(data.services || []);
      } catch (error) {
        console.error("Error fetching services by category:", error);
      }
    }
  };

  const handleDelete = async (serviceId) => {
    try {
      const response = await fetch(`${APIURL}/api/services/${serviceId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        setServices((prevServices) =>
          prevServices.filter((service) => service.id !== serviceId)
        );
        alert("Service deleted successfully!");
      } else {
        const errorData = await response.json();
        alert(`
          Failed to delete service: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("An error occurred while deleting the service.");
    }
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setIsEditDrawerOpen(true);
  };

  const handleServiceUpdated = (updatedService) => {
    setServices((prevServices) =>
      prevServices.map((service) =>
        service.id === updatedService.id ? updatedService : service
      )
    );
  };

  return (
    <div>
      <Navbar />
      <div className="p-4 md:p-8" style={{ minHeight: "calc(100vh - 75px)" }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <h1 className="text-black font-bold text-2xl md:text-3xl">Service Menu</h1>
            <p className="text-gray-500 text-sm md:text-lg">
              View and manage the services offered by your business
            </p>
          </div>
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg"
            onClick={() => setIsDrawerOpen(true)}
          >
            Add Service
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-md mb-6" style={{ border: "2px solid #E4E7EC" }}>
          <div className="flex flex-col md:flex-row items-center p-4 space-y-4 md:space-y-0 md:space-x-4">
            <Input
              type="text"
              placeholder="Search"
              className="w-full md:flex-grow p-3 border border-gray-300 rounded-lg"
            />
            <Input
              type="text"
              placeholder="Filters"
              className="w-full md:flex-grow p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row">
          {/* Sidebar (Categories and Packages) */}
          <div className="w-full md:w-1/4 p-4 space-y-6">
            {/* Categories Section */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              {loading ? (
                <BeatLoader className="mx-auto" color="#CF9FFF" />
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : (
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Button
                        variant={selectedCategory === category.id ? "solid" : "ghost"}
                        className="w-full justify-between"
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        {category.name}
                      </Button>
                    </li>
                  ))}
                  <li>
                    <Button
                      variant="ghost"
                      onClick={() => setIsCategoryDrawerOpen(true)}
                      className="text-purple-700 w-full"
                    >
                      Add Categories
                    </Button>
                  </li>
                </ul>
              )}
            </div>

            {/* Packages Section */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Packages</h2>
              {loading ? (
                <BeatLoader className="mx-auto" color="#CF9FFF" />
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : (
                <ul className="space-y-2">
                  {packages.map((pkg) => (
                    <li key={pkg.id}>
                      <Button variant="ghost" className="w-full justify-between">
                        {pkg.package_name}
                        <span className="bg-gray-300 px-2 py-1 rounded-full">
                          ₹{pkg.package_price}
                        </span>
                      </Button>
                    </li>
                  ))}
                  <li>
                    <Button
                      variant="ghost"
                      onClick={() => setIsPackageDrawerOpen(true)}
                      className="text-purple-700 w-full"
                    >
                      Add Packages
                    </Button>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Services List */}
          <div className="w-full md:w-3/4 p-4">
            {loading ? (
              <BarLoader className="mx-auto" width={"100%"} color="#CF9FFF" />
            ) : error ? (
              <div className="text-red-500 text-center py-10">{error}</div>
            ) : (
              <>
                <h1 className="text-xl font-bold mb-4">
                  {selectedCategory === 0
                    ? "All Services"
                    : categories.find((c) => c.id === selectedCategory)?.name}
                </h1>
                <div className="space-y-4">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className="flex flex-col md:flex-row justify-between items-center p-4 border border-gray-300 rounded-lg"
                    >
                      <div className="flex-1 mb-4 md:mb-0">
                        <h3 className="font-medium">{service.service_name}</h3>
                        <p className="text-sm text-gray-500">
                          {service.duration_in_mins} mins
                        </p>
                      </div>
                      <p className="text-lg font-semibold mb-4 md:mb-0 md:ml-auto md:mr-4">
                        ₹{service.price}
                      </p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline">
                            <EllipsisVertical size="20" className="cursor-pointer" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40">
                          <Button
                            variant="outline"
                            className="w-full mb-2"
                            onClick={() => handleEdit(service)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleDelete(service.id)}
                          >
                            Delete
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Drawers */}
        <AddServiceDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onServiceAdded={handleServiceAdded}
        />
        <EditServiceDrawer
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
          service={selectedService}
          onServiceUpdated={handleServiceUpdated}
        />
        <AddCategoryDrawer
          open={isCategoryDrawerOpen}
          onOpenChange={setIsCategoryDrawerOpen}
          onCategoryAdded={handleCategoryAdded}
        />
        <AddPackageDrawer
          open={isPackageDrawerOpen}
          onOpenChange={setIsPackageDrawerOpen}
          onPackageAdded={handlePackageAdded}
        />
      </div>
    </div>
  );
}