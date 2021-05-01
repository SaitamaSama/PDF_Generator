// import puppeteer, { PDFMargin } from "puppeteer";
// import { template } from "lodash";
// import { promises as fs } from "fs";
// import { resolve, join } from "path";
// import { getData } from "./data-provider";
const puppeteer = require("puppeteer");
const { template, ..._ } = require("lodash");
const { promises: fs } = require("fs");
const { resolve, join } = require("path");
const { getData } = require("./data-provider");
const csvjson = require("csvjson");
const imageToBase64 = require("image-to-base64");

const data = getData();
const templateConfig = {
  // Bill:
  bill_name: "Flipspaces Technology Labs Private Limited (UP)",
  bill_address:
    "1st Floor, C-25, Sector -8, NOIDA, Gautam Buddha Nagar, Uttar Pradesh",
  bill_pincode: "201301",
  bill_gst: "09AACCF6130F1ZW",
  // Vendor
  vendor_name: data.vendor.Vendors[0].vendorName,
  vendor_address: data.vendor.Vendors[0].billingAddress,
  vendor_pincode: "201301",
  vendor_gst: data.vendor.Vendors[0].gstin,
  vendor_pan: data.vendor.Vendors[0].pan,
  // Shipping
  shipping_name: "GGG Reality",
  shipping_address:
    "Raina tower, 1st floor, plot no -59, sec -136, Noida, 7409099890",
  shipping_pincode: "201301",
  // Table items
  table_items: [],
  // Terms and condition
  terms: data.powo[0].termsAndConditions.split("\n").map((term) => term.trim()),
};

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

async function process() {
  const tableData = csvjson
    .toObject((await fs.readFile(resolve(join("src", "data.csv")))).toString())
    .map((item) => ({
      ...item,
      class: "",
    }));
  const image = resolve(join("images", "logo.png"));
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
        ${data.powo[0].buyersName}
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
            <div style="width: 150px">${data.powo[0].poNumber}</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Order Date</div>
            <div style="width: 150px">${new Date(
              data.powo[0].createdAt
            ).toDateString()}</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Delivery Date</div>
            <div style="width: 150px">${new Date(
              data.powo[0].deliveryDate
            ).toDateString()}</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Purchaser</div>
            <div style="width: 150px">${data.powo[0].createdBy}</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Contact Details</div>
            <div style="width: 150px">example@foo.com, 888222910</div>
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

  const total = getTotalDataSet(tableData);
  const midTotal = tableData.find((item) => item.Description === "Total");
  const midTotalIndex = tableData.indexOf(midTotal);
  tableData[midTotalIndex] = {
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
      table_items: [...tableData, ...total],
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

process();
