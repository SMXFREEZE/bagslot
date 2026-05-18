// Source-of-truth for city photography. Falls back to a generic skyline.
// All images are remote (Unsplash featured photos) and rendered via <Image unoptimized />.

const map: Record<string, string> = {
  paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=70&auto=format&fit=crop",
  london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=70&auto=format&fit=crop",
  tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=70&auto=format&fit=crop",
  "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=70&auto=format&fit=crop",
  nyc: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=70&auto=format&fit=crop",
  "los angeles": "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200&q=70&auto=format&fit=crop",
  la: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200&q=70&auto=format&fit=crop",
  montreal: "https://images.unsplash.com/photo-1519178614-68673b201f36?w=1200&q=70&auto=format&fit=crop",
  toronto: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=1200&q=70&auto=format&fit=crop",
  lisbon: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=70&auto=format&fit=crop",
  "mexico city": "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&q=70&auto=format&fit=crop",
  "san francisco": "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=1200&q=70&auto=format&fit=crop",
  sf: "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=1200&q=70&auto=format&fit=crop",
  barcelona: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=70&auto=format&fit=crop",
  amsterdam: "https://images.unsplash.com/photo-1534351590666-13e3e96c5017?w=1200&q=70&auto=format&fit=crop",
  berlin: "https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=1200&q=70&auto=format&fit=crop",
  rome: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200&q=70&auto=format&fit=crop",
  dubai: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=70&auto=format&fit=crop",
  istanbul: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=70&auto=format&fit=crop",
  bangkok: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=70&auto=format&fit=crop",
  singapore: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1200&q=70&auto=format&fit=crop",
};

const fallback =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=70&auto=format&fit=crop";

export function destinationImage(city: string): string {
  if (!city) return fallback;
  const key = city.trim().toLowerCase();
  return map[key] ?? fallback;
}

export const FEATURED_CITIES = [
  { city: "Paris", country: "France" },
  { city: "London", country: "UK" },
  { city: "Tokyo", country: "Japan" },
  { city: "New York", country: "USA" },
  { city: "Lisbon", country: "Portugal" },
  { city: "Barcelona", country: "Spain" },
  { city: "Mexico City", country: "Mexico" },
  { city: "Bangkok", country: "Thailand" },
];
