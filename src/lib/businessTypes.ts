import { BusinessType } from "@/lib/profile/types";

export const BUSINESS_TYPE_INFO: Record<BusinessType, { label: string; nearbyKeywords: string[] }> = {
  farmSupplies: { label: "Farm supplies", nearbyKeywords: ["seeds"] },
  dairyAnimals: { label: "Dairy and animals", nearbyKeywords: ["dairy"] },
  foodMaking: { label: "Food making", nearbyKeywords: ["bakery"] },
  tailoring: { label: "Tailoring and clothes", nearbyKeywords: ["tailor"] },
  smallShop: { label: "Small shop", nearbyKeywords: ["kirana"] },
  repairServices: { label: "Repair and services", nearbyKeywords: ["hardware"] },
  other: { label: "Your business", nearbyKeywords: [] },
};
