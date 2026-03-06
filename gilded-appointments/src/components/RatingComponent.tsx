import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { request } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface RatingProps {
  bookingId: string;
  onRatingSubmit?: () => void;
  serviceId?: string;
}

const RatingComponent = ({ bookingId, onRatingSubmit, serviceId }: RatingProps) => {
  const [rating, setRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [service, setService] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [value, setValue] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) {
      toast({
        title: "Please write a review",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await request(`/api/bookings/${bookingId}/rating`, {
        method: "POST",
        body: JSON.stringify({
          bookingId,
          serviceId,
          rating,
          cleanliness,
          service,
          professionalism,
          value,
          review,
        }),
      });

      toast({
        title: "Thank you for your rating!",
        description: "Your feedback helps us improve.",
      });

      setSubmitted(true);

      // Dispatch event to update ratings on service cards
      window.dispatchEvent(
        new CustomEvent("ratings:updated", {
          detail: { serviceId, rating },
        })
      );

      onRatingSubmit?.();
    } catch (err: any) {
      toast({
        title: "Error submitting rating",
        description: err?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-green-600 fill-green-600" />
        </div>
        <p className="text-lg font-semibold text-foreground">Thank You!</p>
        <p className="text-sm text-muted-foreground">Your rating has been recorded</p>
      </motion.div>
    );
  }

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={24}
              className={`${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-foreground mb-2">Rate Your Experience</h2>
      <p className="text-muted-foreground mb-6">Help us improve our services</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <StarRating
          value={rating}
          onChange={setRating}
          label="Overall Satisfaction"
        />

        {/* Detailed Ratings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StarRating
            value={cleanliness}
            onChange={setCleanliness}
            label="Cleanliness"
          />
          <StarRating value={service} onChange={setService} label="Service Quality" />
          <StarRating
            value={professionalism}
            onChange={setProfessionalism}
            label="Professionalism"
          />
          <StarRating value={value} onChange={setValue} label="Value for Money" />
        </div>

        {/* Review */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Write Your Review
          </label>
          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with us..."
            maxLength={500}
            className="min-h-32"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {review.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full gold-gradient text-primary-foreground font-semibold py-3"
        >
          {loading ? (
            "Submitting..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Rating
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default RatingComponent;
