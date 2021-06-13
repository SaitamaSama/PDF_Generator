const generateBid = require("./src/bid");

const bidDetails = {
  bid: {
    status: "completed",
    isActive: true,
    isDeleted: false,
    attachments: ["https://keyboardchecker.com/"],
    associatedBank: [
      {
        accountNumber: "11324124",
        ifscCode: "KKBK0006747",
        branchName: "DURGAPUR, Kotak Mahindra Bank",
        accountHolderName: "Gourab Nag",
      },
    ],
    _id: "60c361408b267100152410e0",
    idAddedBy: "60888145d5355500150eb66e",
    idBid: {
      vendors: ["60c35f3c335eb500154411c0"],
      revisions: [],
      isActive: true,
      isDeleted: false,
      _id: "60c361408b267100152410dd",
      idAddedBy: "60888145d5355500150eb66e",
      idProject: "60c35b5a335eb50015441167",
      idOrg: "60b0af36a301aa00150f585e",
      namePackage: "Bid ha",
      bidNumber: "162341710447160888",
      itemDescription: "Change lost chameleon",
      nameCategory: null,
      status: "active",
      deadLine: "2021-06-12T13:12:04.627Z",
      desiredDeliveryDate: "2021-06-30T13:12:06.606Z",
      typeOrder: "PO",
      billingAddress: "Bye here comes chungus",
      attachments: [],
      createdAt: "2021-06-11T13:12:32.099Z",
      updatedAt: "2021-06-11T13:12:32.099Z",
      __v: 0,
    },
    idOrg: {
      _id: "60b0af36a301aa00150f585e",
      name: "Gourab Nag Org.",
      address: "Kolkata, West Bengal",
    },
    idVendor: {
      _id: "60c35f3c335eb500154411c0",
      billingAddress: null,
      name: "Best Vendor Ever",
    },
    idUser: "60c35f3c335eb500154411bf",
    additionalCharges: [],
    bids: [
      {
        _id: "60c3755c4380fe001523dccb",
        idBoq: "60c35bd6335eb50015441173",
        price: 100,
        tax: {
          value: 17.099999999999998,
          type: "18-igst",
        },
        discount: 5,
        bidAmount: 1121,
      },
      {
        _id: "60c3755c4380fe001523dccc",
        idBoq: "60c35bd6335eb50015441177",
        price: 300,
        tax: {
          value: 48.6,
          type: "18-cgst-sgst",
        },
        discount: 30,
        bidAmount: 9558,
      },
    ],
    createdAt: "2021-06-11T13:12:32.562Z",
    updatedAt: "2021-06-11T14:38:20.180Z",
    __v: 1,
    estimatedDeliveryDate: "2021-11-06T00:00:00.000Z",
    finalPrice: 10679,
    signImageUrl:
      "https://www.meckeys.com/wp-content/uploads/2021/06/Flamingo_keycaps_T01WA201.jpg",
    termsAndConditions: "Okay please pay me by time alright? OwO UwU!!",
  },
  items: [
    {
      isActive: true,
      isDeleted: false,
      _id: "60c361408b267100152410de",
      idAddedBy: "60888145d5355500150eb66e",
      idBid: "60c361408b267100152410dd",
      idBoq: {
        boms: [],
        isPoRaised: false,
        isDeleted: false,
        isActive: true,
        _id: "60c35bd6335eb50015441173",
        idAddedBy: "60888145d5355500150eb66e",
        idProject: "60c35b5a335eb50015441167",
        name: "boq_item_1",
        categoryName: "name_1",
        description: "This is the item description",
        unit: "grams",
        make: "NA",
        quantity: 10,
        quantityRemaining: null,
        quantityProcessed: null,
        utilizedBudget: 0,
        pendingBudget: 2000,
        costPrice: 200,
        sellingPrice: 300,
        poPrice: null,
        actionRecommended: null,
        status: null,
        createdAt: "2021-06-11T12:49:26.648Z",
        updatedAt: "2021-06-11T12:49:26.648Z",
        __v: 0,
      },
      createdAt: "2021-06-11T13:12:32.327Z",
      updatedAt: "2021-06-11T13:12:32.327Z",
      __v: 0,
    },
    {
      isActive: true,
      isDeleted: false,
      _id: "60c361408b267100152410df",
      idAddedBy: "60888145d5355500150eb66e",
      idBid: "60c361408b267100152410dd",
      idBoq: {
        boms: [],
        isPoRaised: false,
        isDeleted: false,
        isActive: true,
        _id: "60c35bd6335eb50015441177",
        idAddedBy: "60888145d5355500150eb66e",
        idProject: "60c35b5a335eb50015441167",
        name: "boq_item_3",
        categoryName: "name_3",
        description: "This is the item description",
        unit: "grams",
        make: "NA",
        quantity: 30,
        quantityRemaining: null,
        quantityProcessed: null,
        utilizedBudget: 0,
        pendingBudget: 12000,
        costPrice: 400,
        sellingPrice: 500,
        poPrice: null,
        actionRecommended: null,
        status: null,
        createdAt: "2021-06-11T12:49:26.648Z",
        updatedAt: "2021-06-11T12:49:26.648Z",
        __v: 0,
      },
      createdAt: "2021-06-11T13:12:32.327Z",
      updatedAt: "2021-06-11T13:12:32.327Z",
      __v: 0,
    },
  ],
};

const taxBreakups = {};
let taxableAmount = 0;
let totalDiscount = 0;
let totalTax = 0;
let totalAmount = 0;
bidDetails.bid.bids.forEach((bid) => {
  const tax = bid.tax;
  const boq = bidDetails.items.find((item) => item.idBoq._id === bid.idBoq);

  if (tax.type.includes("igst")) {
    const percent = Math.ceil((tax.value / bid.price) * 100).toFixed(1);
    if (taxBreakups[`IGST@${percent}%`]) {
      taxBreakups[`IGST@${percent}%`] += (
        tax.value * boq.idBoq.quantity
      ).toFixed(2);
    } else {
      taxBreakups[`IGST@${percent}%`] = (
        tax.value * boq.idBoq.quantity
      ).toFixed(2);
    }
  } else {
    const percent = Math.ceil(((tax.value / bid.price) * 100) / 2).toFixed(1);
    if (taxBreakups[`CGST@${percent}%`]) {
      taxBreakups[`CGST@${percent}%`] += (
        (tax.value / 2) *
        boq.idBoq.quantity
      ).toFixed(2);
    } else {
      taxBreakups[`CGST@${percent}%`] = (
        (tax.value / 2) *
        boq.idBoq.quantity
      ).toFixed(2);
    }
    if (taxBreakups[`SGST@${percent}%`]) {
      taxBreakups[`SGST@${percent}%`] += (
        (tax.value / 2) *
        boq.idBoq.quantity
      ).toFixed(2);
    } else {
      taxBreakups[`SGST@${percent}%`] = (
        (tax.value / 2) *
        boq.idBoq.quantity
      ).toFixed(2);
    }
  }

  taxableAmount += bid.price * boq.idBoq.quantity;
  totalDiscount += bid.discount * boq.idBoq.quantity;
  totalTax += tax.value * boq.idBoq.quantity;
  totalAmount += (bid.price - bid.discount + tax.value) * boq.idBoq.quantity;
});
bidDetails.bid.additionalCharges.forEach((charge) => {
  taxBreakups[charge.label] = parseFloat(charge.value).toFixed(2);
  totalAmount += parseFloat(charge.value);
});
if (bidDetails.bid.additionalDiscount) {
  taxBreakups["Other Discount"] = bidDetails.bid.additionalDiscount.toFixed(2);
  totalAmount -= bidDetails.bid.additionalDiscount;
}
taxBreakups["Taxable Amount"] = taxableAmount.toFixed(2);
taxBreakups["Net Discount"] = (
  totalDiscount -
  (bidDetails.bid.additionalDiscount ? bidDetails.bid.additionalDiscount : 0)
).toFixed(2);
taxBreakups["Net Tax"] = totalTax.toFixed(2);
taxBreakups["Total Amount"] = totalAmount.toFixed(2);

const headers = [
  "S. No.",
  "BoQ Item",
  "Quantity",
  "Price",
  "Discount",
  "Tax",
  "Amount",
];

generateBid({
  ...bidDetails,
  table: {
    headers,
    rows: bidDetails.items.map((item, index) => {
      const bidItem = bidDetails.bid.bids.find(
        (bid) => bid.idBoq === item.idBoq._id
      );

      return [
        index,
        item.idBoq.name,
        item.idBoq.quantity,
        bidItem.price,
        bidItem.discount,
        bidItem.tax.value,
        bidItem.bidAmount,
      ];
    }),
  },
  taxBreakups,
});
