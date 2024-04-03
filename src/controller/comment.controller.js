import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!videoId?.trim()){
        throw new ApiError(401, "Provide videoId to fetch video comments")
    }

    const videoComments = Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments",
                pipeline: [
                    {
                        $project: {
                            content: 1,
                            owner: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                comments:1,
            }
        }
    ])

    if(!videoComments){
        throw new ApiError(509, "Error in fetching the comments from database")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videoComments[0], "Comments fetched successfully")
    )


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
