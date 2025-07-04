import { Star, MessageSquarePlus } from "lucide-react"; // Removed ThumbsUp
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useParams } from "react-router-dom";
import { User } from "../../types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Review {
  _id: string;
  reviewer: User;
  rating: number;
  comment?: string;
  createdAt: string;
}

interface ReviewSubmission {
  rating: number;
  comment: string;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
}

const CARD_COLORS = [
  "bg-[#F8E5D5]",
  "bg-[#E8F5E9]",
  "bg-[#E3F2FD]",
  "bg-[#FFF3E0]",
];

export const ProductReviews = ({ productId, reviews }: ProductReviewsProps) => {
  // Removed unused likedReviews, setLikedReviews, handleLike function
  // Removed unused isSubmitting, setIsSubmitting state
  // Removed unused handleSubmitReview function (mutation is used)
  // Removed unused isDialogOpen state (isOpen is used for the dialog)
  const [rating, setRating] = useState(0); // Default to 0, user must select
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Controls the review dialog visibility
  const { id: paramId } = useParams(); // This is the product ID from the URL
  const queryClient = useQueryClient();

  // Ensure we use the productId prop if available, otherwise fallback to URL param.
  // This component might be used in contexts where productId is directly passed.
  const currentProductId = productId || paramId;

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: ReviewSubmission) => {
      // API endpoint should be specific to adding a review for an *item*
      // Assuming it's /api/items/:itemId/reviews or similar, based on item.controller.js structure
      // The original /api/reviews/${id}/reviews was ambiguous if 'id' was item or review.
      // Let's assume the 'id' from useParams is indeed the item's ID.
      const response = await axios.post(
        `/api/items/${currentProductId}/review`, // Corrected API endpoint to match typical item reviews
        reviewData,
        // TODO: Add Authorization header with token if this endpoint is protected
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", currentProductId] });
      setIsOpen(false); // Correctly close the dialog using the 'isOpen' state
      setRating(0);    // Reset rating to initial/default
      setComment("");  // Reset comment
      // Consider adding a success toast message here
    },
    onError: (error) => {
      // Consider adding an error toast message here
      console.error("Failed to submit review:", error);
      // Example: toast({ title: "Error", description: "Could not submit review.", variant: "destructive" });
    }
  });

  // The handleLike and handleSubmitReview functions were unused and have been removed.
  // The dialog's submit button directly calls submitReviewMutation.mutate.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#2A363B]">Customer Reviews</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#99B898] hover:bg-[#7a9479]">
              <MessageSquarePlus className="mr-2 h-5 w-5" />
              Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Experience</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <div>
                <p className="mb-2 font-medium">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          value <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 font-medium">Your Review</p>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="min-h-[120px] resize-none"
                />
              </div>
              <Button
                onClick={() => submitReviewMutation.mutate({ rating, comment })}
                disabled={submitReviewMutation.isPending}
                className="w-full"
              >
                {submitReviewMutation.isPending
                  ? "Submitting..."
                  : "Submit Review"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <h3 className="text-xl font-semibold text-[#2A363B] mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Be the first to share your experience with this product!
          </p>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#99B898] hover:bg-[#7a9479]">
                <MessageSquarePlus className="mr-2 h-5 w-5" />
                Write the First Review
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            console.log("Review is ",review),
            <div
              key={review._id}
              className={`${
                CARD_COLORS[index % CARD_COLORS.length]
              } p-4 rounded-lg`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-[#2A363B]">
                    {review.reviewer.firstName} {review.reviewer.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400" />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-[#2A363B]">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
