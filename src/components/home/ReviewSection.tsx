import { ReactGoogleReviews } from "react-google-reviews";
import "react-google-reviews/dist/index.css";

export function Reviews() {
  const featurableId = import.meta.env.VITE_FEATURABLE_WIDGET_ID;

  return (
    <div className="reviews-carousel-shell">
      <ReactGoogleReviews
        layout="carousel"
        featurableId={featurableId}
        showDots={false}
        reviewVariant="testimonial"
        maxCharacters={60}
        averageRating={5}
        maxItems={3}
        carouselClassName="reviews-carousel"
        carouselBtnClassName="reviews-carousel-button"
        carouselBtnLeftClassName="reviews-carousel-button-left"
        carouselBtnRightClassName="reviews-carousel-button-right"
        carouselCardClassName="reviews-carousel-slide"
        reviewCardClassName="reviews-card"
      />
    </div>
  );
}
