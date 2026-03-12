import { Request, Response } from "express";
import { ReportController } from "./ReportController";
import * as ExcelJS from "exceljs";

const reportController = new ReportController();

export class ExportController {

    // Xuất báo cáo doanh thu phim ra Excel
    async exportMovieRevenue(req: Request, res: Response) {
        // Lấy dữ liệu JSON từ ReportController
        const fakeRes: any = {
            status: () => fakeRes,
            json: (body: any) => body,
        };

        const data: any = await reportController.movieRevenue(req, fakeRes as Response);

        const rows = data?.data ?? [];

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Movie Revenue");

        sheet.columns = [
            { header: "Movie ID", key: "movieId", width: 10 },
            { header: "Title", key: "title", width: 32 },
            { header: "Tickets", key: "tickets", width: 10 },
            { header: "Revenue", key: "revenue", width: 15 },
        ];

        rows.forEach((row: any) => sheet.addRow(row));

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

