import { ReactGoogleReviews } from "react-google-reviews";
import "react-google-reviews/dist/index.css";
import { useEffect, useState } from "react";

function getReviewsPerPage() {
  if (typeof window === "undefined") {
    return 3;
  }

  if (window.matchMedia("(max-width: 640px)").matches) {
    return 1;
  }

  if (window.matchMedia("(max-width: 900px)").matches) {
    return 2;
  }

  return 3;
}

function useReviewsPerPage() {
  const [reviewsPerPage, setReviewsPerPage] = useState(() =>
    getReviewsPerPage()
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let animationFrameId = 0;
    const updateReviewsPerPage = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        setReviewsPerPage(getReviewsPerPage());
      });
    };

    updateReviewsPerPage();
    window.addEventListener("resize", updateReviewsPerPage);
    window.addEventListener("orientationchange", updateReviewsPerPage);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateReviewsPerPage);
      window.removeEventListener("orientationchange", updateReviewsPerPage);
    };
  }, []);

  return reviewsPerPage;
}

export function Reviews() {
  const featurableId = import.meta.env.VITE_FEATURABLE_WIDGET_ID;
  const reviewsPerPage = useReviewsPerPage();

  return (
    <div className="reviews-carousel-shell">
      <ReactGoogleReviews
        key={`reviews-carousel-${reviewsPerPage}`}
        layout="carousel"
        featurableId={featurableId}
        showDots={false}
        reviewVariant="testimonial"
        maxCharacters={60}
        averageRating={5}
        maxItems={reviewsPerPage}
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
