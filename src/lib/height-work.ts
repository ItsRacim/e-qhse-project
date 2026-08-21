export type YesNo = "" | "oui" | "non";

export type HeightWorkDetails = {
  description: string;
  permitFolio: string;
  workDate: string;
  endDate: string;
  riskAnalysis: {
    existing: YesNo;
    farNumber: string;
  };
  fallRisk: {
    eliminationAuSol: boolean;
    protectionCollectiveFixe: boolean;
    protectionCollectiveTemporaire: boolean;
    futureImprovements: string;
  };
  protectionSystems: {
    retenueDeChute: boolean;
    stopChuteEnrouleur: boolean;
    arretDeChute: boolean;
    travauxSurCordes: boolean;
  };
  anchorRules: {
    validationPointAncrage: boolean;
    validationTirantAir: boolean;
    verificationEtatPointAncrage: boolean;
    confirmationBalissage: boolean;
  };
  rescue: {
    effectifMinimum: boolean;
    supervisionPermanente: boolean;
    kitSauvetage: boolean;
    besoinNacelle: YesNo;
  };
  personnel: {
    name: string;
    harnessSerial: string;
    trainingDate: string;
  }[];
  closing: {
    chargeDesTravaux: { name: string };
    responsableSecurite: { name: string };
  };
};

export function emptyHeightWorkDetails(): HeightWorkDetails {
  return {
    description: "",
    permitFolio: "",
    workDate: "",
    endDate: "",
    riskAnalysis: { existing: "", farNumber: "" },
    fallRisk: {
      eliminationAuSol: false,
      protectionCollectiveFixe: false,
      protectionCollectiveTemporaire: false,
      futureImprovements: "",
    },
    protectionSystems: {
      retenueDeChute: false,
      stopChuteEnrouleur: false,
      arretDeChute: false,
      travauxSurCordes: false,
    },
    anchorRules: {
      validationPointAncrage: false,
      validationTirantAir: false,
      verificationEtatPointAncrage: false,
      confirmationBalissage: false,
    },
    rescue: {
      effectifMinimum: false,
      supervisionPermanente: false,
      kitSauvetage: false,
      besoinNacelle: "",
    },
    personnel: [],
    closing: {
      chargeDesTravaux: { name: "" },
      responsableSecurite: { name: "" },
    },
  };
}

export function parseHeightWorkDetails(
  raw: string | null | undefined
): HeightWorkDetails | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as HeightWorkDetails;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}