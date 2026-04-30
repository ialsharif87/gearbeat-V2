"use client";

import { useState } from "react";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/client";

export default function AddReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const supabase = createClient();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const safeRating = Math.max(1, Math.min(5, Number(rating || 5)));
    const safeComment = comment.trim();

    if (!productId) {
      setErrorMessage("Missing product id.");
      setLoading(false);
      return;
    }

    if (!safeComment) {
      setErrorMessage("Please write a comment before submitting.");
      setLoading(false);
      return;
    }

    if (safeComment.length > 2000) {
      setErrorMessage("Comment is too long. Maximum is 2000 characters.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("Please login to leave a review.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("marketplace_reviews").insert({
      product_id: productId,
      customer_auth_user_id: user.id,
      rating: safeRating,
      comment: safeComment,
    });

    if (error) {
      console.error("Review insert error:", error);
      setErrorMessage(
        "Could not submit your review. Please try again later."
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div
        className="card"
        style={{
          textAlign: "center",
          background: "rgba(0,255,136,0.05)",
          borderColor: "#00ff88",
        }}
      >
        <h4 style={{ color: "#00ff88" }}>
          <T en="Review submitted!" ar="تم إرسال المراجعة!" />
        </h4>
        <p>
          <T
            en="Thank you for sharing your feedback."
            ar="شكرًا لمشاركة رأيك معنا."
          />
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: 40 }}>
      <h3>
        <T en="Leave a Review" ar="أضف مراجعة" />
      </h3>

      <form
        onSubmit={handleSubmit}
        style={{ marginTop: 20, display: "grid", gap: 20 }}
      >
        <div>
          <label>
            <T en="Rating" ar="التقييم" />
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                style={{
                  fontSize: "1.5rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  opacity: rating >= star ? 1 : 0.25,
                }}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        <div>
          <label>
            <T en="Your Comment" ar="تعليقك" />
          </label>

          <textarea
            className="input"
            rows={4}
            required
            maxLength={2000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What did you think of this gear?"
          />

          <div
            style={{
              marginTop: 6,
              fontSize: "0.8rem",
              color: "var(--muted)",
              textAlign: "right",
            }}
          >
            {comment.length}/2000
          </div>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            style={{
              color: "#ff4d4d",
              background: "rgba(255,77,77,0.08)",
              border: "1px solid rgba(255,77,77,0.25)",
              borderRadius: 10,
              padding: 12,
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <T en="Submitting..." ar="جاري الإرسال..." />
          ) : (
            <T en="Submit Review" ar="إرسال المراجعة" />
          )}
        </button>
      </form>
    </div>
  );
}
