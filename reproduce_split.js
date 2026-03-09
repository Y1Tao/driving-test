
const line = "A.安全第一、预防为主、综合治理       B.安全发展、源头防范、综合治理";
const parts = line.split(/([A-F][.、])/);
console.log('Parts:', parts);

const options = [];
for (let i = 1; i < parts.length; i += 2) {
    const label = parts[i].replace(/[.、]/, '');
    const content = parts[i+1].trim();
    options.push(`${label}. ${content}`);
}
console.log('Options:', options);
