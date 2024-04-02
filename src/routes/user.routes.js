import { Router } from "express";
import { loginUser, 
        registerUser, 
        logoutUser, 
        refreshAccessToken, 
        changeCurrentPassword, 
        getCurrentUser, 
        updateAccoutDetails, 
        updateUserAvatar, 
        updateUsercoverImage, 
        getUserChannelProfile, 
        getWatchHistory 
    } from "../controller/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        },
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// Secured routes 
router.route("/logout").post(verifyUser, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyUser, changeCurrentPassword)
router.route("/current-user").post(verifyUser, getCurrentUser)
router.route("/update-account").patch(verifyUser, updateAccoutDetails)
router.route("/avatar").patch(verifyUser, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyUser, upload.single("coverImage"), updateUsercoverImage)
router.route("/c/:username").get(verifyUser, getUserChannelProfile)
router.route("/history").get(verifyUser, getWatchHistory)


export default router