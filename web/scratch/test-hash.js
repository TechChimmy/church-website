const bcrypt = require('bcryptjs');

const hash = "$2a$10$aMe/FAx0LaxXkjoYBheK9eHaSzkld0VSEHVhhGA2IgmCCkaYY542a";

async function run() {
  const p1 = "churchwebpage@2026";
  const p2 = "churchadmin@2026";
  console.log(`Matches "${p1}":`, await bcrypt.compare(p1, hash));
  console.log(`Matches "${p2}":`, await bcrypt.compare(p2, hash));
}

run().catch(console.error);
