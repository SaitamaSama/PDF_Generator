const generateInvoiceFromPowo = require("./src/pupeteer-invoice");

const details = {
  powo: {
    attachments: [],
    freightCharges: 50,
    additionalDiscount: 0,
    additionalCharges: 0,
    oneToMany: true,
    isApproved: false,
    isDiscarded: false,
    isDeclined: false,
    isActive: true,
    _id: "60d04b6fd0cc7e46ab9736a0",
    idAddedBy: {
      countryCode: '91',
      reminderEnabled: true,
      notificationEnabled: true,
      moduleAccess: [],
      roles: ["60ce113b7bab1d74d9f9b092"],
      idOrg: ["60ce113b7bab1d74d9f9b08f"],
      isVerified: true,
      isActive: true,
      isFirstLogin: false,
      isWhatsappOptIn: false,
      _id: "6071bd0e0a19e0001571b137",
      username: 'B',
      department: 'FINPPPP',
      designation: 'Lead',
      phone: '2092092092',
      email: 'reachmountainboi@gmail.com',
      createdAt: "2021-04-10T14:58:22.909Z",
      updatedAt: "2021-06-19T15:46:03.935Z",
      __v: 0,
      notificationToken: 'cyOKWqRhKETyKzHFbXqNKV:APA91bEtF7il-TjgYTTjFjM6yyEkoneNxP9OK6VnMVZKkEbvLdcGwh8mLLztdRPVfH43rsFy6WHBoPVOa0KUshz33HCCU5LrjCY5lGQ1Ds59xyyfGxbk3tg--UFMMyHReviO3ZmN8ABg',
      webNotificationToken: 'd-dA6WXlfBSCIuIC3IVWmj:APA91bE5SWLiN83-4qHOy7BrVKLIPHKGvwogbrcUZc6GSzDL3HboH7FPUQY3WiML2mLvhCWHVbwoh0_1DxG3fAjzVC-3bQNp3jWliKdasxU1KNgMuv6CtkE8GvmuiBM1K5tYw6HNL2ww'
    },
    idProject: "60cf5c982da3df001572caa1",
    idOrg: {
      onTrial: true,
      _id: "60970bed58c68a0015f3e067",
      idAddedBy: "60970b3f58c68a0015f3e052",
      name: '54321Org',
      address: 'new bill to',
      imgUrl: 'https://mysite-user-images.s3.ap-south-1.amazonaws.com/1622818101683',
      city: null,
      country: null,
      pan: '543216',
      pin: "123456",
      gst: 'invalid',
      trialStarts: "1970-01-01T00:00:00.008Z",
      trialEnds: "1970-01-01T00:00:00.083Z",
      createdAt: "2021-05-08T22:08:45.647Z",
      updatedAt: "2021-06-21T08:10:08.506Z",
      __v: 86,
    },
    idVendor: {
      vendorType: ['tiles'],
      tags: [],
      isVerified: true,
      isActive: true,
      isDeleted: false,
      _id: "60c2eeeb1cdb2c0015b793be",
      idAddedBy: "60970b3f58c68a0015f3e052",
      idUser: "60c2eeeb1cdb2c0015b793bd",
      idOrg: "60970bed58c68a0015f3e067",
      idProject: "60c2d089ff58c40015bcfdc3",
      vendorName: "194 vendor",
      pincode: null,
      contactPerson: 'yogi',
      designation: 'tie maker',
      phoneNumber: '6005662461',
      emailId: 'reachmountainboi@gmail.com',
      gstin: 'BBBB',
      gstTreatment: null,
      pan: null,
      billingAddress: 'nn',
      bankAccountHoldersName: null,
      bankAccount: null,
      bankIFSC: null,
      paymentTerms: null,
      bomPricing: null,
      uploadedDocuments: null,
      termsAndConditions: null,
      createdAt: "2021-06-11T05:04:43.989Z",
      updatedAt: "2021-06-16T11:37:54.677Z",
    },
    isDraft: null,
    buyersName: '54321Org',
    deliveryDate: "2021-06-19T18:30:00.000Z",
    location: 'asd',
    createdBy: '5432109876 te',
    orderType: 'PO',
    vendorName: '194 vendor',
    poNumber: '54321-2021-683',
    gst: 0,
    gstType: '1',
    gstNumber: 1,
    totalPayment: 1647.15,
    paymentAtDelivery: null,
    termsAndConditions: 'asjkd aksjd lajsl djas',
    customPaymentTerms: [
      {
        _id: "60d04b6fd0cc7e46ab9736a1",
        label: 'Payment before Delivery',
        value: 20
      },
      {
        _id: "60d04b6fd0cc7e46ab9736a2",
        label: 'Payment after Delivery',
        value: 25
      },
      {
        _id: "60d04b6fd0cc7e46ab9736a3",
        label: 'Payment after invoice generation',
        value: 55
      }
    ],
    "paymentAfterInvoice": null,
    "paymentBeforeDelivery": null,
    "paymentAfterInvoiceDays": null,
    "signImageUrl": null,
    "customCharges": [
      {
        _id: "60d04b6fd0cc7e46ab9736a4",
        label: 'Transport Charges',
        value: 50
      }
    ],
    "createdAt": "2021-06-21T08:18:55.285Z",
    "updatedAt": "2021-06-21T08:18:55.285Z",
  }
  ,
  powoItems: [
    {
      idBoms: [{
        "discount": 0.75,
        "isPoRaised": true,
        "isDeleted": false,
        "isActive": true,
        "_id": "60cf74d2f1f0e10015853e78",
        "idAddedBy": "60970b3f58c68a0015f3e052",
        "idBoq": "60cf65d52da3df001572cb99",
        "idOrg": "60970bed58c68a0015f3e067",
        "idProject": "60cf65c82da3df001572cb7d",
        "name": "new bom",
        "categoryName": "sdf",
        "description": "",
        "unit": "",
        "make": "",
        "quantity": 20,
        "costPrice": 5,
        "sellingPrice": 5,
        "poPrice": 15,
        "tax": [{"type": "18% CSGST & SGST", "value": 18, "id": "18-cgst-sgst"}],
        "createdAt": "2021-06-20T17:03:14.672Z",
        "updatedAt": "2021-06-20T17:03:14.672Z",
        "__v": 0
      }],
      isActive: true,
      isDeleted: false,
      _id: "60d04b6fd0cc7e46ab9736a6",
      idAddedBy: "6071bd0e0a19e0001571b137",
      idProject: "60cf5c982da3df001572caa1",
      idPowo: "60d04b6fd0cc7e46ab9736a0",
      idBoq: {
        boms: [Array],
        isPoRaised: true,
        isInBidding: false,
        isDeleted: false,
        isActive: true,
        _id: "60cf65d52da3df001572cb99",
        idAddedBy: "60970b3f58c68a0015f3e052",
        idProject: "60cf65c82da3df001572cb7d",
        name: 'boq_item_10',
        categoryName: 'name_10',
        description: 'This is the item description',
        unit: 'grams',
        make: 'NA',
        quantity: 100,
        utilizedBudget: 3945,
        pendingBudget: 106055,
        costPrice: 1100,
        sellingPrice: 1200,
        actionRecommended: null,
        status: null,
        indent: [],
        createdAt: "2021-06-20T15:59:17.852Z",
        updatedAt: "2021-06-21T08:18:55.395Z",
      },
      idVendor: "60c2eeeb1cdb2c0015b793be",
      tax: [],
      createdAt: "2021-06-21T08:18:55.596Z",
      updatedAt: "2021-06-21T08:18:55.596Z",
    },
    {
      idBoms: [],
      isActive: true,
      isDeleted: false,
      _id: "60d04b6fd0cc7e46ab9736a7",
      idAddedBy: "6071bd0e0a19e0001571b137",
      idProject: "60cf5c982da3df001572caa1",
      idPowo: "60d04b6fd0cc7e46ab9736a0",
      idBoq: {
        boms: [],
        isPoRaised: true,
        isInBidding: false,
        isDeleted: false,
        isActive: true,
        _id: "60cf5cb52da3df001572caba",
        idAddedBy: "60970b3f58c68a0015f3e052",
        idProject: "60cf5c982da3df001572caa1",
        name: 'boq_item_2',
        categoryName: 'name_2',
        description: 'This is the item description',
        unit: 'grams',
        make: 'NA',
        quantity: 20,
        utilizedBudget: 26112,
        pendingBudget: -20112,
        costPrice: 300,
        sellingPrice: 400,
        poPrice: 40,
        actionRecommended: null,
        status: null,
        indent: [],
        createdAt: "2021-06-20T15:20:21.085Z",
        updatedAt: "2021-06-21T08:18:55.454Z",
        __v: 0,
        discount: 1.6
      },
      tax: [{_id: "60d04da4c92e6347364047c3", type: '5% CGST & SGST', value: 5}],
      discount: 1.6,
      idVendor: "60c2eeeb1cdb2c0015b793be",
      createdAt: "2021-06-21T08:18:55.597Z",
      updatedAt: "2021-06-21T08:18:55.597Z",
    }
  ]
  ,
};

let call = async () => {
  let res = await generateInvoiceFromPowo(details.powo, details.powoItems);
  console.log(res);
}
call();
