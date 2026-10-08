/* global Zocdoc */
/*
 * One provider's page. Runs the roster search, finds this location, and hands it to the profile
 * and to `zd-booking`. Setting `providers` to just this location plus `providerLocationId`
 * starts the booking at the time step, with no search in front of it. The id is set when the
 * visitor asks for a time rather than on load, so the dialog doesn't open over the profile
 * before anyone has read it. Closing the dialog clears the id again (`cancel()`), which
 * leaves the page as it was.
 */
(async () => {
  const leader = document.getElementById('leader');
  const status = leader.querySelector('.leader-status');
  const profile = leader.querySelector('zd-provider-profile');
  const bookingWrap = leader.querySelector('.leader-booking');
  const bookButton = bookingWrap.querySelector('.leader-book');
  const booking = bookingWrap.querySelector('zd-booking');
  const missing = leader.querySelector('.leader-missing');
  const { providerLocationId, zipCode, specialtyId, insurancePlanId } = leader.dataset;

  try {
    const { providerLocations } = await Zocdoc.searchProviderLocations({
      zipCode,
      specialtyId,
      insurancePlanId: insurancePlanId || undefined,
    });
    const location = providerLocations.find((l) => l.provider_location_id === providerLocationId);

    if (!location) {
      status.textContent = '';
      missing.hidden = false;
      return;
    }

    const name = Zocdoc.providerHeading(location);
    document.getElementById('leader-title').textContent = `Meet ${name}`;
    document.title = `${name} · Corporate Wellness Synergy Partners LLC`;
    profile.provider = location;
    profile.hidden = false;
    booking.zipCode = zipCode;
    booking.specialtyId = specialtyId;
    booking.insurancePlanId = insurancePlanId || undefined;
    // Set outright rather than left to the booking's own fallback, so availability and the
    // booking request always carry this provider's reason.
    booking.visitReasonId = location.provider.default_visit_reason_id;
    booking.providers = [location];
    bookingWrap.hidden = false;
    status.textContent = '';

    bookButton.addEventListener('click', () => {
      status.textContent = '';
      booking.providerLocationId = location.provider_location_id;
    });
    booking.addEventListener('booking-complete', (event) => {
      // Ids only. Patient details are PHI (PHI-001).
      status.textContent = `Synergy Session secured. Reference ${event.detail.appointmentId}.`;
    });
    booking.addEventListener('booking-error', () => {
      status.textContent = 'That session could not be actioned. Please select another time.';
    });
  } catch {
    status.textContent = 'We hit a synergy blocker loading this leader. Please refresh.';
  }
})();
