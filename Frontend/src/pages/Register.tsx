import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
import Cookies from "js-cookie";

const CAS_LOGIN_URL = "https://login.iiit.ac.in/cas/login";
const SERVICE_URL = `${window.location.origin}/register/callback`;
const FORM_DATA_KEY = "registrationFormData";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(() => {
    // Try to load saved form data from sessionStorage
    const savedData = sessionStorage.getItem(FORM_DATA_KEY);
    return savedData ? JSON.parse(savedData) : {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      age: 0,
      contactNumber: "",
    };
  });

  useEffect(() => {
    // Save form data to sessionStorage whenever it changes
    sessionStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const validateAndRegister = async (ticket: string) => {
      try {
        setIsLoading(true);
        
        // Load saved form data
        const savedFormData = sessionStorage.getItem(FORM_DATA_KEY);
        if (!savedFormData) {
          toast({
            title: "Registration failed",
            description: "Form data not found. Please try registering again.",
            variant: "destructive",
          });
          navigate("/register");
          return;
        }

        const formDataObj = JSON.parse(savedFormData);
        
        // First validate the CAS ticket
        const validationResponse = await axios.post("/api/users/validate-cas", {
          ticket,
          service: SERVICE_URL
        });
        
        const { email: casEmail } = validationResponse.data;
        
        // Check if the email matches
        if (casEmail !== formDataObj.email) {
          toast({
            title: "Verification failed",
            description: "The email used for registration doesn't match your IIIT email",
            variant: "destructive",
          });
          navigate("/register");
          return;
        }

        // If email matches, proceed with registration
        const response = await axios.post('/api/users/register', formDataObj, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { accessToken, refreshToken } = response.data;
        
        // Remove existing cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        
        // Set cookies with 30-day expiration
        Cookies.set('accessToken', accessToken, {
          path: '/',
          expires: 30 // 30 days
        });
        
        Cookies.set('refreshToken', refreshToken, {
          path: '/',
          expires: 30 // 30 days
        });
        
        // Clear saved form data after successful registration
        sessionStorage.removeItem(FORM_DATA_KEY);
        
        toast({
          title: "Registration successful",
          description: "Welcome to IIITMarket!",
        });
        
        navigate('/profile');
        
      } catch (error) {
        console.error('Registration error:', error);
        toast({
          title: "Registration failed",
          description: error.response?.data?.message || "Something went wrong",
          variant: "destructive",
        });
        navigate("/register");
      } finally {
        setIsLoading(false);
      }
    };

    // Handle CAS callback
    const ticket = new URLSearchParams(location.search).get("ticket");
    if (ticket && location.pathname === "/register/callback") {
      validateAndRegister(ticket);
    }
  }, [location, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save form data before redirecting
    sessionStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
    
    // Redirect to CAS login
    const casUrl = `${CAS_LOGIN_URL}?service=${encodeURIComponent(SERVICE_URL)}`;
    window.location.href = casUrl;
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            className={`flex items-center ${
              num !== 3 ? "flex-1" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= num
                  ? "bg-[#99B898] text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {step > num ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                num
              )}
            </div>
            {num !== 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  step > num ? "bg-[#99B898]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <div className="relative">
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </>
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
              <Button
                type="submit"
                className="bg-[#99B898] hover:bg-[#7a9479] text-white ml-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Register"
                )}
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