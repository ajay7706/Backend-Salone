import { Star } from "lucide-react";

const StarRating = ({ rating, count }: { rating: number; count?: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground"}`}
        />
      ))}
      <span className="text-sm text-primary font-semibold ml-1">{rating}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count} Reviews)</span>}
    </div>
  );
};

export default StarRating;
