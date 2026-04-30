"use client";

import { useState } from "react";
import T from "./t";
import { createClient } from "../lib/supabase/client";

export default function AddReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
       alert("Please login to leave a review.");
       setLoading(false);
       return;
    }

    const { error } = await supabase
      .from("marketplace_product_reviews")
      .insert({
        product_id: productId,
        customer_auth_user_id: user.id,
        rating,
        comment,
        status: 'approved' // Automatically approve for now
      });

    if (error) {
       console.error(error);
    } else {
       setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="card" style={{ textAlign: 'center', background: 'rgba(0,255,136,0.05)', borderColor: '#00ff88' }}>
        <h4 style={{ color: '#00ff88' }}><T en="Review submitted!" ar="تم إرسال المراجعة!" /></h4>
        <p><T en="Thank you for sharing your feedback." ar="شكراً لمشاركتك رأيك معنا." /></p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: 40 }}>
      <h3><T en="Leave a Review" ar="أضف مراجعة" /></h3>
      <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'grid', gap: 20 }}>
        <div>
          <label><T en="Rating" ar="التقييم" /></label>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star} 
                type="button"
                onClick={() => setRating(star)}
                style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', opacity: rating >= star ? 1 : 0.2 }}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>
        <div>
          <label><T en="Your Comment" ar="تعليقك" /></label>
          <textarea 
            className="input" 
            rows={4} 
            required 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think of this gear?"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <T en="Submitting..." ar="جاري الإرسال..." /> : <T en="Submit Review" ar="إرسال المراجعة" />}
        </button>
      </form>
    </div>
  );
}
