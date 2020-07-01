
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function() { return frame.model(); },
            client = function(id) { return frame.model().clients.find(id); },
            node = function(id) { return frame.model().nodes.find(id); },
            cluster = function(value) { model().nodes.toArray().forEach(function(node) { node.cluster(value); }); },
            wait = function() { var self = this; model().controls.show(function() { self.stop(); }); },
            subtitle = function(s, pause) { model().subtitle = s + model().controls.html(); layout.invalidate(); if (pause === undefined) { model().controls.show() }; };

        //------------------------------
        // Title
        //------------------------------
        frame.after(1, function() {
            model().clear();
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().title = '<h2 style="visibility:visible">Leader Election - Leader 选举</h1>'
                                + '<br/>' + frame.model().controls.html();
            layout.invalidate();
        })
        .after(200, wait).indefinite()
        .after(500, function () {
            model().title = "";
            layout.invalidate();
        })

        //------------------------------
        // Initialization
        //------------------------------
        .after(300, function () {
            model().nodes.create("A").init();
            model().nodes.create("B").init();
            model().nodes.create("C").init();
            cluster(["A", "B", "C"]);
        })

        //------------------------------
        // Election Timeout
        //------------------------------
        .after(1, function () {
            model().ensureSingleCandidate();
            model().subtitle = '<h2>In Raft there are two timeout settings which control elections.在Raft协议中，有两个超时设置可以用来控制election- 选举.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(model().electionTimeout / 2, function() { model().controls.show(); })
        .after(100, function () {
            subtitle('<h2>First is the <span style="color:green">election timeout</span>.第一个是<span style="color:green">election timeout - 选举超时</span></h2>');
        })
        .after(1, function() {
            subtitle('<h2>The election timeout is the amount of time a follower waits until becoming a candidate.</h2>');
        })
        .after(1, function() {
            subtitle('<h2>选举超时时间在150ms 到 300ms 之间随机.</h2>');
        })
        .after(1, function() {
            subtitle("", false);
        })

        //------------------------------
        // Candidacy
        //------------------------------
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "candidate");
        })
        .after(1, function () {
            subtitle('<h2>After the election timeout the follower becomes a candidate and starts a new <em>election term</em>... 在经过选举超时以后，节点会从跟随者状态变成候选人状态，开始一个新的<em>eleation term - 选举任期</em>...</h2>');
        })
        .after(1, function () {
            subtitle('<h2>...votes for itself... 节点首先给自己投票</h2>');
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>...and sends out <em>Request Vote</em> messages to other nodes. ...发送<em> 投票请求 </em>消息给其他节点</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>If the receiving node hasn\'t voted yet in this term then it votes for the candidate... 接收到投票请求消息的节点，如果在当前 term-任期内没有投票过，那么它就给候选人投票...</h2>');
        })
        .after(1, function () {
            subtitle('<h2>...and the node resets its election timeout. 节点重置自己的选举超时时间</h2>');
        })


        //------------------------------
        // Leadership & heartbeat timeout.
        //------------------------------
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            subtitle('<h2>Once a candidate has a majority of votes it becomes leader.一旦一个 candidate - 候选人 获得了大多数的投票，它就直接成为 leader.</h2>');
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>The leader begins sending out <em>Append Entries</em> messages to its followers. Leader 开始发送 <em>Append Entries - 追加条目</em>消息给它的follower。</h2>');
        })
        .after(1, function () {
            subtitle('<h2>These messages are sent in intervals specified by the <span style="color:red">heartbeat timeout</span>.</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>Followers then respond to each <em>Append Entries</em> message.</h2>');
        })
        .after(1, function () {
            subtitle('', false);
        })
        .after(model().heartbeatTimeout * 2, function () {
            subtitle('<h2>This election term will continue until a follower stops receiving heartbeats and becomes a candidate. 当前的 election term - 选举任期会一直持续，直到有某一个 follewer 无法接收到心跳消息，然后变成 candidate - 候选人。</h2>', false);
        })
        .after(100, wait).indefinite()
        .after(1, function () {
            subtitle('', false);
        })

        //------------------------------
        // Leader re-election
        //------------------------------
        .after(model().heartbeatTimeout * 2, function () {
            subtitle('<h2>Let\'s stop the leader and watch a re-election happen. 现在我们停止leader节点，观察一下重选举是什么进行。</h2>', false);
        })
        .after(100, wait).indefinite()
        .after(1, function () {
            subtitle('', false);
            model().leader().state("stopped")
        })
        .after(model().defaultNetworkLatency, function () {
            model().ensureSingleCandidate()
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            subtitle('<h2>Node -节点 ' + model().leader().id + ' 现在称为了 term - 任期 ' + model().leader().currentTerm() + '的 leader.</h2>', false);
        })
        .after(1, wait).indefinite()

        //------------------------------
        // Split Vote
        //------------------------------
        .after(1, function () {
            subtitle('<h2>Requiring a majority of votes guarantees that only one leader can be elected per term. 需要大多数投票才能称为 leader的机制，保证了每轮任期内，都只有一个leader被选举出来。</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>If two nodes become candidates at the same time then a split vote can occur. 如果两个节点同事变成了候选人状态，那么就会出现脑裂现象。</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>Let\'s take a look at a split vote example... 我们来举一个脑裂的例子</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('', false);
            model().nodes.create("D").init().currentTerm(node("A").currentTerm());
            cluster(["A", "B", "C", "D"]);

            // Make sure two nodes become candidates at the same time.
            model().resetToNextTerm();
            var nodes = model().ensureSplitVote();

            // Increase latency to some nodes to ensure obvious split.
            model().latency(nodes[0].id, nodes[2].id, model().defaultNetworkLatency * 1.25);
            model().latency(nodes[1].id, nodes[3].id, model().defaultNetworkLatency * 1.25);
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "candidate");
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>Two nodes both start an election for the same term... C 和 D 节点在同一个term 4 中开始选举</h2>');
        })
        .after(model().defaultNetworkLatency * 0.75, function () {
            subtitle('<h2>...and each reaches a single follower node before the other.</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>Now each candidate has 2 votes and can receive no more for this term. 现在每个候选人都有两票，而且投票已经完成了。</h2>');
        })
        .after(1, function () {
            subtitle('<h2>The nodes will wait for a new election and try again. 所有节点等待开始下一轮选举。</h2>', false);
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            model().resetLatencies();
            subtitle('<h2>Node -节点 ' + model().leader().id + ' 收到了 term ' + model().leader().currentTerm() + ' 的大多数投票，所以它成为了leader so it becomes leader.</h2>', false);
        })
        .after(1, wait).indefinite()

        .then(function() {
            player.next();
        })


        player.play();
    };
});
