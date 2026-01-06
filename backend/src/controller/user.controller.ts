import { Request, Response } from "express";
import User from "../models/User.js";
import UserBlock from "../models/UserBlock.js";
import { getReceiverSocketId, io } from "../lib/socket.io.js";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getPublicProfile = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, deletedAt: null }).select("fullName username bio profilePic");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id.toString(),
        fullName: user.fullName,
        username: user.username,
        bio: user.bio,
        profilePic: user.profilePic
      }
    });
  } catch (error: any) {
    const message = error?.message || JSON.stringify(error) || "Unknown server error";
    res.status(500).json({ success: false, message });
  }
};

export const blockUser = async (req: Request, res: Response<ApiResponse<null>>) => {
  try {
    const blockerId = (req as any).user?._id;
    const { id: blockedId } = req.params;
    if (!blockerId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (blockerId.toString() === blockedId) {
      return res.status(400).json({ success: false, message: "Cannot block yourself" });
    }

    const blockedUser = await User.findOne({ _id: blockedId, deletedAt: null });
    if (!blockedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await UserBlock.updateOne(
      { blockerId, blockedId },
      { $setOnInsert: { blockerId, blockedId } },
      { upsert: true }
    );

    const receiverSocketId = getReceiverSocketId(blockedId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userBlocked", { userId: blockerId.toString() });
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    const message = error?.message || JSON.stringify(error) || "Unknown server error";
    res.status(500).json({ success: false, message });
  }
};

export const unblockUser = async (req: Request, res: Response<ApiResponse<null>>) => {
  try {
    const blockerId = (req as any).user?._id;
    const { id: blockedId } = req.params;
    if (!blockerId) return res.status(401).json({ success: false, message: "Unauthorized" });

    await UserBlock.deleteOne({ blockerId, blockedId });

    const receiverSocketId = getReceiverSocketId(blockedId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userUnblocked", { userId: blockerId.toString() });
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    const message = error?.message || JSON.stringify(error) || "Unknown server error";
    res.status(500).json({ success: false, message });
  }
};

export const getBlockedUsers = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const blocked = await UserBlock.find({ blockerId: userId }).select("blockedId");
    const blockedBy = await UserBlock.find({ blockedId: userId }).select("blockerId");

    res.status(200).json({
      success: true,
      data: {
        blockedIds: blocked.map((entry) => entry.blockedId.toString()),
        blockedByIds: blockedBy.map((entry) => entry.blockerId.toString())
      }
    });
  } catch (error: any) {
    const message = error?.message || JSON.stringify(error) || "Unknown server error";
    res.status(500).json({ success: false, message });
  }
};

export const getBlockedUsersDetailed = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const blocks = await UserBlock.find({ blockerId: userId }).sort({ createdAt: -1 });
    const blockedIds = blocks.map((entry) => entry.blockedId.toString());
    if (!blockedIds.length) {
      return res.status(200).json({ success: true, data: { blocked: [] } });
    }

    const blockedUsers = await User.find({ _id: { $in: blockedIds }, deletedAt: null })
      .select("fullName username profilePic");

    const blockedMap = new Map(blockedUsers.map((user) => [user._id.toString(), user]));

    const blocked = blocks
      .map((entry) => {
        const user = blockedMap.get(entry.blockedId.toString());
        if (!user) return null;
        return {
          userId: user._id.toString(),
          displayName: user.fullName,
          username: user.username,
          avatarUrl: user.profilePic,
          blockedAt: entry.createdAt
        };
      })
      .filter(Boolean);

    res.status(200).json({ success: true, data: { blocked } });
  } catch (error: any) {
    const message = error?.message || JSON.stringify(error) || "Unknown server error";
    res.status(500).json({ success: false, message });
  }
};
