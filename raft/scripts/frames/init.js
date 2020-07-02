
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./playground", "./title", "./intro", "./overview", "./election", "./replication", "./conclusion"],
    function (playground, title, intro, overview, election, replication, conclusion) {
        return function (player) {
            // player.frame("playground", "Playground", playground);
            player.frame("home", "首页", title);
            player.frame("intro", "分布式共识算法是什么?", intro);
            player.frame("overview", "协议概览", overview);
            player.frame("election", "Leader Election - Leader 选举", election);
            player.frame("replication", "Log Replication - 日志复制", replication);
            player.frame("conclusion", "Other Resources - 其他资源", conclusion);
        };
    });
