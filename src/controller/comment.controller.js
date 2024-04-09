import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

// const getVideoComments = asyncHandler(async (req, res) => {
//     //TODO: get all comments for a video
//     const {videoId} = req.params
//     const {page = 1, limit = 10} = req.query
//     if(!videoId?.trim()){
//         throw new ApiError(401, "Provide videoId to fetch video comments")
//     }

//     const videoComments = await Video.aggregate([
//         {
//             $match: {
//                 _id: new mongoose.Types.ObjectId(videoId)
//             }
//         },
//         {
//             $lookup: {
//                 from: "comments",
//                 localField: "_id",
//                 foreignField: "video",
//                 as: "comments",
//                 pipeline: [
//                     {
//                         $project: {
//                             content: 1,
//                             owner: 1
//                         }
//                     }
//                 ]
//             }
//         },
//         {
//             $project: {
//                 comments:1,
//                 _id: 0
//             }
//         }
//     ])

//     if(!videoComments){
//         throw new ApiError(509, "Error in fetching the comments from database")
//     }

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200, videoComments[0], "Comments fetched successfully")
//     )


// })

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!videoId?.trim()){
        throw new ApiError(401, "Provide videoId to fetch video comments")
    }

    const video = await Video.findById(videoId).select("owner")
    if(!video){
        throw new ApiError(400, "video not found in db")
    }

    let pipeline = []

    if(video){
        pipeline.push({
            $match: {
                video: new mongoose.Types.ObjectId(video?._id)
            }
        })
    }

    pipeline.push({
        $sort: {
            createdAt: -1
        }
    })

    pipeline.push({
        $skip: (page - 1) * limit
    })

    pipeline.push({
        $project: {
            content: 1,
            owner: 1,
            _id: 0
        }
    })

    pipeline.push({
        $limit: limit
    })

    const videoComments = await Comment.aggregate(pipeline)
    if(!videoComments){
        throw new ApiError(509, "Error in fetching the comments from database")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videoComments, "Comments fetched successfully")
    )


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params

    if(!content?.trim()){
        throw new ApiError(400, "content are required to post comment")
    }
    if(!videoId?.trim()){
        throw new ApiError(400, "videoId are required to post comment")
    }

    const video = await Video.findById(videoId).select("owner")
    if(!video){
        throw new ApiError(400, "video not found in which you want to comment")
    }

    const comment = await Comment.create({
        content: content,
        video : video?._id,
        owner: req.user?.id
    })

    if(!comment){
        throw new ApiError(509, "Error while uploading comment in db")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comments created or uploaded succesfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    if(!commentId){
        throw new ApiError(400, "provide commentId to update comment")
    }

    const comment = await Comment.findById(commentId).select("owner")
    if(!comment){
        throw new ApiError(400, "Comment not found in db")
    }

    if(!comment?.owner.equals(req.user?._id)){
        throw new ApiError(401, "Unauthorized you cannot update comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        comment._id,
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        }
    )
    if(!updatedComment){
        throw new ApiError(400, "Error while updating the comment in db")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedComment, "Comment successfully updated")
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(400, "provide commentId to delete comment")
    }

    const comment = await Comment.findById(commentId).select("owner")
    if(!comment){
        throw new ApiError(400, "Comment not found in db")
    }

    if(!comment?.owner.equals(req.user?._id)){
        throw new ApiError(401, "Unauthorized you cannot delete comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(comment._id)
    if(!deletedComment){
        throw new ApiError(400, "Error while deleting the comment in db")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedComment, "Comment successfully deleted")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
