import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if (!videoId) {
        throw new ApiError(400, "provide videoId to toggle like")
    }

    const video = await Video.findById(videoId).select("owner")
    if (!video) {
        throw new ApiError(400, "video not found in db")
    }

    const like = await Like.findOne(
        {
            video: video?._id,
            likedBy: req.user?._id
        }
    )

    if (!like) {
        const liked = await Like.create({
            video: video?._id,
            likedBy: req.user?._id
        })
        if (!liked) {
            throw new ApiError(500, "Error while creating like document in db")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, liked, "successfully liked the video")
            )
    }
    else {
        const unliked = await Like.deleteOne(
            {
                video: video?._id,
                likedBy: req.user?._id
            }
        )
        if (!unliked) {
            throw new ApiError(400, "Error while unliking or deleting like document in db")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, unliked, "successfully unliked the video")
            )
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!commentId) {
        throw new ApiError(400, "provide commentId to toggle like")
    }

    const comment = await Comment.findById(commentId).select("owner")
    if (!comment) {
        throw new ApiError(400, "comment not found in db")
    }

    const like = await Like.findOne(
        {
            comment: comment?._id,
            likedBy: req.user?._id
        }
    )

    if (!like) {
        const liked = await Like.create({
            comment: comment?._id,
            likedBy: req.user?._id
        })
        if (!liked) {
            throw new ApiError(500, "Error while creating like document for comment in db")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, liked, "successfully liked the comment")
            )
    }
    else {
        const unliked = await Like.deleteOne(
            {
                comment: comment?._id,
                likedBy: req.user?._id
            }
        )
        if (!unliked) {
            throw new ApiError(400, "Error while unliking or deleting like document for comment in db")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, unliked, "successfully unliked the comment")
            )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!tweetId) {
        throw new ApiError(400, "provide tweetId to toggle like")
    }

    const tweet = await Tweet.findById(tweetId).select("owner")
    if (!tweet) {
        throw new ApiError(400, "tweet not found in db")
    }

    const like = await Like.findOne(
        {
            tweet: tweet?._id,
            likedBy: req.user?._id
        }
    )

    if (!like) {
        const liked = await Like.create({
            tweet: tweet?._id,
            likedBy: req.user?._id
        })
        if (!liked) {
            throw new ApiError(500, "Error while creating like document for tweet in db")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, liked, "successfully liked the tweet")
            )
    }
    else {
        const unliked = await Like.deleteOne(
            {
                tweet: tweet?._id,
                likedBy: req.user?._id
            }
        )
        if (!unliked) {
            throw new ApiError(400, "Error while unliking or deleting like document for tweet in db")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, unliked, "successfully unliked the tweet")
            )
    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}