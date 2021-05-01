import PdfMaker from "pdfmake";
import path from "path";
import fs from "fs";
import { getData } from "./data-provider";

const fonts = {
  Roboto: {
    normal: path.resolve(path.join("fonts", "Roboto-Regular.ttf")),
    bold: path.resolve(path.join("fonts", "Roboto-Bold.ttf")),
  },
};

const printer = new PdfMaker(fonts);
const data = getData();

const docDefinition = {
  content: [
    {
      style: "invoiceDoc",
      table: {
        style: "header",
        headerRows: 1,
        widths: ["50%", "50%"],
        body: [
          [
            {
              text: data.powo[0].buyersName,
              style: "buyersName",
            },
            {
              table: {
                style: "headerDetails",
                body: [
                  [
                    {
                      text: "Purchase Order#",
                      style: "headerDetailsItemFirst",
                    },
                    {
                      text: data.powo[0].poNumber,
                      style: "headerDetailsItemFirst",
                    },
                  ],
                  [
                    {
                      text: "Order Date",
                      style: "headerDetailsItem",
                    },
                    {
                      text: new Date(data.powo[0].createdAt).toDateString(),
                      style: "headerDetailsItem",
                    },
                  ],
                  [
                    {
                      text: "Delivery Date",
                      style: "headerDetailsItem",
                    },
                    {
                      text: new Date(data.powo[0].deliveryDate).toDateString(),
                      style: "headerDetailsItem",
                    },
                  ],
                  [
                    {
                      text: "Purchaser",
                      style: "headerDetailsItem",
                    },
                    {
                      text: data.powo[0].createdBy,
                      style: "headerDetailsItem",
                    },
                  ],
                  [
                    {
                      text: "Contact",
                      style: "headerDetailsItem",
                    },
                    {
                      text: "Contact details go here",
                      style: "headerDetailsItem",
                    },
                  ],
                ],
              },
              layout: {
                hLineColor: "#FFFFFF",
                vLineColor: "#FFFFFF",
              },
            },
          ],
          [
            {
              text: "Bill to",
              style: "sectionHeader",
            },
            {
              text: "Vendor Details",
              style: "sectionHeader",
            },
          ],
          [
            {
              table: {
                body: [
                  [
                    {
                      text: "Flipspace Technology Labs Private Limited (UP)",
                      style: "headerDetailsItem",
                      colspan: 2,
                    },
                  ],
                  [
                    {
                      text: "1st Floor, C-25, Noida",
                      style: "headerDetailsItem",
                      colspan: 2,
                    },
                  ],
                  [
                    {
                      text: "Pin Code - 201301",
                      style: "headerDetailsItem",
                      colspan: 2,
                    },
                  ],
                  [
                    {
                      text: "GST 09AACCF6130F1ZW",
                      style: "headerDetailsItem",
                      colspan: 2,
                    },
                  ],
                ],
              },
              layout: {
                hLineColor: "#FFFFFF",
                vLineColor: "#FFFFFF",
                hLineWidth: () => 0,
                vLineWidth: () => 0,
              },
            },
            {
              table: {
                body: [
                  [
                    {
                      text: data.vendor.Vendors[0].vendorName,
                      style: "headerDetailsItem",
                      colspan: 2,
                    },
                  ],
                  [
                    {
                      text: data.vendor.Vendors[0].billingAddress,
                      style: "headerDetailsItem",
                      colspan: 2,
                    },
                  ],
                  [
                    {
                      text: "Pin Code - 201301",
                      style: "headerDetailsItem",
                      colspan: 2,
                    },
                  ],
                  [
                    {
                      text: `GST - ${data.vendor.Vendors[0].gstin}`,
                      style: "headerDetailsItem",
                      colspan: 2,
                    },
                  ],
                  [
                    {
                      text: `PAN - ${data.vendor.Vendors[0].pan}`,
                      style: "headerDetailsItem",
                      colspan: 2,
                    },
                  ],
                ],
              },
              layout: {
                hLineColor: "#FFFFFF",
                vLineColor: "#FFFFFF",
                hLineWidth: () => 0,
                vLineWidth: () => 0,
              },
            },
          ],
          [
            {
              text: "",
              style: "sectionHeader",
            },
            {
              text: "Shipping Address",
              style: "sectionHeader",
            },
          ],
          [
            { text: "" },
            {
              table: {
                body: [
                  [
                    {
                      text: "GGG Reality",
                      style: "headerDetailsItem",
                      colspan: 2,
                    },
                  ],
                  [
                    {
                      text:
                        "Raina tower, 1st floor, plot no -59, sec -136, Noida, 7409099890",
                      style: "headerDetailsItem",
                      colspan: 2,
                    },
                  ],
                  [
                    {
                      text: "Pin Code - 201301",
                      style: "headerDetailsItem",
                      colspan: 2,
                    },
                  ],
                ],
              },
              layout: {
                hLineColor: "#FFFFFF",
                vLineColor: "#FFFFFF",
                hLineWidth: () => 0,
                vLineWidth: () => 0,
              },
            },
          ],
          [
            {
              colspan: 2,
              table: {
                headerRows: 1,
                body: [
                  [
                    {
                      text: "#",
                      style: "dataTableHeader",
                    },
                    {
                      text: "Description",
                      style: "dataTableHeader",
                    },
                    {
                      text: "Unit",
                      style: "dataTableHeader",
                    },
                    {
                      text: "Quantity",
                      style: "dataTableHeader",
                    },
                    {
                      text: "Make",
                      style: "dataTableHeader",
                    },
                    {
                      text: "Price",
                      style: "dataTableHeader",
                    },
                    {
                      text: "Tax",
                      style: "dataTableHeader",
                    },
                    {
                      text: "Total",
                      style: "dataTableHeader",
                    },
                  ],
                ],
                layout: {
                  vLineColor: "#FFFFFF",
                  hLineColor: "#CDCDCD",
                },
              },
            },
          ],
        ],
      },
      layout: {
        hLineColor: function (i: number, node: any) {
          return i === 0 || i === node.table.body.length || i % 2 !== 0
            ? "#CDCDCD"
            : "#FFFFFF";
        },
        vLineColor: function (i: number, node: any) {
          return i === 0 || i === node.table.widths.length || i % 2 === 0
            ? "#CDCDCD"
            : "#FFFFFF";
        },
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        paddingLeft: () => 2,
        paddingRight: () => 2,
        paddingTop: () => 2,
        paddingBottom: () => 2,
      },
    },
  ],
  styles: {
    buyersName: {
      fontSize: 18,
      margin: [10, 20, 20, 20] as any,
      bold: true,
    },
    invoiceDoc: {
      font: "Roboto",
    },
    headerDetailsItem: {
      fontSize: 9,
      lineHeight: 1.5,
      margin: [10, 0, 0, 0] as any,
    },
    headerDetailsItemFirst: {
      fontSize: 9,
      margin: [10, 18, 0, 0] as any,
      lineHeight: 1.5,
    },
    sectionHeader: {
      fontSize: 9,
      margin: [13, 8, 0, 0] as any,
      bold: true,
    },
    dataTableHeader: {
      fontSize: 9,
      bold: true,
      fillColor: "#CECECE",
    },
  },
  pageMargins: 20,
};

const pdfDoc = printer.createPdfKitDocument(docDefinition);
pdfDoc.pipe(fs.createWriteStream("document.pdf"));
pdfDoc.end();
