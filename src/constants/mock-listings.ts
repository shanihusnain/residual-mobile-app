export type ListingStatus = "Under Offer" | "On Market" | "Sold" | "Withdrawn";

export type OfferStatus = "Pending" | "Accepted" | "Rejected" | "Withdrawn";

export type PortalStatus = "Live" | "Draft" | "Expired";

export type ListingOffer = {
  id: string;
  broker: string;
  amount: number;
  difference: number;
  received: string;
  status: OfferStatus;
};

export type LinkedPortal = {
  id: string;
  name: string;
  price: number;
  status: PortalStatus;
  /** Portal preview details */
  imageUrl: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  availableFrom: string;
  furnishing: string;
  pricePerSqft: number;
  areaSqft: number;
  priceDropPercent: number;
  monthlyFrom?: number;
};

export type Listing = {
  id: string;
  projectLabel: string;
  location: string;
  amount: number;
  broker: string;
  ownerName: string;
  offersCount: number;
  status: ListingStatus;
  highestOffer: number;
  listedPrice: number;
  details: {
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    parkingBays: number;
    area: string;
    floor: string;
    listedDate: string;
    daysOnMarket: number;
    dldPermit: string;
    permitExpiry: string;
  };
  financials: {
    originalValue: number;
    renoSpend: number;
    totalCostBasis: number;
    listedPrice: number;
    grossUpliftEst: number;
  };
  linkedPortals: LinkedPortal[];
  offers: ListingOffer[];
};

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "lst-1",
    projectLabel: "Burj Vista — Apt 1402",
    location: "Downtown Dubai",
    amount: 3_250_000,
    broker: "Dubai Realtors",
    ownerName: "Maktoum bin Mohammed",
    offersCount: 3,
    status: "Under Offer",
    highestOffer: 3_180_000,
    listedPrice: 3_250_000,
    details: {
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 3,
      parkingBays: 1,
      area: "1,240 sqft",
      floor: "14",
      listedDate: "15 Jan 2026",
      daysOnMarket: 45,
      dldPermit: "DLD-784512",
      permitExpiry: "15 Jul 2026",
    },
    financials: {
      originalValue: 2_800_000,
      renoSpend: 180_000,
      totalCostBasis: 2_980_000,
      listedPrice: 3_250_000,
      grossUpliftEst: 270_000,
    },
    linkedPortals: [
      {
        id: "pf-1",
        name: "Property Finder",
        price: 3_250_000,
        status: "Live",
        imageUrl:
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
        bedrooms: 2,
        bathrooms: 3,
        propertyType: "Apartment",
        availableFrom: "Immediate",
        furnishing: "Unfurnished",
        pricePerSqft: 2621,
        areaSqft: 1240,
        priceDropPercent: 0,
        monthlyFrom: 14_850,
      },
      {
        id: "bayut-1",
        name: "Bayut",
        price: 3_250_000,
        status: "Live",
        imageUrl:
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
        bedrooms: 2,
        bathrooms: 3,
        propertyType: "Apartment",
        availableFrom: "Immediate",
        furnishing: "Unfurnished",
        pricePerSqft: 2621,
        areaSqft: 1240,
        priceDropPercent: 0,
        monthlyFrom: 14_850,
      },
      {
        id: "dubizzle-1",
        name: "Dubizzle",
        price: 3_200_000,
        status: "Live",
        imageUrl:
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
        bedrooms: 2,
        bathrooms: 3,
        propertyType: "Apartment",
        availableFrom: "Immediate",
        furnishing: "Unfurnished",
        pricePerSqft: 2581,
        areaSqft: 1240,
        priceDropPercent: 1.5,
        monthlyFrom: 14_620,
      },
    ],
    offers: [
      {
        id: "o1",
        broker: "Harbor Homes",
        amount: 3_180_000,
        difference: -70_000,
        received: "28 Feb 2026",
        status: "Pending",
      },
      {
        id: "o2",
        broker: "Palm Realty",
        amount: 3_100_000,
        difference: -150_000,
        received: "20 Feb 2026",
        status: "Rejected",
      },
      {
        id: "o3",
        broker: "Skyline Brokers",
        amount: 3_050_000,
        difference: -200_000,
        received: "12 Feb 2026",
        status: "Withdrawn",
      },
    ],
  },
  {
    id: "lst-2",
    projectLabel: "Palm Jumeirah — Villa 48",
    location: "Palm Jumeirah",
    amount: 18_500_000,
    broker: "Al Faris Real Estate",
    ownerName: "Maktoum bin Mohammed",
    offersCount: 1,
    status: "On Market",
    highestOffer: 17_900_000,
    listedPrice: 18_500_000,
    details: {
      propertyType: "Villa",
      bedrooms: 5,
      bathrooms: 6,
      parkingBays: 3,
      area: "6,699 sqft",
      floor: "G+2",
      listedDate: "02 Feb 2026",
      daysOnMarket: 28,
      dldPermit: "DLD-991203",
      permitExpiry: "02 Aug 2026",
    },
    financials: {
      originalValue: 14_200_000,
      renoSpend: 1_100_000,
      totalCostBasis: 15_300_000,
      listedPrice: 18_500_000,
      grossUpliftEst: 3_200_000,
    },
    linkedPortals: [
      {
        id: "pf-2",
        name: "Property Finder",
        price: 37_500_000,
        status: "Live",
        imageUrl:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
        bedrooms: 5,
        bathrooms: 6,
        propertyType: "Villa",
        availableFrom: "23 Jul 2026",
        furnishing: "Unfurnished",
        pricePerSqft: 5597,
        areaSqft: 6699,
        priceDropPercent: 0,
        monthlyFrom: 134_553,
      },
      {
        id: "bayut-2",
        name: "Bayut",
        price: 37_500_000,
        status: "Live",
        imageUrl:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
        bedrooms: 5,
        bathrooms: 6,
        propertyType: "Villa",
        availableFrom: "23 Jul 2026",
        furnishing: "Unfurnished",
        pricePerSqft: 5597,
        areaSqft: 6699,
        priceDropPercent: 0,
        monthlyFrom: 134_553,
      },
      {
        id: "dubizzle-2",
        name: "Dubizzle",
        price: 37_500_000,
        status: "Live",
        imageUrl:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
        bedrooms: 5,
        bathrooms: 6,
        propertyType: "Villa",
        availableFrom: "23 Jul 2026",
        furnishing: "Unfurnished",
        pricePerSqft: 5597,
        areaSqft: 6699,
        priceDropPercent: 0,
        monthlyFrom: 134_553,
      },
    ],
    offers: [
      {
        id: "o4",
        broker: "Coastal Estates",
        amount: 17_900_000,
        difference: -600_000,
        received: "25 Feb 2026",
        status: "Pending",
      },
    ],
  },
  {
    id: "lst-3",
    projectLabel: "Downtown Views — 1202",
    location: "Downtown Dubai",
    amount: 2_450_000,
    broker: "Emaar Brokers",
    ownerName: "Maktoum bin Mohammed",
    offersCount: 6,
    status: "On Market",
    highestOffer: 2_410_000,
    listedPrice: 2_450_000,
    details: {
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      parkingBays: 1,
      area: "1,180 sqft",
      floor: "12",
      listedDate: "10 Dec 2025",
      daysOnMarket: 82,
      dldPermit: "DLD-552811",
      permitExpiry: "10 Jun 2026",
    },
    financials: {
      originalValue: 2_100_000,
      renoSpend: 95_000,
      totalCostBasis: 2_195_000,
      listedPrice: 2_450_000,
      grossUpliftEst: 255_000,
    },
    linkedPortals: [
      {
        id: "pf-3",
        name: "Property Finder",
        price: 2_450_000,
        status: "Live",
        imageUrl:
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "Apartment",
        availableFrom: "Immediate",
        furnishing: "Semi-furnished",
        pricePerSqft: 2076,
        areaSqft: 1180,
        priceDropPercent: 0,
        monthlyFrom: 11_200,
      },
    ],
    offers: [
      {
        id: "o5",
        broker: "City Gate Realty",
        amount: 2_410_000,
        difference: -40_000,
        received: "01 Mar 2026",
        status: "Pending",
      },
      {
        id: "o6",
        broker: "Marina Homes",
        amount: 2_380_000,
        difference: -70_000,
        received: "22 Feb 2026",
        status: "Pending",
      },
    ],
  },
];

export function formatAed(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE")}`;
}

export function getListingById(id: string): Listing | undefined {
  return MOCK_LISTINGS.find((item) => item.id === id);
}

export function getPortalById(
  listingId: string,
  portalId: string,
): LinkedPortal | undefined {
  return getListingById(listingId)?.linkedPortals.find((p) => p.id === portalId);
}
