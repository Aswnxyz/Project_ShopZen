  // requires
  const fs = require("fs");
  const PDFDocument = require("pdfkit-table");

const generateReport = async (reportType, data) => {
  try {
    console.log(data);
    //  // init document
    let doc = new PDFDocument({ margin: 30, size: "A4" });

    doc.font("Helvetica-Bold").fontSize(16).text("ShopZen", { align: "center" });
    doc.fontSize(12).text("Maradu, kochi, India", { align: "center" });
    doc.text("Email: shopzen105@gmail.com", { align: "center" });
    doc.moveDown(2);
    // Add user details
    doc.font("Helvetica").fontSize(12).text(`Order ID: ${data[0].orderId}`, { align: "right" });
    const orderDate = new Date(data[0].createdAt);
    const formattedOrderDate = orderDate.toLocaleDateString("en-US", {
        weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    doc.font("Helvetica").fontSize(12).text(`Order Date: ${formattedOrderDate}`, { align: "right" });
    doc.fontSize(12).text("Ship To:", { align: "left" });
    const addressData = data[0].deliveryAddress; // Assuming userDetails has an "address" property
    for (const key in addressData) {
      if (addressData.hasOwnProperty(key)) {
        const value = addressData[key];
        doc.text(`${key}: ${value}`, { align: "left" , bold : false});
      }
    }    // doc.text(`Email: ${userDetails.email}`, { align: "left" });

    const pData = data[0].products.map((product) => {
      return[
        product.name,
        product.price,
        product.quantity,
        product.price * product.quantity
      ];
    });

    const subtotal = ["", "", "Subtotal : ", data[0].totalPrice + data[0].couponSaving];
    const tax = ["", "", "Tax : ", "0"];
    const discountOrcoupon = ["", "", "Discount/Coupon : ", data[0].couponSaving ]
    const shipping = ["", "", "Shipping charge : ", "0"];
    const total = ["", "", "Total : ", data[0].totalPrice];
    pData.push(subtotal, tax,discountOrcoupon, shipping, total);
    const table = {
      subtitle: "Invoice",
      headers: ["Product", "Price", "Quantity", "Subtotal"],
      rows: pData,
    };

    doc.moveDown(2);
    await doc.table(table);

    const fileName = "sales-report.pdf";
    const writeStream = fs.createWriteStream(fileName);
    doc.pipe(writeStream);
    doc.end();
    await new Promise((resolve, reject) => {
      writeStream.on("finish", () => {
        console.log(`PDF report saved to ${fileName}`);
        resolve(fileName);
      });
      writeStream.on("error", (error) => {
        console.error(`Error saving PDF report: ${error}`);
        reject(error);
      });
    });
    return fileName;
  } catch (error) {
    console.error(`Error generating ${reportType} report: ${error}`);
  }
};

module.exports = generateReport;
