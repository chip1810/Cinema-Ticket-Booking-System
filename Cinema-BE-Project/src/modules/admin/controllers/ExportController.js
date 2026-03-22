const ReportController = require("./ReportController");
const ExcelJS = require("exceljs");

const reportController = new ReportController();

class ExportController {
  async exportMovieRevenue(req, res) {
    const fakeRes = {
      status: () => fakeRes,
      json: (body) => body,
    };

    const data = await reportController.movieRevenue(req, fakeRes);
    const rows = data?.data ?? [];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Movie Revenue");

    sheet.columns = [
      { header: "Movie ID", key: "movieId", width: 10 },
      { header: "Title", key: "title", width: 32 },
      { header: "Tickets", key: "tickets", width: 10 },
      { header: "Revenue", key: "revenue", width: 15 },
    ];

    rows.forEach((row) => sheet.addRow(row));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="movie-revenue.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}

module.exports = ExportController;
