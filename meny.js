// Menyn från stagedoor.se/meny (jan 2025). (G) gluten, (L) laktos, (N) nötter. Engelska uttryck med engelsk versalisering.
const STAGE_MENU = [
  { title: "Starters & Sharers", items: [
    { name: "Gratinerade nachos", desc: "Gräddfil, tomatsalsa, pico de gallo", price: "129 kr", extra: "+ chiligryta med köttfärs 149 kr", tags: "L" },
    { name: "Barsnacks", desc: "Ölkorv, oliver, goudaost, nachos, aïoli", price: "139 kr", tags: "L" },
    { name: "Mixplate", desc: "Lökringar, Mozzarella Sticks, pommes frites, aïoli", price: "139 kr", tags: "L G" },
    { name: "Hot Wings", desc: "Frank’s Hot Sauce, aïoli. Välj mellan 6, 12 eller 18 vingar", price: "79 / 149 / 219 kr", tags: "L" },
  ]},
  { title: "The Classics", items: [
    { name: "Smashed Burger Classic", desc: "Högrev & bringa, cheddarost, bacon glacerat med lönnsirap. Serveras med pommes och aïoli", price: "199 kr", tags: "G L" },
    { name: "Smashed Burger Mexican", desc: "Högrev & bringa, cheddarost, pico de gallo, Frank’s Hot Sauce. Serveras med pommes och aïoli", price: "199 kr", tags: "G L" },
    { name: "Smashed Burger Vegan Classic", desc: "Vegansk burgare. Serveras med pommes och aïoli", price: "199 kr", tags: "G L" },
    { name: "Smashed Burger Vegan Mexican", desc: "Vegansk burgare, pico de gallo, Frank’s Hot Sauce. Serveras med pommes och aïoli", price: "199 kr", tags: "G L" },
    { name: "Baby Back Ribs", desc: "Ribs, pommes frites, Cole Slaw, majs", price: "299 kr", tags: "L" },
    { name: "Caesarsallad", desc: "Romansallad, kyckling, krutonger, tomat, bacon, Grana Padano, caesardressing", price: "199 kr", tags: "G L" },
    { name: "Pasta med kyckling", desc: "Penne, lök, chili, kyckling, krämig vitvinssås", price: "199 kr", tags: "G L" },
    { name: "Fish & Chips", desc: "Med remouladsås", price: "199 kr", tags: "G L" },
  ]},
  { title: "Desserts", items: [
    { name: "Friterad camembert", desc: "Persilja, hjortronsylt", price: "99 kr", tags: "G L N" },
    { name: "Choklad glassbakelse", desc: "Chokladglass, hasselnöt, sabayonne", price: "119 kr", tags: "G L N" },
  ]},
];
