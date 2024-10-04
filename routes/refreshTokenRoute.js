// routes/refreshTokenRoutes.js
import express from "express";
import refreshAccessToken  from "../controller/refreshToken.js";

const router = express.Router();

router.post("/", refreshAccessToken);

export default router;
