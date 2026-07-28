// ============================================================
// فهرس الطبقات المرجعية
// يجمع مراجع كل نوع عقد + المرجع القانوني العام المشترك،
// ويوفّر نصاً منسّقاً تُحقن به مطالبات الوكلاء (Grounding).
// ============================================================

import { financingReferences } from "./financing.js";
import { rentalReferences } from "./rental.js";
import { investmentReferences } from "./investment.js";
import { legalReferences } from "./legal.js";

export const REFERENCES = {
  financing: financingReferences,
  rental: rentalReferences,
  investment: investmentReferences,
  legal: legalReferences,
};

// يعيد قواعد النوع + القواعد القانونية العامة
export function getReferences(contractKey) {
  const typeRef = REFERENCES[contractKey];
  const rules = [
    ...(typeRef ? typeRef.rules : []),
    ...legalReferences.rules,
  ];
  const authorities = [
    ...(typeRef ? typeRef.authorities : []),
    ...legalReferences.authorities,
  ];
  return { rules, authorities };
}

/**
 * يبني نصاً منسّقاً بالمراجع لحقنه في مطالبة الوكيل.
 * @param {string} contractKey  rental | financing | investment
 * @returns {string}
 */
export function referencesText(contractKey) {
  const { rules, authorities } = getReferences(contractKey);
  if (!rules.length) return "";
  const lines = rules.map(
    (r) => `- [${r.authority}] ${r.topic}: ${r.rule} (المرجع: ${r.benchmark})`
  );
  return (
    `مراجع تنظيمية سعودية موثّقة (الجهات: ${authorities.join("، ")}).\n` +
    `استند إليها في تحليلك، وقارن بنود العقد بها، واستشهد بالجهة عند رصد أي مخالفة:\n` +
    lines.join("\n")
  );
}
