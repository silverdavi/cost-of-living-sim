import type { Child, ChildPlacement, SchoolData } from "./schema";

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

export interface ChildCost {
  childId: string;
  label: string;
  placement: ChildPlacement;
  schoolName: string;
  sticker: number;
  grantPct: number;
  netTuition: number;
  fees: number;
  aftercareYearly: number;
  therapyYearly: number;
  total: number;
}

const PLACEMENTS_NO_TUITION = new Set<ChildPlacement>([
  "public",
  "publicIEP",
  "publicSpecial",
  "privateDistrictFunded",
]);

export function computeChildCost(
  child: Child,
  jewishSchool: SchoolData | null
): ChildCost {
  const usesJewishSchool =
    (child.placement === "jewishDay" || child.placement === "jewishDayWithSupport") &&
    jewishSchool !== null;
  const therapyYearly = (child.therapyMonthly || 0) * 12;

  if (usesJewishSchool && jewishSchool) {
    const sticker = stickerForAge(jewishSchool, child.age);
    const netTuition = Math.max(0, sticker * (1 - child.grantPct));
    const fees = jewishSchool.feesExtraYearly;
    const aftercareYearly = jewishSchool.aftercareMonthly * 10;
    return {
      childId: child.id,
      label: child.label || child.id,
      placement: child.placement,
      schoolName: jewishSchool.labelKey,
      sticker,
      grantPct: child.grantPct,
      netTuition,
      fees,
      aftercareYearly,
      therapyYearly,
      total: netTuition + fees + aftercareYearly + therapyYearly,
    };
  }

  if (PLACEMENTS_NO_TUITION.has(child.placement)) {
    return {
      childId: child.id,
      label: child.label || child.id,
      placement: child.placement,
      schoolName: "",
      sticker: 0,
      grantPct: 0,
      netTuition: 0,
      fees: 0,
      aftercareYearly: 0,
      therapyYearly,
      total: therapyYearly,
    };
  }

  // privateSelfPay
  const tuition = child.tuitionOverrideYearly;
  return {
    childId: child.id,
    label: child.label || child.id,
    placement: child.placement,
    schoolName: "",
    sticker: tuition,
    grantPct: 0,
    netTuition: tuition,
    fees: 0,
    aftercareYearly: 0,
    therapyYearly,
    total: tuition + therapyYearly,
  };
}
