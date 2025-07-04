import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  // CardDescription, // Removed CardDescription
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, Mail, Phone, User } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User as UserType } from "@/types/user";
// import { Review } from "@/types/review";
import axios from "axios";
import Cookies from "js-cookie";
// Removed set from "date-fns";

export interface Review {
    _id: string;
    reviewer: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
  }
  
  interface SellerProfile extends UserType {
    averageRating: number;
    totalReviews: number;
    reviews: Review[];
  }

const SellerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });

  const sellerId = id;
  useEffect(() => {
    console.log("Seller ID from params:", sellerId);


    const fetchSellerProfile = async () => {
      if(!sellerId){
        console.log("No sellerId found in URL params");

       return;
      }  
      try {
        const token = Cookies.get("accessToken");
        console.log("Making request to:", `/api/users/${sellerId}`);
        const response = await axios.get(`/api/users/${sellerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Full Response:", response); // Debug full response
        console.log("Seller profile:", response.data.data);        
        setSeller(response.data.data?.seller);
        setReviews(response.data.data?.seller?.reviews);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to fetch seller profile",
          variant: "destructive",
        });
      }
    };
    // if (sellerId) {
      fetchSellerProfile();
      // fetchSellerReviews();
    // }
  }, [sellerId]);

  const handleSubmitReview = async () => {
    try {
      const token = Cookies.get("accessToken");
      await axios.post(
        `/api/reviews/seller/${sellerId}`,
        {
          sellerId,
          rating: newReview.rating,
          comment: newReview.comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
      
      // Refresh reviews
      const response = await axios.get(`/api/reviews/seller/${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Reviews:", response.data.data);
      setReviews(response.data.data);
      
      // Reset form and close dialog
      setNewReview({ rating: 5, comment: "" });
      setIsReviewDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  console.log("Seller:", seller);
  console.log("Reviews:", reviews);

  const averageRating = reviews.length
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : "No ratings yet";



  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <div className="min-h-screen bg-[#FDF8F3] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="shadow-lg border border-[#E8B4A2]/20">
              <CardHeader className="space-y-1">
                <CardTitle className="text-3xl font-bold tracking-tight text-center text-[#2A363B]">
                  Seller Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-[#99B898]" />
                        <span className="font-medium">
                          {seller?.firstName} {seller?.lastName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-5 w-5 text-[#99B898]" />
                        <span>{seller?.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-5 w-5 text-[#99B898]" />
                        <span>{seller?.contactNumber}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#2A363B]">{seller?.averageRating}</div>
                      <div className="text-sm text-[#4A5859]">Average Rating</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border border-[#E8B4A2]/20">
              <CardHeader className="space-y-1">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold tracking-tight text-[#2A363B]">
                    Reviews
                  </CardTitle>
                  <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#99B898] hover:bg-[#7a9479] text-white">
                        Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                        <DialogDescription>
                          Share your experience with this seller
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-6 w-6 cursor-pointer ${
                                  star <= newReview.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                onClick={() => setNewReview({ ...newReview, rating: star })}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Comment</Label>
                          <Textarea
                            value={newReview.comment}
                            onChange={(e) =>
                              setNewReview({ ...newReview, comment: e.target.value })
                            }
                            placeholder="Write your review here..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <Button
                          className="w-full bg-[#99B898] hover:bg-[#7a9479] text-white"
                          onClick={handleSubmitReview}
                        >
                          Submit Review
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review._id} className="border border-[#E8B4A2]/20">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-[#2A363B]">
                                {review.reviewer.firstName} {review.reviewer.lastName}
                              </p>
                              <p className="text-sm text-[#4A5859]">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, index) => (
                                <Star
                                  key={index}
                                  className={`h-4 w-4 ${
                                    index < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-[#2A363B]">{review.comment}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SellerProfile;
