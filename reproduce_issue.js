
const line = "A.安全第一、预防为主、综合治理       B.安全发展、源头防范、综合治理";
const matches = [...line.matchAll(/([A-F])[.、]/g)];

console.log(`Line: "${line}"`);
console.log(`Matches found: ${matches.length}`);

for (const match of matches) {
    console.log(`Match: ${match[0]}, Index: ${match.index}`);
}

const line2 = "C.安全发展、风险管控、综合治理       D.安全第一、预防为主、系统管理";
const matches2 = [...line2.matchAll(/([A-F])[.、]/g)];
console.log(`Line2: "${line2}"`);
console.log(`Matches2 found: ${matches2.length}`);
