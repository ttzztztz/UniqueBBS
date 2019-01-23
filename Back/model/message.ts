import { prisma, Message } from "../generated/prisma-client";
import { Request, Response } from "express";
import { verifyJWT } from "./check";
import { pagesize } from "./consts";
import { socketPushMessage } from "./socket";

export const MESSAGE_REPLY = (username: string, subject: string) => `${username}回复了您的帖子《${subject}》！`;
export const MESSAGE_QUOTE = (username: string, subject: string) => `${username}引用了您在帖子《${subject}》中的回复！`;
export const MESSAGE_DIAMOND = (subject: string) => `您的帖子《${subject}》被管理员设置为精华帖子！`;
export const MESSAGE_SET_MENTOR = (fromUsername: string) => `${fromUsername}将您设为了Mentor！`;

export const MESSAGE_THREAD_URL = (tid: string) => `/thread/info/${tid}/1`;
export const MESSAGE_REPORT_URL = `/report/mentor`;

export const pushMessage = async function(fromUid: string, toUid: string, msg: string, url?: string) {
    const result: Message = await prisma.createMessage({
        fromUser: {
            connect: {
                id: fromUid
            }
        },
        toUser: {
            connect: {
                id: toUid
            }
        },
        message: msg,
        createDate: new Date(),
        url: url
    });
    await socketPushMessage(toUid, msg);
    return result;
};

export const messageIsRead = async function(req: Request, res: Response) {
    try {
        const { uid, isAdmin } = verifyJWT(req.header("Authorization"));
        const { id } = req.params;

        const messageInfo = await prisma.message({
            id: id
        });

        if (!messageInfo) {
            return res.json({ code: -1, msg: "此条消息不存在！" });
        }

        if (messageInfo.isRead) {
            return res.json({ code: 1 });
        }

        const messageToUserInfo = await prisma
            .message({
                id: id
            })
            .toUser();

        if (!isAdmin && uid !== messageToUserInfo.id) {
            return res.json({ code: -1, msg: "您无权操作此条消息。" });
        }

        await prisma.updateMessage({
            where: {
                id: id
            },
            data: {
                isRead: true
            }
        });

        res.json({ code: 1 });
    } catch (err) {
        res.json({ code: -1, msg: err.message });
    }
    return 1;
};

export const messageList = async function(req: Request, res: Response) {
    try {
        const { uid } = verifyJWT(req.header("Authorization"));
        let { page } = req.params;
        page = Number.parseInt(page);

        const resultRAW: Array<Message> = await prisma.messages({
            where: {
                toUser: {
                    id: uid
                }
            },
            skip: (page - 1) * pagesize,
            first: pagesize,
            orderBy: "createDate_DESC"
        });

        const result = await Promise.all(
            resultRAW.map(async item => ({
                messageItem: item,
                fromUser: await prisma
                    .message({
                        id: item.id
                    })
                    .fromUser()
            }))
        );
        res.json({ code: 1, msg: result });
    } catch (err) {
        res.json({ code: -1, msg: err.message });
    }
};

export const messageDelete = async function(req: Request, res: Response) {
    try {
        const { uid, isAdmin } = verifyJWT(req.header("Authorization"));
        const { id } = req.params;
        const messageInfo = await prisma.message({
            id: id
        });

        if (!messageInfo) {
            return res.json({ code: -1, msg: "此条消息不存在！" });
        }

        const messageToUserInfo = await prisma
            .message({
                id: id
            })
            .toUser();

        if (!isAdmin && uid !== messageToUserInfo.id) {
            return res.json({ code: -1, msg: "您无权操作此条消息。" });
        }

        await prisma.deleteMessage({
            id: id
        });

        res.json({ code: 1 });
    } catch (err) {
        res.json({ code: -1, msg: err.message });
    }
    return 1;
};

export const messageReadAll = async function(req: Request, res: Response) {
    try {
        const { uid } = verifyJWT(req.header("Authorization"));
        await prisma.updateManyMessages({
            where: {
                toUser: {
                    id: uid
                },
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        res.json({ code: 1 });
    } catch (err) {
        res.json({ code: -1, msg: err.message });
    }
};

export const messageDeleteAll = async function(req: Request, res: Response) {
    try {
        const { uid } = verifyJWT(req.header("Authorization"));
        await prisma.deleteManyMessages({
            toUser: {
                id: uid
            }
        });
        res.json({ code: 1 });
    } catch (err) {
        res.json({ code: -1, msg: err.message });
    }
};

export const messageCount = async function(req: Request, res: Response) {
    try {
        const { uid } = verifyJWT(req.header("Authorization"));
        const total = await prisma
            .messagesConnection({
                where: {
                    toUser: {
                        id: uid
                    }
                }
            })
            .aggregate()
            .count();
        const unread = await prisma
            .messagesConnection({
                where: {
                    toUser: {
                        id: uid
                    },
                    isRead: false
                }
            })
            .aggregate()
            .count();

        const [last] = await prisma.messages({
            where: {
                toUser: {
                    id: uid
                }
            },
            orderBy: "createDate_DESC",
            first: 1
        });

        res.json({ code: 1, msg: { total, unread, last } });
    } catch (err) {
        res.json({ code: -1, msg: err.message });
    }
};
