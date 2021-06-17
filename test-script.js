const generateInvoiceFromPowo = require("./src/pupeteer-invoice");

const details = {
  message: "Powo sent!",
  powo: {
    gst: 0,
    attachments: [],
    freightCharges: 0,
    oneToMany: false,
    isApproved: false,
    isDiscarded: false,
    isDeclined: false,
    isActive: true,
    _id: "60c302a554435365212f101e",
    idAddedBy: "6071bd0e0a19e0001571b137",
    idProject: "609bdaf9815b3f0015a5ed7e",
    idOrg: {
      _id: "60970bed58c68a0015f3e067",
      imgUrl:
        "https://mysite-user-images.s3.ap-south-1.amazonaws.com/1620284314416",
      address: "Addr",
      pin: "713206",
      gst: "AWGFGST",
    },
    idVendor: {
      _id: "60c06c0903fcf60015f80d54",
      name: "Vendor",
      billingAddres: "billadrs",
      pincode: "713206",
      gstin: "gsting",
      pan: "pan",
    },
    isDraft: null,
    buyersName: "54321Org",
    deliveryDate: "2021-06-10T18:30:00.000Z",
    location: "bihar patna",
    createdBy: "5432109876",
    orderType: "PO",
    vendorName: "54321Vendor",
    poNumber: "54321-2021-379",
    gstType: "1",
    gstNumber: 1,
    totalPayment: 38880,
    paymentAtDelivery: 100,
    termsAndConditions: "opop",
    customPaymentTerms: [],
    customPaymentCharges: [],
    paymentAfterInvoice: null,
    paymentBeforeDelivery: null,
    paymentAfterInvoiceDays: null,
    approvedHierarchy:
      '[{"approver":"60a24e36255f4d00150b988c","isApproved":false,"threshold":0,"priority":0},{"approver":"60b371cd7561150015d9ee76","isApproved":false,"threshold":432,"priority":1},{"approver":"6079389682759a001590ca42","isApproved":false,"threshold":12300,"priority":2}]',
    createdAt: "2021-06-11T06:28:53.284Z",
    updatedAt: "2021-06-11T06:28:53.284Z",
    __v: 0,
  },
  powoItems: [
    {
      idBoms: [],
      isActive: true,
      isDeleted: false,
      _id: "60c302a554435365212f1020",
      idAddedBy: "6071bd0e0a19e0001571b137",
      idProject: "609bdaf9815b3f0015a5ed7e",
      idPowo: "60c302a554435365212f101e",
      idBoq: {
        _id: "60bdfeef3aca0d407074b1b4",
        name: "Test boq item",
        category: "Category",
        description: "Description",
        unit: "Unit",
        make: "Make",
        quantity: 45,
        costPrice: 6000,
      },
      tax: {
        type: "18-igst",
        value: 18,
      },
      discount: 50,
      idVendor: "60c06c0903fcf60015f80d54",
      createdAt: "2021-06-11T06:28:53.340Z",
      updatedAt: "2021-06-11T06:28:53.340Z",
      __v: 0,
    },
  ],
};

generateInvoiceFromPowo(details.powo, details.powoItems);
