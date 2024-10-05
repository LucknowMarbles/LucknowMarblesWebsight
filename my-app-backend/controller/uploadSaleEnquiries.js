const SaleEnquiry = require('../modals/Sale');
const xlsx = require('xlsx');

exports.uploadSaleEnquiries = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const groupedData = data.reduce((acc, row) => {
      if (!acc[row['Customer ID']]) {
        acc[row['Customer ID']] = {
          customer: row['Customer ID'],
          deliveryAddress: {
            street: row['Street'],
            city: row['City'],
            state: row['State'],
            zipCode: row['Zip Code'],
            country: row['Country']
          },
          freight: row['Freight'],
          gstPercent: row['GST Percent'],
          status: row['Status'],
          items: []
        };
      }
      acc[row['Customer ID']].items.push({
        piece: row['Piece ID'],
        pieceNo: row['Piece No'],
        saleLength: row['Sale Length'],
        saleWidth: row['Sale Width'],
        saleAreaPerPiece: row['Sale Area Per Piece'],
        pricePerUnitArea: row['Price Per Unit Area']
      });
      return acc;
    }, {});

    const saleEnquiries = await Promise.all(
      Object.values(groupedData).map(data => new SaleEnquiry(data).save())
    );

    res.status(201).json({ message: `${saleEnquiries.length} sale enquiries created` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};