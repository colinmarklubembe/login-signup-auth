import { Response } from "express";

class Responses {
  static sendSuccessResponse(
    res: Response,
    statusCode: number,
    message: string,
    data: any = null
  ) {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static sendErrorResponse(res: Response, statusCode: number, message: string) {
    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export default Responses;
