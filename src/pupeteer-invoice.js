// import puppeteer, { PDFMargin } from "puppeteer";
// import { template } from "lodash";
// import { promises as fs } from "fs";
// import { resolve, join } from "path";
// import { getData } from "./data-provider";
const puppeteer = require("puppeteer");
const { template, ..._ } = require("lodash");
const { promises: fs, readFileSync } = require("fs");
const { resolve, join } = require("path");
const { getData } = require("./data-provider");
const csvjson = require("csvjson");
const imageToBase64 = require("image-to-base64");

const data = getData();

function getTotalDataSet(data) {
  const taxData = data
    .filter((item) => item["Description"] !== "Total")
    .map((item) => ({
      Tax_percent: parseFloat(item["Tax_percent"]) * 100,
      Tax: parseInt(item["Tax_num"], 10),
    }));
  const taxableAmount = data.find((item) => item["Description"] === "Total")
    .Price;
  const totalAmount = data.find((item) => item["Description"] === "Total").Tax;
  const grouped = _.groupBy(taxData, "Tax_percent");
  const rows = [];
  Object.keys(grouped).map((key) => {
    const sum = grouped[key]
      .map((i) => i.Tax)
      .reduce((totalTax, tax) => {
        totalTax += tax;
        return totalTax;
      });
    const percent = parseFloat(key);
    if (isNaN(percent)) return;

    rows.push({
      "#": "",
      Description: "",
      Unit: "",
      Quantity: "",
      Make: "",
      Price: "",
      Tax: `SGST@${(percent / 2).toFixed(1)}`,
      Total: (sum / 2).toFixed(2),
      class: "tax-breakdown",
    });
    rows.push({
      "#": "",
      Description: "",
      Unit: "",
      Quantity: "",
      Make: "",
      Price: "",
      Tax: `CST@${(percent / 2).toFixed(1)}`,
      Total: (sum / 2).toFixed(2),
      class: "tax-breakdown",
    });
  });
  rows.unshift({
    "#": "",
    Description: "",
    Unit: "",
    Quantity: "",
    Make: "",
    Price: "",
    Tax: `Taxable Amount`,
    Total: taxableAmount,
    class: "tax-breakdown",
  });
  rows.push({
    "#": "",
    Description: "",
    Unit: "",
    Quantity: "",
    Make: "",
    Price: "",
    Tax: `Taxable Amount`,
    Total: totalAmount,
    class: "total-end",
  });

  return rows;
}

async function process({
  poDetails,
  vendorDetails,
  itemDetails,
  extra,
  image,
  billDetails,
  shippingDetails,
}) {
  const logo = await imageToBase64(image);
  const header = `
  <header style="
    font-family: Roboto, Inter, sans-serif;
    display: flex;
    width: 557px;
    border: 1px solid transparent;
    border-bottom: none;
    margin-left: 18px;
  ">
      <!--<div
        style="
          font-size: 18px;
          margin: 32px 22px;
          flex-grow: 1;
          font-weight: 700;
        "
      >
        ${poDetails.buyersName}
      </div> -->
      <div style="margin: 32px 22px; flex-grow: 1; display: flex; align-items: center;">
        <img
          style="
            max-width: 175px;
            height: 25px;
          "
          src="data:image/${image.split(".").pop()};base64,${logo}"
        />
      </div>
      <div
        style="
          font-size: 7px;
          margin: 32px 38px;
          line-height: 2;
        "
      >
        <section style="">
          <div style="display: flex">
            <div style="width: 90px">Purchase Order#</div>
            <div style="width: 150px">: ${poDetails.poNumber}</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Order Date</div>
            <div style="width: 150px">: ${new Date(
              poDetails.createdAt
            ).toDateString()}</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Delivery Date</div>
            <div style="width: 150px">: ${new Date(
              poDetails.deliveryDate
            ).toDateString()}</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Purchaser</div>
            <div style="width: 150px">: ${poDetails.createdBy}</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Contact Details</div>
            <div style="width: 150px">: ${poDetails.contact}</div>
          </div>
        </section>
      </div>
    </header>
    `;
  const footer = `
    <footer style="
      font-size: 6px;
      color: #E7E6E6;
      width: 557px;
      border: 1px solid transparent;
      border-top: none;
      margin-left: 18px;
    ">
      <div style="text-align: left; padding-left: 16px;">
        Page <span class="pageNumber"></span> /
        <span class="totalPages"></span>
      </div>
      <div style="text-align: center; margin-bottom: 5px;">
        Powered by mysiteapp.co
      </div>
    </footer>
  `;

  const templateConfig = {
    // Bill:
    bill_name: billDetails.name,
    bill_address: billDetails.address,
    bill_pincode: billDetails.pincode,
    bill_gst: billDetails.gst,
    // Vendor
    vendor_name: vendorDetails.name,
    vendor_address: vendorDetails.billingAddress,
    vendor_pincode: vendorDetails.pincode,
    vendor_gst: vendorDetails.gstin,
    vendor_pan: vendorDetails.pan,
    // Shipping
    shipping_name: shippingDetails.name,
    shipping_address: shippingDetails.address,
    shipping_pincode: shippingDetails.pincode,
    // Table items
    table_items: [],
    // Terms and condition
    terms: extra.termsAndConditions.split("\n").map((term) => term.trim()),
  };

  const total = getTotalDataSet(itemDetails);
  const midTotal = itemDetails.find((item) => item.Description === "Total");
  const midTotalIndex = itemDetails.indexOf(midTotal);
  itemDetails[midTotalIndex] = {
    ...midTotal,
    class: "mid-total",
  };
  const file = template(
    (
      await fs.readFile(
        resolve(join(__dirname, "..", "template", "invoice.template.html"))
      )
    ).toString()
  );
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(
    file({
      ...templateConfig,
      table_items: [...itemDetails, ...total],
    })
  );
  await page.evaluateHandle("document.fonts.ready");

  await page.pdf({
    path: "pup-doc.pdf",
    format: "a4",
    margin: {
      top: "200px",
      bottom: "45px",
      right: "25px",
      left: "25px",
    },
    headerTemplate: header,
    footerTemplate: footer,
    displayHeaderFooter: true,
  });
  await browser.close();
}

process({
  image: resolve(join("images", "logo.png")),
  itemDetails: csvjson
    .toObject(readFileSync(resolve(join("src", "data.csv"))).toString())
    .map((item) => ({
      ...item,
      class: "",
    })),
  poDetails: data.powo[0],
  vendorDetails: data.vendor.Vendors[0],
  extra: {
    termsAndConditions: data.powo[0].termsAndConditions,
  },
  billDetails: {
    name: "Flipspaces Technology Labs Private Limited (UP)",
    address:
      "1st Floor, C-25, Sector -8, NOIDA, Gautam Buddha Nagar, Uttar Pradesh",
    pincode: "201301",
    gst: "09AACCF6130F1ZW",
  },
  shippingDetails: {
    name: "GGG Reality",
    address: "Raina tower, 1st floor, plot no -59, sec -136, Noida, 7409099890",
    pincode: "201301",
  },
});
