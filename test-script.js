const generateInvoice = require("./src/pupeteer-invoice");

const data = [
  {
    ID: 0,
    Name: "boq_item_1",
    Description: "This is the item description",
    Unit: "grams",
    Make: "NA",
    Quantity: 10,
    Price: 180,
    Total: 1800,
  },
  {
    ID: 1,
    Name: "boq_item_9",
    Description: "This is the item description",
    Unit: "grams",
    Make: "NA",
    Quantity: 90,
    Price: 900,
    Total: 81000,
  },
];
const table = {
  headers: Object.keys(data[0]),
  rows: data.map((row) => Object.values(row)),
};
generateInvoice({ table });
