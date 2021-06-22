const puppeteer = require("puppeteer");
const { template, ..._ } = require("lodash");
const { promises: fs, readFileSync } = require("fs");
const { resolve, join, parse } = require("path");
const { v4: uuid } = require("uuid");
const imgDataUri = require("image-data-uri");

function generateTable({ headers, rows }, taxBreakUps) {
  function generateClass(header) {
    return `t-${header.toLowerCase()}`;
  }

  const thead = `
  <thead>
    <tr>
      ${headers
        .map(
          (header) =>
            `<th class="${generateClass(header)}">${
              header === "ID" ? "#" : header
            }</th>`
        )
        .join("\n")}
    </tr>
  </thead>
  `;

  const taxBreakupRows = Object.keys(taxBreakUps)
    .map((taxBracket) => {
      const length = headers.length;
      const highlightClass = taxBracket.toLowerCase().includes("total")
        ? "t-highlight"
        : "";
      if (length < 2)
        throw new Error("Cannot produce table with less than two columns");
      return `
      <tr>
        ${Array.from(
          new Array(length - 2),
          () => `<td class="${highlightClass}"></td>`
        ).join("\n")}
        <td class="t-price ${highlightClass}">
          ${taxBracket}
        </td>
        <td class="t-total ${highlightClass}">
          ${taxBreakUps[taxBracket].toFixed(2)}
        </td>
      </tr>
    `;
    })
    .join("\n");

  const parsedRows = rows.map((row) => row.map((item) => parseFloat(item)));
  const accumulator = {};
  parsedRows.forEach((row) => {
    row.forEach((item, index) => {
      if (isNaN(item) || headers[index] === "Quantity") return;
      const prevSum = accumulator[index];
      if (!prevSum) accumulator[index] = item;
      else accumulator[index] += item;
    });
  });
  const totalRow = Array.from(new Array(headers.length), (curr, index) => {
    if (index === 0) {
      return `<td class="t-highlight"></td>`;
    }
    if (index === 1) {
      return `<td class="t-highlight t-name">Total</td>`;
    }
    const accValue = accumulator[index];
    if (isNaN(accValue)) return `<td class="t-highlight t-price"></td>`;
    return `<td class="t-highlight a-right t-total">${accValue.toFixed(
      2
    )}</td>`;
  }).join("\n");

  const tbody = `
  <tbody>
    ${rows
      .map(
        (columns) =>
          `<tr>
          ${columns
            .filter((col) => col !== "class")
            .map(
              (value, idx) =>
                `<td class="${generateClass(headers[idx])}">${
                  idx === 0
                    ? value
                    : isNaN(value)
                    ? value
                    : parseFloat(value).toFixed(2)
                }</td>`
            )
            .join("\n")}
          </tr>`
      )
      .join("\n")}
      ${totalRow}
      ${taxBreakupRows}
  </tbody>
  `;

  return `
  <table class="data-table">
    ${thead}
    ${tbody}
  </table>
  `;
}

function generatePaymentTermsTable(paymentTerms, signImage) {
  const thead = `
  <thead>
    <tr>
      ${[
        '<th class="expand-col">Payment Terms</th>',
        '<th class="t-term">Term</th>',
        '<th class="t-percent">Percent</th>',
      ].join("\n")}
    </tr>
  </thead>
  `;

  const rows = [];

  if (
    paymentTerms.paymentAfterInvoice === null &&
    paymentTerms.paymentAfterInvoiceDays === null &&
    paymentTerms.paymentAtDelivery === null &&
    paymentTerms.paymentBeforeDelivery === null
  ) {
    paymentTerms.customPaymentTerms.forEach((item) => {
      rows.push(`
      <tr>
        <td class="expand-col"></td>
        <td class="t-term">${item.label}</td>
        <td class="t-percent">${item.value.toFixed(2)}%</td>
      </tr>
      `);
    });
  } else {
    rows.push(`
    <tr>
      <td class="expand-col"></td>
      <td class="t-term">Advance Payment</td>
      <td class="t-percent">${paymentTerms.paymentBeforeDelivery ?? 0}%</td>
    </tr>
    `);
    rows.push(`
    <tr>
      <td class="expand-col"></td>
      <td class="t-term">Payment at delivery</td>
      <td class="t-percent">${paymentTerms.paymentAtDelivery ?? 0}%</td>
    </tr>
    `);
    rows.push(`
    <tr>
      <td class="expand-col"></td>
      <td class="t-term">Payment ${
        paymentTerms.paymentAfterInvoiceDays ?? 0
      } days after invoice</td>
      <td class="t-percent">${paymentTerms.paymentAfterInvoice ?? 0}%</td>
    </tr>
    `);
    paymentTerms.customPaymentCharges.forEach((item) => {
      rows.push(`
      <tr>
        <td class="expand-col"></td>
        <td class="t-term">${item.term}</td>
        <td class="t-percent">₹ ${item.value.toFixed(2)}</td>
      </tr>
      `);
    });
  }

  const tbody = `
  <tbody>
    ${rows.join("\n")}
  </tbody>
  `;

  return `
  <table class="data-table payment-terms">
    ${thead}
    ${tbody}
  </table>
  <section class="row">
    <div class="col"></div>
    <section class="col align-right"><img src="${signImage}" alt="Sign image" style="max-width: 250px; max-height: 120px; height: auto; width: auto;" /></section>
  </section>
  `;
}

function generateTermsTable(terms) {
  if (terms.filter((term) => term.length !== 0).length === 0) return "";
  return `
  <section class="info">
  Please read the terms and conditions in this document and other attachments that may accompany the communication
  </section>
  <table class="data-table terms">
    <thead>
      <tr>
        <th style="text-align: left">Terms and Conditions</th>
      </tr>
    </thead>
    <tbody>
    ${terms
      .map(
        (term) =>
          `<tr>
        <td class="t-r-term-and-c">${term}</td>
      </tr>`
      )
      .join("\n")}
    </tbody>
  </table>
  `;
}

async function generateInvoice({
  poDetails = {
    buyersName: "",
    poNumber: "",
    createdAt: new Date(),
    deliveryDate: new Date(),
    createdBy: "",
    contact: "",
  },
  vendorDetails = {
    name: "",
    billingAddress: "",
    pincode: "",
    gstin: "",
    pan: "",
  },
  extra = {
    termsAndConditions: "",
  },
  image = {
    url: "https://mysite-user-images.s3.ap-south-1.amazonaws.com/1620284314416",
    sign: "",
    // file: "",
  },
  billDetails = {
    name: "",
    address: "",
    pincode: "",
    gst: "",
  },
  shippingDetails = {
    name: "",
    address: "",
    pincode: "",
  },
  table = {
    headers: [
      "ID",
      "Name",
      "Category",
      "Description",
      "Unit",
      "Make",
      "Quantity",
      "Price",
      "Total",
    ],
    // Rows should be an array of arrays
    rows: [],
  },
  taxBreakups = {},
  paymentTerms = {
    paymentAfterInvoice: null,
    paymentAfterInvoiceDays: null,
    paymentAtDelivery: null,
    paymentBeforeDelivery: null,
    customPaymentTerms:
      '[{"term":"Advance payment","percent":"15"},{"term":"After delivery ","percent":"85"}]',
  },
}) {
  // Header and footer template for the PDF document
  const header = `
  <header style="
    font-family: Roboto, Inter, sans-serif;
    display: flex;
    width: 557px;
    border: 1px solid transparent;
    border-bottom: none;
    margin-left: 18px;
  ">
      ${
        image
          ? `<div style="margin: 32px 22px; min-width: 175px; max-width: 175px; flex-grow: 1; display: flex; align-items: center;">
          <img
            style="
              max-width: 175px;
              height: 50px;
            "
            src="
              ${
                image.file
                  ? await imgDataUri.encodeFromFile(readFileSync(image.file))
                  : await imgDataUri.encodeFromURL(image.url)
              }
            "
          />
        </div>`
          : `<div
          style="
            font-size: 18px;
            margin: 32px 22px;
            flex-grow: 1;
            font-weight: 700; min-width: 175px;
          "
        >
          ${poDetails.buyersName}
        </div>`
      }
      
      <div
        style="
          font-size: 8px;
          margin: 32px 38px;
          line-height: 2;
        "
      >
        <section style="margin-left: 69px;">
          <div style="display: flex">
            <div style="width: 90px">Purchase Order#</div>
            <div style="width: 150px">: ${poDetails.poNumber ?? "No data"}</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Order Date</div>
            <div style="width: 150px">: ${
              poDetails.createdAt
                ? new Date(poDetails.createdAt).toDateString()
                : "No data"
            }</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Delivery Date</div>
            <div style="width: 150px">: ${
              poDetails.deliveryDate
                ? new Date(poDetails.deliveryDate).toDateString()
                : "No data"
            }</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Purchaser</div>
            <div style="width: 150px">: ${
              poDetails.createdBy ?? "No data"
            }</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Contact Details</div>
            <div style="width: 150px">: ${poDetails.contact ?? "No data"}</div>
          </div>
        </section>
      </div>
    </header>
    `;
  const footer = `
    <footer style="
      font-family: Roboto, Inter, sans-serif;
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

  // Initialises the templating variables to be used in the HTML document
  const templateConfig = {
    // Bill:
    bill_name: billDetails.name,
    bill_address: billDetails.address,
    bill_pincode: billDetails.pincode
      ? `Pin Code - ${billDetails.pincode}`
      : "",
    bill_gst: billDetails.gst ? `GST - ${billDetails.gst}` : "",
    // Vendor
    vendor_name: vendorDetails.name,
    vendor_address: vendorDetails.billingAddress,
    vendor_pincode: vendorDetails.pincode
      ? `Pin Code - ${vendorDetails.pincode}`
      : "",
    vendor_gst: vendorDetails.gstin ? `GST- ${vendorDetails.gstin}` : "",
    vendor_pan: vendorDetails.pan ? `PAN - ${vendorDetails.pan}` : "",
    // Shipping
    shipping_name: shippingDetails.name,
    shipping_address: shippingDetails.address,
    shipping_pincode: shippingDetails.pincode
      ? `Pin Code - ${shippingDetails.pincode}`
      : "",
    // Table items
    data_table: generateTable(table, taxBreakups),
    payment_terms_table: generatePaymentTermsTable(paymentTerms, image.sign),
    terms_table: generateTermsTable(
      extra.termsAndConditions.split("\n").map((term) => term.trim())
    ),
    // Sign Image URL
    sign_img: `<img src="${image.sign}" alt="Sign image" style="max-width: 250px; max-height: auto; height: auto; width: auto;" />`,
  };

  const file = template(
    (
      await fs.readFile(
        resolve(join(__dirname, "..", "template", "invoice.template.html"))
      )
    ).toString()
  );
  // Initialises puppeteer
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(
    file({
      ...templateConfig,
    })
  );
  await page.evaluateHandle("document.fonts.ready");

  const createdPath = resolve(join("docs", `${uuid()}.pdf`));
  // Generates pdf
  await page.pdf({
    path: createdPath,
    format: "a4",
    margin: {
      top: "200px",
      bottom: "55px",
      right: "25px",
      left: "25px",
    },
    headerTemplate: header,
    footerTemplate: footer,
    displayHeaderFooter: true,
  });

  // Cleanup
  await browser.close();

  // Ends
  return createdPath;
}

async function generateInvoiceFromPowo(powo, powoItems) {
  console.log("powo received: ", powo);
  console.log("powoItems received: ", powoItems);
  const taxBreakups = {};
  if (powo.freightCharges && powo.freightCharges > 0)
    taxBreakups["Freight charges"] = powo.freightCharges;
  if (powo.additionalDiscount && powo.additionalDiscount > 0)
    taxBreakups["Additional discount"] = powo.additionalDiscount;
  if (powo.additionalCharges && powo.additionalCharges > 0)
    taxBreakups["Additional charges"] = powo.additionalCharges;
  powoItems.forEach((item) => {
    if (item.idBoms.length > 0) {
      item.idBoms.map((bom) => {
        const tax = bom.tax[0];
        if (tax.type.includes("igst")) {
          if (!taxBreakups[`IGST@${tax.value.toFixed(2)}`]) {
            taxBreakups[`IGST@${tax.value.toFixed(2)}`] =
              (tax.value / 100) * (bom.poPrice - bom.discount) * bom.quantity;
          } else {
            taxBreakups[`IGST@${tax.value.toFixed(2)}`] +=
              (tax.value / 100) * (bom.poPrice - bom.discount) * bom.quantity;
          }
        } else {
          if (!taxBreakups[`SGST@${(tax.value / 2).toFixed(2)}`]) {
            taxBreakups[`SGST@${(tax.value / 2).toFixed(2)}`] =
              (tax.value / 200) * (bom.poPrice - bom.discount) * bom.quantity;
          } else {
            taxBreakups[`SGST@${(tax.value / 2).toFixed(2)}`] +=
              (tax.value / 200) * (bom.poPrice - bom.discount) * bom.quantity;
          }
          if (!taxBreakups[`CGST@${(tax.value / 2).toFixed(2)}`]) {
            taxBreakups[`CGST@${(tax.value / 2).toFixed(2)}`] =
              (tax.value / 200) * (bom.poPrice - bom.discount) * bom.quantity;
          } else {
            taxBreakups[`CGST@${(tax.value / 2).toFixed(2)}`] +=
              (tax.value / 200) * (bom.poPrice - bom.discount) * bom.quantity;
          }
        }
      });
      return;
    }
    const tax = item.tax[0];
    if (tax.type.includes("igst")) {
      if (!taxBreakups[`IGST@${tax.value.toFixed(2)}`]) {
        taxBreakups[`IGST@${tax.value.toFixed(2)}`] =
          (tax.value / 100) *
          (item.idBoq.poPrice - item.idBoq.discount) *
          item.idBoq.quantity;
      } else {
        taxBreakups[`IGST@${tax.value.toFixed(2)}`] +=
          (tax.value / 100) *
          (item.idBoq.poPrice - item.idBoq.discount) *
          item.idBoq.quantity;
      }
    } else {
      if (!taxBreakups[`SGST@${(tax.value / 2).toFixed(2)}`]) {
        taxBreakups[`SGST@${(tax.value / 2).toFixed(2)}`] =
          (tax.value / 200) *
          (item.idBoq.poPrice - item.idBoq.discount) *
          item.idBoq.quantity;
      } else {
        taxBreakups[`SGST@${(tax.value / 2).toFixed(2)}`] +=
          (tax.value / 200) *
          (item.idBoq.poPrice - item.idBoq.discount) *
          item.idBoq.quantity;
      }
      if (!taxBreakups[`CGST@${(tax.value / 2).toFixed(2)}`]) {
        taxBreakups[`CGST@${(tax.value / 2).toFixed(2)}`] =
          (tax.value / 200) *
          (item.idBoq.poPrice - item.idBoq.discount) *
          item.idBoq.quantity;
      } else {
        taxBreakups[`CGST@${(tax.value / 2).toFixed(2)}`] +=
          (tax.value / 200) *
          (item.idBoq.poPrice - item.idBoq.discount) *
          item.idBoq.quantity;
      }
    }
  });

  const taxToDisplayableValue = (amount, tax) => {
    console.log("amount: ", amount);
    console.log("tax: ", tax);
    if (tax.type.includes("igst")) {
      return `${parseFloat((tax.value / 100) * amount).toFixed(
        2
      )} <small>(IGST ${tax.value}%)</small>`;
    }
    return `${parseFloat((tax.value / 100) * amount).toFixed(
      2
    )} <small>(CGST & SGST ${tax.value}%)</small>`;
  };

  let totalAmount = 0;
  const rows = [];
  let count = 1;
  powoItems.forEach((item, idx) => {
    if (item.idBoms.length > 0) {
      // rows.push([
      //   idx + 1,
      //   item.idBoq.name,
      //   item.idBoq.categoryName,
      //   item.idBoq.description,
      //   item.idBoq.unit,
      //   item.idBoq.make,
      //   item.idBoq.quantity,
      //   "N/A",
      //   // item.idBoq.costPrice,
      //   0,
      //   // parseFloat(item.idBoq.quantity) * parseFloat(item.idBoq.costPrice),
      //   0,
      // ]);
      item.idBoms.forEach((bom, index) => {
        rows.push([
          // `${idx + 1}.${index + 1}`,
          `${count}`,
          bom.name ?? "",
          bom.categoryName ?? "",
          isNaN(bom.description) || bom.description === ""
            ? "NA"
            : bom.description,
          isNaN(bom.unit) || bom.unit === "" ? "NA" : bom.unit,
          isNaN(bom.make) || bom.make === "" ? "NA" : bom.make,
          bom.quantity ?? "",
          taxToDisplayableValue(
            parseFloat(bom.quantity) *
              (parseFloat(bom.poPrice) - parseFloat(bom.discount ?? 0)),
            bom.tax[0]
          ),
          bom.discount.toFixed(2),
          bom.poPrice,
          parseFloat(bom.quantity) *
            (parseFloat(bom.poPrice) - parseFloat(bom.discount ?? 0)) +
            (bom.tax[0].value / 100) *
              (parseFloat(bom.quantity) *
                (parseFloat(bom.poPrice) - parseFloat(bom.discount ?? 0))),
        ]);
        totalAmount +=
          parseFloat(bom.quantity) *
            (parseFloat(bom.poPrice) - parseFloat(bom.discount ?? 0)) +
          (bom.tax[0].value / 100) *
            (parseFloat(bom.quantity) *
              (parseFloat(bom.poPrice) - parseFloat(bom.discount ?? 0)));
        count += 1;
      });
      return;
    }
    rows.push([
      count,
      item.idBoq.name,
      item.idBoq.categoryName,
      item.idBoq.description,
      item.idBoq.unit,
      item.idBoq.make,
      item.idBoq.quantity,
      taxToDisplayableValue(
        parseFloat(item.idBoq.quantity) *
          (parseFloat(item.idBoq.poPrice) -
            parseFloat(item.idBoq.discount ?? 0)),
        item.tax[0]
      ),
      item.idBoq.discount.toFixed(2),
      item.idBoq.poPrice,
      parseFloat(item.idBoq.quantity) *
        (parseFloat(item.idBoq.poPrice) -
          parseFloat(item.idBoq.discount ?? 0)) +
        (item.tax[0].value / 100) *
          (parseFloat(item.idBoq.quantity) *
            (parseFloat(item.idBoq.poPrice) -
              parseFloat(item.idBoq.discount ?? 0))),
    ]);
    count += 1;
    totalAmount +=
      parseFloat(item.idBoq.quantity) *
        (parseFloat(item.idBoq.poPrice) -
          parseFloat(item.idBoq.discount ?? 0)) +
      (item.tax[0].value / 100) *
        (parseFloat(item.idBoq.quantity) *
          (parseFloat(item.idBoq.poPrice) -
            parseFloat(item.idBoq.discount ?? 0)));
  });
  totalAmount += powo.freightCharges ?? 0;
  totalAmount += powo.additionalCharges ?? 0;
  totalAmount -= powo.additionalDiscount ?? 0;
  taxBreakups["Total Amount"] = totalAmount;

  return generateInvoice({
    poDetails: {
      buyersName: powo.buyersName,
      poNumber: powo.poNumber,
      createdAt: new Date(powo.createdAt),
      deliveryDate: new Date(powo.deliveryDate),
      createdBy: powo.createdBy,
      contact: powo?.idAddedBy?.phone ?? "", // We need the user's phone and email
    },
    vendorDetails: {
      name: powo.idVendor.name,
      billingAddress: powo.idVendor.billingAddress,
      pincode: powo.idVendor.pincode,
      gstin: powo.idVendor.gstin,
      pan: powo.idVendor.pan,
    },
    table: {
      headers: [
        "ID",
        "Name",
        "Category",
        "Description",
        "Unit",
        "Make",
        "Quantity",
        "Tax",
        "Discount",
        "Price",
        "Total",
      ],
      rows,
    },
    image: {
      url: powo.idOrg.imgUrl,
      sign: powo.signImageUrl,
    },
    billDetails: {
      name: powo.idOrg.name,
      address: powo.idOrg.address,
      pincode: powo.idOrg.pin,
      gst: powo.idOrg.gst,
    },
    shippingDetails: {
      name: powo?.shipping?.name,
      address: powo?.shipping?.address,
      pincode: powo?.shipping?.pincode,
    }, // What details to put here? TODO
    paymentTerms: {
      paymentAfterInvoice: powo.paymentAfterInvoice,
      paymentAfterInvoiceDays: powo.paymentAfterInvoiceDays,
      paymentAtDelivery: powo.paymentAtDelivery,
      paymentBeforeDelivery: powo.paymentBeforeDelivery,
      customPaymentTerms: powo.customPaymentTerms,
      customPaymentCharges: powo.customCharges,
    },
    taxBreakups,
    extra: {
      termsAndConditions: powo.termsAndConditions ?? "",
    },
  });
}

module.exports = generateInvoiceFromPowo;
