import { ReactGoogleReviews } from "react-google-reviews";
import "react-google-reviews/dist/index.css";

export function Reviews() {
    const featurableId = import.meta.env.VITE_FEATURABLE_WIDGET_ID;
  return (
    <ReactGoogleReviews
      layout="carousel"
      featurableId={featurableId}
      showDots={false}
      reviewVariant="testimonial"
      maxCharacters={60}
      averageRating={5}
    />
  );
}