const puppeteer = require("puppeteer");
const { template, ..._ } = require("lodash");
const { promises: fs, readFileSync } = require("fs");
const { resolve, join } = require("path");
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

  // const taxBreakupRows = Object.keys(taxBreakUps)
  //   .map((taxBracket) => {
  //     const length = headers.length;
  //     const highlightClass = taxBracket.toLowerCase().includes("total")
  //       ? "t-highlight"
  //       : "";
  //     if (length < 2)
  //       throw new Error("Cannot produce table with less than two columns");
  //     return `
  //     <tr>
  //       ${Array.from(
  //         new Array(length - 2),
  //         () => `<td class="${highlightClass}"></td>`
  //       ).join("\n")}
  //       <td class="t-price ${highlightClass}">
  //         ${taxBracket}
  //       </td>
  //       <td class="t-total ${highlightClass}">
  //         ${taxBreakUps[taxBracket]}
  //       </td>
  //     </tr>
  //   `;
  //   })
  //   .join("\n");

  const parsedRows = rows.map((row) => row.map((item) => parseFloat(item)));
  const accumulator = {};
  parsedRows.forEach((row) => {
    row.forEach((item, index) => {
      if (isNaN(item)) return;
      const prevSum = accumulator[index];
      if (!prevSum) accumulator[index] = item;
      else accumulator[index] += item;
    });
  });
  const totalRow = Array.from(new Array(headers.length), (curr, index) => {
    if (index === 0 || index === 2 || index === 3 || index === 4) {
      return `<td class="t-highlight"></td>`;
    }
    if (index === 1) {
      return `<td class="t-highlight t-name">Sub Total</td>`;
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
                    ? value + 1
                    : !isNaN(value)
                    ? value.toFixed(2)
                    : value
                }</td>`
            )
            .join("\n")}
          </tr>`
      )
      .join("\n")}
      ${totalRow}
      ${/*taxBreakupRows*/ ""}
  </tbody>
  `;

  return `
  <table class="data-table">
    ${thead}
    ${tbody}
  </table>
  `;
}

function generateAttachments(attachments) {
  if (attachments.length === 0) return "";
  return `
  <header class="sec-title">Attachments</header>
  <section class="details">
    ${attachments
      .map(
        (attachment, idx) =>
          `<section><a href="${attachment}">Document ${idx + 1}</a></section>`
      )
      .join("\n")}
  </section>
  `;
}

function generateBreakups(breakups) {
  const render = `
    <section class="breakup-container">
      ${Object.keys(breakups)
        .map(
          (breakup, index) =>
            `<div class="breakup-label ${
              index === Object.keys(breakups).length - 1 && "last"
            }">${breakup}</div><div class="breakup-value ${
              index === Object.keys(breakups).length - 1 && "last"
            }">${breakups[breakup]}</div>`
        )
        .join("\n")}
    </section>
  `;
  return render;
}

async function generateBid({
  bid,
  image = {
    url: "https://mysite-user-images.s3.ap-south-1.amazonaws.com/1620284314416",
    // file: "",
  },
  table = {
    headers: [
      "S. No.",
      "BoQ Item",
      "Quantity",
      "Price",
      "Discount",
      "Tax",
      "Amount",
    ],
    // Rows should be an array of arrays
    rows: [],
  },
  taxBreakups = {},
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
            <div style="width: 90px">Bid Name</div>
            <div style="width: 150px">: ${
              bid.idBid.namePackage ?? "No data"
            }</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Requester</div>
            <div style="width: 150px">: ${bid.idOrg.name ?? "No data"}</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Requester Address</div>
            <div style="width: 150px">: ${bid.idOrg.address ?? "No data"}</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Bid Deadline</div>
            <div style="width: 150px">: ${
              bid.idBid.deadLine
                ? new Date(bid.idBid.deadLine).toDateString()
                : "No Data"
            }</div>
          </div>
          <div style="display: flex">
            <div style="width: 90px">Estimated Delivery Date</div>
            <div style="width: 150px">: ${
              bid.estimatedDeliveryDate
                ? new Date(bid.estimatedDeliveryDate).toDateString()
                : "No data"
            }</div>
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
    bid_desc: bid.idBid.itemDescription,
    // Vendor
    vendor_name: bid.idVendor.name,
    vendor_address: bid.idVendor.billingAddress,
    vendor_pincode: bid.idVendor.pincode
      ? `Pin Code - ${bid.idVendor.pincode}`
      : "",
    vendor_gst: bid.idVendor.gstin ? `GST- ${bid.idVendor.gstin}` : "",
    vendor_pan: bid.idVendor.pan ? `PAN - ${bid.idVendor.pan}` : "",
    // Table items
    data_table: generateTable(table, taxBreakups),
    quotation_date: `Quotation Date - ${new Date().toDateString()}`,
    // Bank details,
    account_number: `<span>Account number</span><span> - ${bid.associatedBank[0].accountNumber}</span>`,
    ifsc_code: `<span>IFSC Code</span><span> - ${bid.associatedBank[0].ifscCode}</span>`,
    branch_name: `<span>Branch</span><span> - ${bid.associatedBank[0].branchName}</span>`,
    account_holder: `<span>Account Holder</span><span> - ${bid.associatedBank[0].accountHolderName}</span>`,
    // Sign
    sign_image: bid.signImageUrl,
    // Attachments
    attachments: generateAttachments(bid.attachments),
    terms_and_conditions:
      bid.termsAndConditions && bid.termsAndConditions.length !== 0
        ? `
      <header class="sec-title">Terms and conditions</header>
      <section class="details">${bid.termsAndConditions}</section>
      `
        : "",
    breakups: generateBreakups(taxBreakups),
  };

  const file = template(
    (
      await fs.readFile(
        resolve(join(__dirname, "..", "template", "bid.template.html"))
      )
    ).toString()
  );
  // Initialises puppeteer
  const browser = await puppeteer.launch();
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

module.exports = generateBid;
