import type { SchoolData } from "./schema";

export function suggestedGrantPct(school: SchoolData, magi: number): number {
  for (const band of school.typicalGrantBands) {
    if (band.magiMax === null || magi <= band.magiMax) {
      return (band.grantPctMin + band.grantPctMax) / 2;
    }
  }
  return 0;
}

export function stickerForAge(school: SchoolData, age: number): number {
  const gradeForAge = Math.max(0, age - 5);
  const key = gradeForAge === 0 ? "K" : String(gradeForAge);
  const table = school.stickerByGrade;
  if (key in table) return table[key];
  const fallbackKeys = Object.keys(table);
  return table[fallbackKeys[fallbackKeys.length - 1]];
}

export interface KidACost {
  sticker: number;
  grantPct: number;
  netTuition: number;
  fees: number;
  aftercareYearly: number;
  total: number;
}

export function computeKidACost(school: SchoolData, age: number, grantPct: number): KidACost {
  const sticker = stickerForAge(school, age);
  const netTuition = sticker * (1 - grantPct);
  const fees = school.feesExtraYearly;
  const aftercareYearly = school.aftercareMonthly * 10;
  return {
    sticker,
    grantPct,
    netTuition,
    fees,
    aftercareYearly,
    total: netTuition + fees + aftercareYearly,
  };
}

export interface KidBCost {
  tuition: number;
  therapy: number;
  total: number;
}

export function computeKidBCost(placement: string, tuitionYearly: number, therapyMonthly: number): KidBCost {
  let tuition = 0;
  switch (placement) {
    case "publicIEP":
    case "publicSpecial":
    case "privateDistrictFunded":
      tuition = 0;
      break;
    case "privateSelfPay":
    case "jewishDayWithSupport":
      tuition = tuitionYearly;
      break;
  }
  const therapy = therapyMonthly * 12;
  return { tuition, therapy, total: tuition + therapy };
}
