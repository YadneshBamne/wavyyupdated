import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Navbar } from "../Components/Navbar";
import { GridLoader } from "react-spinners";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { APIURL } from "@/url.config";

const Dashboard = () => {
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(4);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const businessId = localStorage.getItem("businessId");
        if (!businessId) {
          navigate("/login");
        }

        const response = await fetch(`${APIURL}/api/business/${businessId}/?format=json`);
        if (!response.ok) {
          throw new Error("Failed to fetch business data");
        }

        const data = await response.json();
        setBusinessData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <GridLoader color="#E0B0FF" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 font-semibold">Error: {error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="p-4 md:p-8">
        {/* Stats Section */}
        <span className="text-4xl font-semibold">
          Hello,
          <br /> {businessData?.salon_name}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-10">
          {["Total customers", "Members", "Active now"].map((title, index) => {
            const values = [
              businessData?.clients?.length || 0,
              businessData?.business_team_members?.length || 0,
              businessData?.business_appointments?.length || 0,
            ];
            return (
              <Card key={index} className="border border-gray-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm md:text-base text-muted-foreground">{title}</CardTitle>
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{values[index]}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {/* Left Column */}
          <div className="flex-1">
            {/* Services Grid */}
            <h2 className="text-lg md:text-xl font-semibold mb-4">Top services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {businessData?.business_services?.map((service) => (
                <Card key={service.id} className="border border-gray-300 overflow-hidden">
                  <CardContent className="p-4">
                    <img
                      src={service.service_image}
                      alt={service.service_name}
                      className="w-full h-60 object-cover rounded-lg"
                    />
                    <div className="mt-2">
                      <h3 className="font-semibold">{service.service_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Price: <span className="text-purple-600 text-lg font-semibold">${service.price}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full md:w-80 space-y-6">
            {/* Calendar */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
            <Card className="border border-gray-300">
              <CardHeader>
                {/* <CardTitle className="text-sm font-medium">Upcoming appointments</CardTitle> */}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((date) => (
                    <Button
                      key={date}
                      variant={selectedDay === date ? "default" : "ghost"}
                      className={`h-12 md:h-16 p-0 flex flex-col items-center justify-center ${
                        selectedDay === date ? "bg-purple-500 text-white hover:bg-purple-600" : ""
                      }`}
                      onClick={() => setSelectedDay(date)}
                    >
                      <span className="text-xs">{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date - 1]}</span>
                      <span className="text-lg font-bold">{date}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Team Members */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Team Members</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {businessData?.business_team_members?.map((member) => (
                  <Card key={member.id} className="flex flex-col items-center text-center border border-gray-300">
                    <Avatar className="w-14 h-14 mb-6 mt-4">
                      <AvatarImage src={member.profile_img} />
                      <AvatarFallback>{member.first_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm p-1 font-medium text-gray-800">{`${member.first_name} ${member.last_name}`}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Activity Section */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
            <Card className="border border-gray-300">
              <CardHeader>
                {/* <CardTitle className="text-sm font-medium">Activity</CardTitle> */}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessData?.business_appointments
                    ?.sort((a, b) => new Date(`${b.appointment_date}T${b.appointment_time}`) - new Date(`${a.appointment_date}T${a.appointment_time}`))
                    .slice(0, 5)
                    .map((appointment, index) => {
                      const teamMember = businessData.business_team_members?.find(member => member.id === appointment.staff);
                      const service = businessData.business_services?.find(service => service.id === appointment.services[0]);

                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={teamMember?.profile_img} />
                              <AvatarFallback>
                                {teamMember ? `${teamMember.first_name[0]}${teamMember.last_name[0]}` : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{teamMember ? `${teamMember.first_name} ${teamMember.last_name}` : "Unknown Team Member"}</p>
                              <p className="text-sm text-muted-foreground">{service ? service.service_name : "Unknown Service"}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(`${appointment.appointment_date}T${appointment.appointment_time}`).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
