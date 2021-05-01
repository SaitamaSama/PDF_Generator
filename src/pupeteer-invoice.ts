import puppeteer, { PDFMargin } from "puppeteer";
import { template } from "lodash";
import { promises as fs } from "fs";
import { resolve, join } from "path";
import { getData } from "./data-provider";

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
  table_items: Array.from(new Array(23), (k, i) => ({
    id: i + 1,
    description:
      "11 TR -DAIKIN MAKE -FDR130ERV16 Indoor & Outdoor RR130ERY16 ( Daikin )",
    unit: "NOS",
    quantity: 2,
    make: "",
    price: 135000,
    tax: "12150 (9%)",
    total: 147150,
  })),
  // Terms and condition
  terms: data.powo[0].termsAndConditions.split("\n").map((term) => term.trim()),
};

async function process() {
  const header = `
  <header style="font-family: Roboto, Inter, sans-serif; display: flex; width: 560px;">
      <div
        style="
          font-size: 18px;
          margin: 32px 40px;
          flex-grow: 1;
          font-weight: 700;
        "
      >
        ${data.powo[0].buyersName}
      </div>
      <div
        style="
          font-size: 9px;
          margin: 32px 24px;
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
    <footer style="font-size: 8px; color: #CDCDCD; width: 570px;">
      <div style="text-align: center;">
        Page <span class="pageNumber"></span> /
        <span class="totalPages"></span>
      </div>
      <div style="text-align: center;">
        Powered by mysiteapp.co
      </div>
    </footer>
  `;
  const file = template(
    (
      await fs.readFile(
        resolve(join(__dirname, "..", "template", "invoice.template.html"))
      )
    ).toString()
  );
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(file(templateConfig));
  await page.evaluateHandle("document.fonts.ready");

  await page.pdf({
    path: "pup-doc.pdf",
    format: "a4",
    margin: {
      top: "200px",
      bottom: "50px",
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
