export const approvedVenues = [
  {
    id: "techmonkey-space",
    name: "TechMonkey Space",
    location: "London",
  },
  {
    id: "cloakroom-studio",
    name: "Cloakroom Studio",
    location: "Manchester",
  },
  {
    id: "central-event-hall",
    name: "Central Event Hall",
    location: "Birmingham",
  },
];

export function getVenueName(venueId?: string) {
  return approvedVenues.find((venue) => venue.id === venueId)?.name ?? approvedVenues[0].name;
}
