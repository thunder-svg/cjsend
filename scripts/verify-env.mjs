// scripts/verify-env.mjs
const need = ["VITE_API_BASE"];
const miss = need.filter((k)=>!process.env[k]);
if (miss.length) {
  console.error("Missing env:", miss.join(", "));
  process.exit(1);
}
console.log("env ok");
