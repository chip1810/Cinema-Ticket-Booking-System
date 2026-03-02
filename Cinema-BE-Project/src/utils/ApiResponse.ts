export class ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;

  constructor(success: boolean, statusCode: number, message: string, data?: T) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static success<T>(res: any, data: T, message = "Success", statusCode = 200) {
    return res.status(statusCode).json(
      new ApiResponse(true, statusCode, message, data)
    );
  }

  static error(res: any, message = "Error", statusCode = 400) {
    return res.status(statusCode).json(
      new ApiResponse(false, statusCode, message)
    );
  }
}