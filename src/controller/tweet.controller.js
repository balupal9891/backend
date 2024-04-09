import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/users.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content?.trim()){
        throw new ApiError(400, "All fields are required")
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.user?._id
    })
    if(!tweet){
        throw new ApiError(500, "Error while uploading tweet or creating tweet document")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet successfully uploaded")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user 
    const {userId} = req.params
    if(!userId){
        throw new ApiError(400, "provide userId to fetch their tweet")
    }

    const user = await User.findById(userId).select("_id username")
    if(!user){
        throw new ApiError(400, "User not found")
    }

    const tweets = await Tweet.find({
        owner: user._id
    })
    if(!tweets){
        throw new ApiError(500, "Error while fetching the tweets from db")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweets, "Tweets successfully fetched")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    if(!tweetId){
        throw new ApiError(400, "Provide tweetId to update tweet")
    }

    // To verify that the user want to update the is same or owner or not 
    const tweet = await Tweet.findById(tweetId)
    if(!tweet.owner.equals(req.user._id)){
        throw new ApiError(401, "unauthorised request only owner can update tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweet._id,
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        }
    )
    if(!updatedTweet){
        throw new ApiError(500, "Error while updating the tweet")
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedTweet, "tweet successfully updated")
    )
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400, "Provide tweetId to delete tweet")
    }

    // To verify that the user want to delete the is same or owner or not 
    const tweet = await Tweet.findById(tweetId)
    if(!tweet.owner.equals(req.user._id)){
        throw new ApiError(401, "unauthorised request only owner can delete tweet")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweet._id)
    console.log(deleteTweet)
    if(!deleteTweet){
        throw new ApiError(501, "Error while deleting the tweet in db")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedTweet, "Tweet successfully deleted")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
