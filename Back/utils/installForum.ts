require("dotenv").config();

import { prisma } from "../generated/prisma-client";

const newForum = [
    ["通知公告", "notification|#4e4bfc", "全团队公告以及信息"],
    ["新人任务", "solution|#47a189", "新人任务的发布与交付"],
    ["团队项目", "align-left|#634cb8", "团队项目的聚集地"],
    ["闲杂讨论", "message|#86C1B9", "在这里讨论什么都可以"],
    ["团队分享", "share-alt|#00d1e0", "分享各组的成果"],
    ["联创市场", "shopping-cart|#184b54", "内部二手交易信息交流"],
    ["团队资料", "paper-clip|#a67fe0", "团队各种流程，资源留存"]
];

(async function() {
    for (let [forum, icon, description] of newForum) {
        await prisma.createForum({
            name: forum,
            icon: icon,
            description: description
        });
    }
})();
