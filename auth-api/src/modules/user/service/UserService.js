import bcrypt from "bcrypt";
import Jwt  from "jsonwebtoken";

import UserRepository from "../repository/userRepository.js";
import UserException from "../exceptions/UserException.js";
import * as httpStatus from "../../../config/constants/httpStatus.js"
import * as secrets from "../../../config/constants/secrets.js";


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

    async getAccessToken(req) {
        try {
            const { email, password } = req.body;
            this.validateAccessTokenData(req.body);
            const user = await UserRepository.findByEmail(email);
            this.validateUserNotFound(user);
            await this.validatePassword(password, user.password);
            const authUser = {
                id: user.id,
                name: user.name,
                email: user.email,
            }
            const accessToken = Jwt.sign({ authUser }, secrets.API_SECRET, { expiresIn: "1d" });
            return {
                status: httpStatus.SUCCESS,
                accessToken: accessToken
            }

        } catch (err) {
            return {
                status: err.status || httpStatus.INTERNAL_SERVER_ERROR,
                message: err.message,
            }
        }
     

    }

    validateAccessTokenData(user) {
        const { email, password } = user;
        if (!email && !password) { 
            throw new UserException(httpStatus.UNAUTHORIZE, "Email or password must be informeted.")
        }
    }

    async validatePassword(password, hasPassword) {
        if (!await bcrypt.compare(password, hasPassword)) {
            throw new UserException(httpStatus.UNAUTHORIZED, "Password is incorrect");
        }
    }
}

export default new UserService();