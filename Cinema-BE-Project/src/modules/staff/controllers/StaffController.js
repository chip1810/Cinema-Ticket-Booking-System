// StaffController.js
const StaffService = require("../services/StaffService");
const ApiResponse = require("../../../utils/ApiResponse");

const staffService = new StaffService();

class StaffController {

    // 🔎 GET /api/staff/customers/:phoneNumber
    async lookupCustomer(req, res) {
        try {
            const phoneParam = req.params.phoneNumber;

            if (!phoneParam || Array.isArray(phoneParam)) {
                return ApiResponse.error(res, "Invalid phone number", 400);
            }

            const customer = await staffService.lookupCustomerByPhone(phoneParam);

            return ApiResponse.success(
                res,
                customer,
                "Customer retrieved successfully",
                200
            );

        } catch (error) {

            if (error.message === "Customer not found") {
                return ApiResponse.error(res, error.message, 404);
            }

            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }

    // 🔎 GET /api/staff/orders/:orderId
    async lookupOrder(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return ApiResponse.error(res, "Order ID is required", 400);
            }

            // StaffService sẽ trả về object { order, orderItems, tickets }
            const result = await staffService.lookupOrderById(orderId);

            if (!result.order) {
                return ApiResponse.error(res, "Order not found", 404);
            }

            return ApiResponse.success(
                res,
                result,
                "Order retrieved successfully",
                200
            );

        } catch (error) {
            console.error(error);
            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }

    // 🔎 GET /api/staff/profile/:staffId
    async getProfile(req, res) {
        try {
            // Lấy staffId từ token
            const staffId = req.user.id;

            const staff = await staffService.getStaffProfileById(staffId);

            if (!staff) {
                return ApiResponse.error(res, "Staff not found", 404);
            }

            return ApiResponse.success(res, staff, "Staff profile retrieved successfully", 200);

        } catch (error) {
            console.error(error);
            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }

    async lookupOrderDetailByUUID(req, res) {
  try {
    const { orderUUID } = req.params;
    if (!orderUUID) return ApiResponse.error(res, "Order UUID is required", 400);

    const result = await staffService.lookupOrderDetailByUUID(orderUUID);
    if (!result) return ApiResponse.error(res, "Order not found", 404);

    return ApiResponse.success(res, result, "Order detail retrieved successfully", 200);
  } catch (error) {
    return ApiResponse.error(res, "Internal Server Error", 500);
  }
}
}

module.exports = StaffController;