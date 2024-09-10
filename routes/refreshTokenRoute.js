// routes/refreshTokenRoutes.js
import express from "express";
import refreshAccessToken  from "../controller/refreshToken.js";

const router = express.Router();

router.post("/refresh-token", refreshAccessToken);

export default router;
