
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["../model/log_entry"], function (LogEntry) {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function() { return frame.model(); },
            client = function(id) { return frame.model().clients.find(id); },
            node = function(id) { return frame.model().nodes.find(id); },
            wait = function() { var self = this; model().controls.show(function() { player.play(); self.stop(); }); };

        frame.after(1, function() {
            model().nodeLabelVisible = false;
            model().clear();
            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");
            layout.invalidate();
        })

        .after(800, function () {
            model().subtitle = '<h2><em>Raft</em> 是一种分布式共识协议</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2> 让我们来看看它是如何运转的。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(100, function () {
            frame.snapshot();
            model().zoom([node("b")]);
            model().subtitle = '<h2> 一个 <em>node - 节点</em> 可以是三种状态中的一种:</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            node("b")._state = "follower";
            model().subtitle = '<h2>The <em>Follower - 跟随者</em> state,</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            node("b")._state = "candidate";
            model().subtitle = '<h2>the <em>Candidate - 候选人</em> state,</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            node("b")._state = "leader";
            model().subtitle = '<h2>or the <em>Leader - 领导</em> state.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()

        .after(300, function () {
            frame.snapshot();
            model().zoom(null);
            node("b")._state = "follower";
            model().subtitle = '<h2>所有节点默认都是Follewer状态.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>如果Follower没有收到来自Leader的消息，那么它就成为候选人。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, function () {
            node("a")._state = "candidate";
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>候选人会发送给自己<em>vote - 投票</em>的请求到其他节点</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, function () {
            model().send(node("a"), node("b"), {type:"RVREQ"})
            model().send(node("a"), node("c"), {type:"RVREQ"})
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>其他节点会回复他们的投票情况。/</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(300, function () {
            model().send(node("b"), node("a"), {type:"RVRSP"}, function () {
                node("a")._state = "leader";
                layout.invalidate();
            })
            model().send(node("c"), node("a"), {type:"RVRSP"}, function () {
                node("a")._state = "leader";
                layout.invalidate();
            })
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>如果候选人获得了节点中的大多数投票，那么它将成为 leader 节点。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>这个过程就被称为<em>leader Election - leader选举</em>.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>系统的所有变更都需要经过leader来决定。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle += " ";
            model().clients.create("x");
            layout.invalidate();
        })
        .after(1000, function () {
            client("x")._value = "5";
            layout.invalidate();
        })
        .after(500, function () {
            model().send(client("x"), node("a"), null, function () {
                node("a")._log.push(new LogEntry(model(), 1, 1, "SET 5"));
                layout.invalidate();
            });
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>每一个变更都会以一个记录添加到节点日志中。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>日志记录现在是未提交状态，所以我们不会更新节点的值</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(300, function () {
            frame.snapshot();
            model().send(node("a"), node("b"), {type:"AEREQ"}, function () {
                node("b")._log.push(new LogEntry(model(), 1, 1, "SET 5"));                
                layout.invalidate();
            });
            model().send(node("a"), node("c"), {type:"AEREQ"}, function () {
                node("c")._log.push(new LogEntry(model(), 1, 1, "SET 5"));
                layout.invalidate();
            });
            model().subtitle = '<h2>为了提交记录，节点首先需要将它复制到follewer节点</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(node("b"), node("a"), {type:"AEREQ"}, function () {
                node("a")._commitIndex = 1;
                node("a")._value = "5";
                layout.invalidate();
            });
            model().send(node("c"), node("a"), {type:"AEREQ"});
            model().subtitle = '<h2>然后leader节点等待大多数节点写入entry成功。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1000, function () {
            node("a")._commitIndex = 1;
            node("a")._value = "5";
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>现在entry在leader节点确认成功。在主节点的值是5</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(node("a"), node("b"), {type:"AEREQ"}, function () {
                node("b")._value = "5";
                node("b")._commitIndex = 1;
                layout.invalidate();
            });
            model().send(node("a"), node("c"), {type:"AEREQ"}, function () {
                node("c")._value = "5";
                node("c")._commitIndex = 1;
                layout.invalidate();
            });
            model().subtitle = '<h2> leader节点通过广播通知follewer节点，有一条记录已经被确认。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2> 集群现在达成了共识状态。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(300, function () {
            frame.snapshot();
            model().subtitle = '<h2> 这个过程就被称为 <em>Log Replication - 日志复制</em></h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(300, function () {
            frame.snapshot();
            player.next();
        })


        player.play();
    };
});
