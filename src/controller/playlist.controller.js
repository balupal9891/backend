import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if(!name || !description){
        throw new ApiError(400, "All fields are required")
    }

    const playlist = await Playlist.create({
        name: name,
        description: description,
        videos: [],
        owner: req.user?._id
    })
    if(!playlist){
        throw new ApiError(500, "Error while creating playlist in db")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist create successfully")
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId){
        throw new ApiError(400, "Provide userId to get user playlists")
    }

    const playlists = await Playlist.find({
        owner:  userId
    })
    if(!playlists){
        throw new ApiError(400, "User playlists not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlists, "Playlist successfully fetched")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId){
        throw new ApiError(400, "provide playlistId to fetch playlist")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist not found provide valid Id")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist successfully fetched")
    )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId){
        throw new ApiError(400, "playlistId is required to create playlist")
    }
    if(!videoId){
        throw new ApiError(400, "playlistId is required to create playlist")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "playlistId not found in db")
    }

    if(!(playlist.owner.toString() === req.user._id.toString())){
        throw new ApiError(401, "Unauthorized only owner can add video")
    }

    const video = await Video.findById(videoId).select("_id")
    if(!video){
        throw new ApiError(400, "video not found in db")
    }

    if(playlist.videos.includes(videoId)){
        return res
        .status(210)
        .json(
            new ApiResponse(210, {}, "Video already available")
        )
    }
    playlist.videos.push(video)
    playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video added successfully")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!(playlistId && videoId)){
        throw new ApiError(400, "provide both playlistId and videoId to remove video from playlist")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "playlist not found")
    }

    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(401, "unathorized Only owner can remove video from playlist")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "video not found want to add in playlist")
    }

    if(!video.owner.equals(req.user?._id)){
        throw new ApiError(401, "unathorized Only video's owner can add video in playlist")
    }

    if(playlist.videos.includes(videoId)){
        playlist.videos.remove(videoId)
        playlist.save()
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "video removed successfully from playlist")
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(210, {}, "video not available in playlist")
        )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(400, "provide playlistId to delete playlist")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "playlist not found")
    }

    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(401, "unathorized Only owner can delete playlist")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId).select("owner name")
    if(!deletedPlaylist){
        throw new ApiError(500, "Error while deleting the playlist in db")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(210, deletedPlaylist, "playlist deleted")
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId){
        throw new ApiError(400, "provide playlistId to delete playlist")
    }
    if(!(name && description)){
        throw new ApiError("provide both name and description to update playlist")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "playlist not found")
    }

    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(401, "unathorized Only owner can pwner playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name,
                description: description
            }
        },
        {
            new: true
        }
    ).select("name description")
    if(!updatedPlaylist){
        throw new ApiError(500, "Error while updating the playlist in db")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(210, updatedPlaylist, "playlist updated")
        )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
