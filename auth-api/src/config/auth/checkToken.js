import JWT from 'jsonwebtoken';
import { promisify } from "util";

import AuthException from "../../modules/user/exceptions/authException.js"
import * as secrets from "../constants/secrets.js";
import * as httpStatus from "../constants/httpStatus.js";


const emptySpace = " ";
export default async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new AuthException(
                httpStatus.UNAUTHORIZE,
                "Access token was not informed.");
        }
        let accessToken = authorization;
        if (accessToken.toLowerCase().includes(emptySpace)) {
            accessToken = accessToken.split(emptySpace)[1];
        } else {
            accessToken = authorization;
        }
        const decoded = await promisify(JWT.verify)(
            accessToken,
            secrets.API_SECRET
        );
        req.authUser = decoded.authUser;
        return next();
    } catch (err) {
        const status = err.status || httpStatus.BAD_REQUEST;
        return res.status(status).json({
            status,
            message: err.message,
        })
    }
}