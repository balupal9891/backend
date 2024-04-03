import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controller/subscription.controller.js"
import {verifyUser} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyUser); // Apply verifyUser middleware to all routes in this file

router.route("/u/:channelId").post(toggleSubscription)
router.route("/u/:channelId").get(getUserChannelSubscribers)
router.route("/c/:subscriberId").get(getSubscribedChannels)


export default router