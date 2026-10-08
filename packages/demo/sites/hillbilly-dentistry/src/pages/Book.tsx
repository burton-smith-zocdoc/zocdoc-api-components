import { useState } from 'react';
import type { BookingCompleteDetail } from '@zocdoc/api-components';
import { ZdBooking, type ZdBookingElementEvent } from '@zocdoc/api-components/react';

type CompleteEvent = ZdBookingElementEvent<CustomEvent<BookingCompleteDetail>>;

export function Book() {
  const [toast, setToast] = useState<string>();

  return (
    <section className="book" aria-labelledby="book-title">
      <h1 id="book-title">Book a Visit</h1>
      <p>Pick a dentist, pick a time. We'll leave the porch light on.</p>
      <ZdBooking
        modal
        zipCode="11201"
        specialtyId="sp_154"
        onBookingComplete={(event) => {
          // appointmentId and status only. The patient's details are PHI and stay out of the UI (PHI-001).
          const { appointmentId, status } = (event as CompleteEvent).detail;
          setToast(
            status === 'confirmed'
              ? `Yeehaw, you're booked! Confirmation #${appointmentId}.`
              : `Request sent! Confirmation #${appointmentId} — the practice will holler back.`
          );
        }}
        onBookingError={() =>
          setToast('Well, shoot. That booking did not go through — try another time.')
        }
      />
      <div className="toast" role="status" aria-live="polite">
        {toast}
      </div>
    </section>
  );
}
