import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { RegisterUser } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

const registerUser = async (userData: RegisterUser) => {
  const formData = new FormData();

  // Append user data to FormData
  Object.entries(userData).forEach(([key, value]) => {
    formData.append(key, value.toString());
  });

  console.log("Form data: ",formData, "User data: ", userData);

  const response = await axios.post("/api/users/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    age: 0,
    contactNumber: "",
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Please login to continue",
      });
      navigate("/login");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/users/register', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log("Response:", response.data);

      const { accessToken, refreshToken } = response.data;
      
            Cookies.remove('accessToken'); // Clear existing
            Cookies.remove('refreshToken');
      
            
            Cookies.set('accessToken', accessToken, {
              path: '/'
            });
            
            Cookies.set('refreshToken', refreshToken, {
              path: '/'
            });
            
            // Verify cookies were set
            const storedAccessToken = Cookies.get('accessToken');
            // console.log("Stored access token:", storedAccessToken);
            
            if (!storedAccessToken) {
              throw new Error('Failed to set cookies');
            }
      
      toast({
        title: "Registration successful",
        description: "Please login to continue",
      });
      
      navigate('/login');
    } catch (error) {
      toast({
        title: "Registration failed",
        description:"Something went wrong",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              s === step
                ? "bg-[#99B898] text-white"
                : s < step
                ? "bg-[#99B898]/20 text-[#99B898]"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
          </div>
          {s < 3 && (
            <div
              className={`w-16 h-0.5 ${
                s < step ? "bg-[#99B898]" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4A5859]" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pl-10 border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4A5859]" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pl-10 border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                  placeholder="Create a password"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="18"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  className="border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4A5859]" />
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                    className="pl-10 border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F3] px-4 py-8">
      <Card className="w-full max-w-md p-8 bg-white border border-[#E8B4A2]/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2A363B]">Create Account</h1>
          <p className="text-[#4A5859] mt-2">
            Step {step} of 3:{" "}
            {step === 1
              ? "Personal Info"
              : step === 2
              ? "Account Details"
              : "Additional Info"}
          </p>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="border-[#99B898] text-[#99B898] hover:bg-[#99B898]/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-[#99B898] hover:bg-[#7a9479] text-white ml-auto"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Registering..." : "Register"}
              </Button>
            )}
          </div>
        </form>

        <p className="text-center mt-6 text-[#4A5859]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#99B898] hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
