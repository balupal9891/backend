import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/users.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    // console.log(req.query)
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    if(!userId){
        throw new ApiError(400, "UserId not Provided in getallvideo")
    }

    let pipeline = []

    if(userId){
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        })
    }

    if(query){
        pipeline.push({
            $match: {
                isPublished: false
            }
        })
    }

    let createField = {}
    if(sortBy && sortType){
        createField[sortBy] = (sortType==="asc")?1:-1

        pipeline.push({
            $sort: createField
        })
    }
    else{
        createField["createdAt"] = -1

        pipeline.push({
            $sort: createField
        })
    }

    pipeline.push({
        $skip: (page-1) * limit
    })

    pipeline.push({
        $limit: limit
    })

    const allVideos = await Video.aggregate(pipeline)
    if(!allVideos){
        throw new ApiError(500, "Error while fecthing the video from database")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, allVideos, "Videos feched successfully")
    )


})

// const getAllVideos = asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
//     //TODO: get all videos based on query, sort, pagination
//     const sorttype = sortType==='asc'?1:-1

//     const videos = await Video.find(
//         {
//             $text: {
//                 $search: query
//             }
//         }
//     )

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200, videos, "videos successfully fetched by query")
//     )
// })

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(
        [title, description].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required to upload the video")
    }
    
    const videoFileLocalPath = req.files?.videoFile[0]?.path
    if(!videoFileLocalPath){
        throw new ApiError(400, "videoFile is required")
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    if(!videoFile){
        throw new ApiError(500, "Error while uploading the video on cloudinary")
    }
    // console.log(videoFile)

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(500, "Error while uploading the thumbnail on cloudinary")
    }

    const video = await Video.create({
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        title: title,
        description: description,
        duration: videoFile?.duration,
        owner: req.user?._id
    })
    if(!video){
        throw new ApiError(500, "Error while creating the video model or document in db")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video uploaded successfully on db")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(401, "Provide videoId to get video by id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(200, "video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "video successfully fetched")
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(401, "provide videoId to update video")
    }
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body
    if(
        [title, description].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required to upload the video")
    }

    if(!req.file){
        throw new ApiError(400, "Thumbnail are required to update video")
    }

    // To verify the user which is same or not 
    const tempVideo = await Video.findById(videoId).select("owner")
    if(!tempVideo.owner.equals(req.user._id)){
        throw new ApiError(401, "unauthorised request only owner can update video")
    }

    const thumbnailLocalPath = req.file?.path
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const thumbnailObj = await Video.findById(videoId).select("thumbnail")
    if(!thumbnailObj){
        throw new ApiError(409, "video not fonud")
    }

    let deleteThumbanil = await deleteOnCloudinary(thumbnailObj.thumbnail)
    if(deleteThumbanil.result === 'ok'){
        console.log("Thumbnail deleted on cloud")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title,
                description: description,
                thumbnail: thumbnail.url
            }
        },
        {
            new: true
        }
    )

    if(!video){
        throw new ApiError(400, "video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "video successfully updated")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new ApiError(401, "Provide videoId to delete video by id")
    }

    const tempVideo = await Video.findById(videoId).select("owner")
    if(!tempVideo.owner.equals(req.user._id)){
        throw new ApiError(401, "unauthorised request only owner can delete video")
    }

    const thumbnailAndVideoObj = await Video.findById(videoId).select("videoFile thumbnail")
    if(!thumbnailAndVideoObj){
        throw new ApiError(409, "video not fonud")
    }

    const deletedVideo = await deleteOnCloudinary(thumbnailAndVideoObj.videoFile, "video")
    if(deletedVideo.result === 'ok'){
        console.log("Video deleted on cloud")
    }

    let deleteThumbanil = await deleteOnCloudinary(thumbnailAndVideoObj.thumbnail)
    if(deleteThumbanil.result === 'ok'){
        console.log("Thumbnail deleted on cloud")
    }

    const video = await Video.findByIdAndDelete(videoId)
    if(!video){
        throw new ApiError("video not found")
    }

    return res
    .status(209)
    .json(
        new ApiResponse(209, video, "video successfully deleted")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "provide videoId to toggle publish status")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "video not found in togglepublish")
    }
    // To verify the user want to update publishStatus is same or not
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(401, "unauthorised request only owner can update video publish status")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        video._id,
        {
            $set: {
                isPublished: !video?.isPublished
            }
        },
        {
            new: true
        }
    )
    if(!updateVideo){
        throw new ApiError(500, "Error while updating the publish status")
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedVideo, "Publish status  successfully updated")
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
}
