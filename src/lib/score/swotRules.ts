import { peopleInReach } from "./reach";
import { formatApprox } from "@/lib/format";
import type { CachedMarketRoom } from "./marketRoomCache";

export type SwotKind = "strength" | "opportunity" | "weakness" | "threat";
export type SwotSource = "Census 2011" | "Opportunity Analysis" | "Your answers";

export interface SwotPoint {
  id: string;
  kind: SwotKind;
  text: string;
  todo?: string;
  source: SwotSource;
  link?: string;
}

export interface BuildSwotInput {
  geo?: { densityPerSqKm: number; densityBasis: "rural" | "total"; districtName: string } | null;
  marketRoom?: CachedMarketRoom | null;
  stage?: "new" | "running";
  loanRange?: "under1L" | "1to5L" | "5to15L" | "above15L" | "notSure";
  geoNotCovered?: boolean;
}

export function buildSwot(input: BuildSwotInput): { helps: SwotPoint[]; hurts: SwotPoint[] } {
  const helps: SwotPoint[] = [];
  const hurts: SwotPoint[] = [];

  // 1. Demand (Census 2011) - 10 km reach
  if (input.geo && typeof input.geo.densityPerSqKm === "number" && isFinite(input.geo.densityPerSqKm)) {
    const people10 = peopleInReach(input.geo.densityPerSqKm, 10);
    const approx = formatApprox(people10).replace(/^about\s+/i, "");

    if (people10 >= 50_000) {
      helps.push({
        id: "demandHigh",
        kind: "opportunity",
        text: `Plenty of people nearby — about ${approx} within 10 km.`,
        source: "Census 2011",
      });
    } else if (people10 < 20_000) {
      hurts.push({
        id: "demandLow",
        kind: "threat",
        text: `Fewer people nearby — about ${approx} within 10 km.`,
        todo: "Plan to deliver further, or sell at weekly markets.",
        source: "Census 2011",
      });
    }
  }

  // 2. Competition (Opportunity Analysis)
  if (input.marketRoom) {
    switch (input.marketRoom.verdict) {
      case "goodRoom":
        helps.push({
          id: "competitionGoodRoom",
          kind: "opportunity",
          text: "Few similar sellers for the number of people nearby.",
          source: "Opportunity Analysis",
        });
        break;
      case "noSellersFound":
        helps.push({
          id: "competitionNoSellers",
          kind: "opportunity",
          text: "No similar sellers found on the map nearby.",
          todo: "Many village shops aren't on online maps — visit the area to check.",
          source: "Opportunity Analysis",
        });
        break;
      case "someRoom":
        hurts.push({
          id: "competitionSomeRoom",
          kind: "threat",
          text: "Some competition already nearby.",
          todo: "Find out what nearby sellers don't offer, and offer that.",
          source: "Opportunity Analysis",
        });
        break;
      case "crowded":
      case "manySellers":
        hurts.push({
          id: "competitionCrowded",
          kind: "threat",
          text: "Many similar sellers nearby.",
          todo: "Visit them before you invest; consider a different product or spot.",
          source: "Opportunity Analysis",
        });
        break;
    }
  } else {
    if (input.geoNotCovered) {
      hurts.push({
        id: "competitionNotAvailable",
        kind: "threat",
        text: "Competition can't be checked for your area yet.",
        todo: "Your state isn't covered in this prototype yet — visit the area and count similar shops yourself.",
        source: "Opportunity Analysis",
      });
    } else {
      hurts.push({
        id: "competitionNotChecked",
        kind: "threat",
        text: "Competition not checked yet.",
        todo: "Open Opportunity Analysis to check sellers near you.",
        link: "/module1/opportunity-analysis",
        source: "Opportunity Analysis",
      });
    }
  }

  // 3. Stage (Your answers)
  if (input.stage === "running") {
    helps.push({
      id: "stageRunning",
      kind: "strength",
      text: "You already run this business — you have customers and experience.",
      source: "Your answers",
    });
  } else if (input.stage === "new") {
    hurts.push({
      id: "stageNew",
      kind: "weakness",
      text: "New business — no customers yet.",
      todo: "Start small and test with a few customers before taking the full loan.",
      source: "Your answers",
    });
  }

  // 4. Loan Range (Your answers)
  if (input.loanRange === "above15L") {
    hurts.push({
      id: "loanAbove15L",
      kind: "weakness",
      text: "The money you need may be above the NBCFDC General Loan limit.",
      todo: "Check Scheme Match, or start with a smaller plan.",
      source: "Your answers",
    });
  } else if (input.loanRange === "notSure") {
    hurts.push({
      id: "loanNotSure",
      kind: "weakness",
      text: "You haven't worked out how much money you need.",
      todo: "Use the Loan Planner to list your costs.",
      source: "Your answers",
    });
  }

  return {
    helps: helps.slice(0, 3),
    hurts: hurts.slice(0, 3),
  };
}
