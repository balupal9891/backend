import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/users.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    const channel = await User.findById(channelId).select("_id username")
    if(!channel){
        throw new ApiError(400,"Provide channel to toggleSubscription")
    }

    const isSubscribed = await Subscription.findOne(
        {
            channel: channel?._id,
            subscriber: req.user?._id
        }
    )

    if(isSubscribed){
        const deleted = await Subscription.deleteOne(
            {
                channel: channel?._id,
                subscriber: req.user?._id
            }
        )
        if(!deleted){
            throw new ApiError(500, "Error while deleting or unsubscribing the channel in db")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "successfully unsubscribed the channel")
        )
    }
    else{
        const created = await Subscription.create({
            subscriber: req.user._id,
            channel: channel._id
        })
        if(!created){
            throw new ApiError(501, "Error while creating or subscribing the channel in db")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "successfully subscribed the channel")
        )
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const channel = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $project: {
                subscribers: 1,
                username: 1,
                fullname: 1,
            }
        }
    ])

    if(!channel){
        throw new ApiError(501, "Error while fetching the channel subscriber in db")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0],"channel subscribers successfully fetched" )
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    console.log(subscriberId)
    const channel = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $project: {
                subscribedTo: 1,
                username: 1,
                fullname: 1,
            }
        }
    ])

    if(!channel){
        throw new ApiError(501, "Error while fetching the subscribed channels of user in db")
    }
    console.log(channel)
    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0],"subscribed channel successfully fetched")
    )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}