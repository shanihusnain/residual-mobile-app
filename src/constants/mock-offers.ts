import { formatAed } from "@/constants/mock-listings";

export type OfferPipelineStatus =
  | "Reviewing"
  | "Countered"
  | "Declined"
  | "Accepted";

export type OfferItem = {
  id: string;
  propertyLabel: string;
  location: string;
  broker: string;
  brokerFirm: string;
  offerAmount: number;
  listedPrice: number;
  /** Percent vs listed, e.g. -2.5 */
  differencePercent: number;
  receivedRelative: string;
  receivedAt: string;
  status: OfferPipelineStatus;
  buyerLabel: string;
  paymentMethod: string;
  proposedTransferDate: string;
  financeClause: string;
  loggedBy: string;
  buyer: {
    reference: string;
    nationality: string;
    financePreApproved: string;
    viaBroker: string;
  };
  linkedProperty: {
    label: string;
    location: string;
    owner: string;
    listedBy: string;
  };
  financialImpact: {
    projectedNet: number;
    ownerSharePercent: number;
    ownerShare: number;
    residualSharePercent: number;
    residualShare: number;
    note: string;
  };
};

export const MOCK_OFFERS: OfferItem[] = [
  {
    id: "off-1",
    propertyLabel: "Burj Vista — Apt 1402",
    location: "Downtown Dubai",
    broker: "Hamad Al Suwaidi",
    brokerFirm: "Prime Residential LLC",
    offerAmount: 4_300_000,
    listedPrice: 4_400_000,
    differencePercent: -2.27,
    receivedRelative: "2 days ago",
    receivedAt: "13 Feb 2026, 11:42 AM",
    status: "Reviewing",
    buyerLabel: "Buyer A",
    paymentMethod: "Cash",
    proposedTransferDate: "30 Apr 2026",
    financeClause: "No",
    loggedBy: "Sara Mahmoud",
    buyer: {
      reference: "Buyer A — anonymised",
      nationality: "UAE National",
      financePreApproved: "N/A Cash buyer",
      viaBroker: "Hamad Al Suwaidi — Prime Residential LLC",
    },
    linkedProperty: {
      label: "Burj Vista — Apt 1402",
      location: "Downtown Dubai",
      owner: "Maktoum bin Mohammed",
      listedBy: "Hamad Al Suwaidi",
    },
    financialImpact: {
      projectedNet: 770_000,
      ownerSharePercent: 60,
      ownerShare: 462_000,
      residualSharePercent: 40,
      residualShare: 308_000,
      note: "Based on agreed profit-split. Final figures subject to DLD transfer costs.",
    },
  },
  {
    id: "off-2",
    propertyLabel: "Palm Jumeirah — Villa 48",
    location: "Palm Jumeirah",
    broker: "Nadia Rahman",
    brokerFirm: "Gold Coast Brokers",
    offerAmount: 17_900_000,
    listedPrice: 18_500_000,
    differencePercent: -3.24,
    receivedRelative: "1 day ago",
    receivedAt: "14 Feb 2026, 09:15 AM",
    status: "Countered",
    buyerLabel: "Buyer B",
    paymentMethod: "Mortgage",
    proposedTransferDate: "15 May 2026",
    financeClause: "Yes — 30 days",
    loggedBy: "Omar Khalid",
    buyer: {
      reference: "Buyer B — anonymised",
      nationality: "British",
      financePreApproved: "Yes — Emirates NBD",
      viaBroker: "Nadia Rahman — Gold Coast Brokers",
    },
    linkedProperty: {
      label: "Palm Jumeirah — Villa 48",
      location: "Palm Jumeirah",
      owner: "Maktoum bin Mohammed",
      listedBy: "Nadia Rahman",
    },
    financialImpact: {
      projectedNet: 2_600_000,
      ownerSharePercent: 60,
      ownerShare: 1_560_000,
      residualSharePercent: 40,
      residualShare: 1_040_000,
      note: "Based on agreed profit-split. Final figures subject to DLD transfer costs.",
    },
  },
  {
    id: "off-3",
    propertyLabel: "Downtown Views — 1202",
    location: "Downtown Dubai",
    broker: "Rami Farouk",
    brokerFirm: "City Gate Realty",
    offerAmount: 2_450_000,
    listedPrice: 2_450_000,
    differencePercent: 0,
    receivedRelative: "3 days ago",
    receivedAt: "12 Feb 2026, 04:20 PM",
    status: "Accepted",
    buyerLabel: "Buyer C",
    paymentMethod: "Cash",
    proposedTransferDate: "01 Apr 2026",
    financeClause: "No",
    loggedBy: "Sara Mahmoud",
    buyer: {
      reference: "Buyer C — anonymised",
      nationality: "Indian",
      financePreApproved: "N/A Cash buyer",
      viaBroker: "Rami Farouk — City Gate Realty",
    },
    linkedProperty: {
      label: "Downtown Views — 1202",
      location: "Downtown Dubai",
      owner: "Maktoum bin Mohammed",
      listedBy: "Rami Farouk",
    },
    financialImpact: {
      projectedNet: 255_000,
      ownerSharePercent: 60,
      ownerShare: 153_000,
      residualSharePercent: 40,
      residualShare: 102_000,
      note: "Based on agreed profit-split. Final figures subject to DLD transfer costs.",
    },
  },
  {
    id: "off-4",
    propertyLabel: "Marina Gate — Tower 2, 805",
    location: "Dubai Marina",
    broker: "Layla Hassan",
    brokerFirm: "Harbor Homes",
    offerAmount: 2_100_000,
    listedPrice: 2_000_000,
    differencePercent: 5.0,
    receivedRelative: "5 days ago",
    receivedAt: "10 Feb 2026, 02:05 PM",
    status: "Declined",
    buyerLabel: "Buyer D",
    paymentMethod: "Mortgage",
    proposedTransferDate: "20 May 2026",
    financeClause: "Yes — 45 days",
    loggedBy: "Omar Khalid",
    buyer: {
      reference: "Buyer D — anonymised",
      nationality: "UAE National",
      financePreApproved: "Yes — ADCB",
      viaBroker: "Layla Hassan — Harbor Homes",
    },
    linkedProperty: {
      label: "Marina Gate — Tower 2, 805",
      location: "Dubai Marina",
      owner: "Maktoum bin Mohammed",
      listedBy: "Layla Hassan",
    },
    financialImpact: {
      projectedNet: 180_000,
      ownerSharePercent: 60,
      ownerShare: 108_000,
      residualSharePercent: 40,
      residualShare: 72_000,
      note: "Based on agreed profit-split. Final figures subject to DLD transfer costs.",
    },
  },
  {
    id: "off-5",
    propertyLabel: "JLT Cluster X — 2201",
    location: "Jumeirah Lake Towers",
    broker: "Yusuf Ali",
    brokerFirm: "Skyline Brokers",
    offerAmount: 1_850_000,
    listedPrice: 1_900_000,
    differencePercent: -2.63,
    receivedRelative: "1 week ago",
    receivedAt: "08 Feb 2026, 10:30 AM",
    status: "Reviewing",
    buyerLabel: "Buyer E",
    paymentMethod: "Cash",
    proposedTransferDate: "10 Apr 2026",
    financeClause: "No",
    loggedBy: "Sara Mahmoud",
    buyer: {
      reference: "Buyer E — anonymised",
      nationality: "Pakistani",
      financePreApproved: "N/A Cash buyer",
      viaBroker: "Yusuf Ali — Skyline Brokers",
    },
    linkedProperty: {
      label: "JLT Cluster X — 2201",
      location: "Jumeirah Lake Towers",
      owner: "Maktoum bin Mohammed",
      listedBy: "Yusuf Ali",
    },
    financialImpact: {
      projectedNet: 140_000,
      ownerSharePercent: 60,
      ownerShare: 84_000,
      residualSharePercent: 40,
      residualShare: 56_000,
      note: "Based on agreed profit-split. Final figures subject to DLD transfer costs.",
    },
  },
];

export function getOfferById(id: string): OfferItem | undefined {
  return MOCK_OFFERS.find((item) => item.id === id);
}

export function formatDifferencePercent(value: number): string {
  const abs = Math.abs(value).toFixed(1);
  if (value === 0) return "0%";
  return value > 0 ? `+${abs}%` : `−${abs}%`;
}

export function formatDifferenceAmount(
  offerAmount: number,
  listedPrice: number,
): string {
  const diff = offerAmount - listedPrice;
  const formatted = formatAed(Math.abs(diff));
  if (diff === 0) return formatAed(0);
  return diff > 0 ? `+${formatted}` : `−${formatted}`;
}

export { formatAed };
