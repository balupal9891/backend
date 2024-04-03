import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js"
import {verifyUser} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyUser); // Apply verifyUser middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router