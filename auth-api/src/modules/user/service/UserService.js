import UserRepository from "../repository/userRepository";
import * as httpStatus from "../../../config/constants/httpStatus.js"
import UserException from "../exceptions/UserException.js";

class UserService {
    async findByEmail(req) {
        try {
            const { email } = req.params;
            this.validateRequestData(email);
            const user = await UserRepository.findByEmail(email);
            this.validateUserNotFound(user);

            return {
                status: httpStatus.SUCCESS,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            }
        } catch (err) {
            return {
                status: err.status || httpStatus.INTERNAL_SERVER_ERROR,
                message: err.message,
            }
        }
    }


    validateRequestData(email) {
        if (!email) {
            throw new UserException(httpStatus.BAD_REQUEST, "User email is not informeted.");
        }
    }

    validateUserNotFound(user) {
        if (!user) {
            throw new UserException(httpStatus.BAD_REQUEST, "User is not found.")
        }
    }
}

export default new UserService();