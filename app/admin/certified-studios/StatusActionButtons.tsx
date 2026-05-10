"use client";

import { useState } from "react";
import { updateCertificationStatusAction } from "./actions";
import T from "@/components/t";

interface StatusActionButtonsProps {
  certId: string;
  currentStatus: string;
}

export default function StatusActionButtons({ certId, currentStatus }: StatusActionButtonsProps) {
  const [isPending, setIsPending] = useState(false);

  const handleUpdate = async (status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'expired') => {
    if (!confirm(`Are you sure you want to change status to ${status}?`)) return;
    
    setIsPending(true);
    try {
      const res = await updateCertificationStatusAction(certId, status);
      if (!res.success) {
        alert("Failed to update: " + res.error);
      }
    } catch (err) {
      alert("An error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="action-group">
      {currentStatus !== 'approved' && (
        <button 
          className="btn-icon" 
          title="Approve" 
          onClick={() => handleUpdate('approved')}
          disabled={isPending}
        >
          ✅
        </button>
      )}
      {currentStatus !== 'pending' && (
        <button 
          className="btn-icon" 
          title="Move to Pending" 
          onClick={() => handleUpdate('pending')}
          disabled={isPending}
        >
          📝
        </button>
      )}
      {currentStatus !== 'suspended' && (
        <button 
          className="btn-icon" 
          title="Suspend" 
          onClick={() => handleUpdate('suspended')}
          disabled={isPending}
        >
          🚫
        </button>
      )}
    </div>
  );
}
