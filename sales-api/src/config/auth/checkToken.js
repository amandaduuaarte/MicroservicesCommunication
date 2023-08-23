import JWT from 'jsonwebtoken';
import { promisify } from "util";

import AuthException from "./authException.js";
import {API_SECRET } from "../constants/secrets.js";
import {UNAUTHORIZE, BAD_REQUEST} from "../constants/httpStatus.js";


const emptySpace = " ";
export default async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new AuthException(
               UNAUTHORIZE,
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
            API_SECRET
        );
        req.authUser = decoded.authUser;
        return next();
    } catch (err) {
        const status = err.status || BAD_REQUEST;
        return res.status(status).json({
            status,
            message: err.message,
        })
    }
}