/* global Zocdoc */
/*
 * Fills the roster from one provider search. `zd-provider-card` renders a `provider` object
 * rather than an id, so the server renders the container and its search parameters and this
 * script hands each card its data. Plain JS, no build — the IIFE bundle's `Zocdoc` global is
 * all it needs.
 */
(async () => {
  const roster = document.getElementById('roster');
  const list = roster.querySelector('.roster-list');
  const status = roster.querySelector('.roster-status');
  const { zipCode, specialtyId, insurancePlanId } = roster.dataset;

  try {
    const { providerLocations } = await Zocdoc.searchProviderLocations({
      zipCode,
      specialtyId,
      insurancePlanId: insurancePlanId || undefined,
    });

    if (providerLocations.length === 0) {
      status.textContent = 'Our leaders are all in a strategy session. Please check back.';
      return;
    }

    for (const location of providerLocations) {
      const item = document.createElement('li');
      const card = document.createElement('zd-provider-card');
      card.provider = location;
      card.addEventListener('profile-request', () => {
        window.location.href = `/leaders/${encodeURIComponent(location.provider_location_id)}`;
      });
      const link = document.createElement('a');
      link.href = `/leaders/${encodeURIComponent(location.provider_location_id)}`;
      link.className = 'roster-link';
      link.textContent = 'View profile & book';
      item.append(card, link);
      list.append(item);
    }
    status.textContent = `${providerLocations.length} thought leaders available.`;
  } catch {
    // Never the error's own text (CLIENT-003).
    status.textContent = 'We hit a synergy blocker loading our leaders. Please refresh.';
  }
})();
