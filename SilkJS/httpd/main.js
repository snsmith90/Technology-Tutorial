#!/usr/local/bin/silkjs
// httpd/main.js

print_r = require('builtin/print_r');
console = require('console');
fs = require('fs');

LogFile = require('LogFile');
net = require('builtin/net');
process = require('builtin/process');
async = require('builtin/async');
v8 = require('builtin/v8');
http = require('builtin/http');
buffer = require('builtin/buffer');

uglify = require('UglifyJS/uglify-js');

//include('lib/phpjs.js');
include('lib/forEach.js');
//include('lib/Exceptions.js');
include('lib/Util.js');
Json = require('Json');
include('lib/Jst.js');
include('lib/Showdown.js');
var SSH = require('SSH');
////
include('httpd/config.js');
include('httpd/Server.js');
include('httpd/request.js');
include('httpd/response.js');
include('httpd/child.js');

function main() {
    var debugMode = false;
    // load any user provided JavaScripts
    arguments.each(function(arg) {
        if (arg === '-d') {
            debugMode = true;
            return false;
        }
    });

    if (debugMode) {
        v8.enableDebugger();
        log('Running in debug mode');
    }
    arguments.each(function(arg) {
        if (arg.endsWith('.js') || arg.endsWith('.coffee')) {
            include(arg);
        }
    });
    if (Config.mysql) {
        MySQL = require('MySQL').MySQL;
    }

    var pid;
    // var fd = fs.open(Config.lockFile, fs.O_WRONLY|fs.O_CREAT|fs.O_TRUNC, parseInt('0644', 8));
    // fs.close(fd);
    var serverSocket = net.listen(Config.port, 50, Config.listenIp);
    global.logfile = new LogFile(Config.logFile || '/tmp/httpd-silkjs.log');
    
    Server.onStart();

    if (debugMode) {
        while (1) {
            HttpChild.run(serverSocket, process.getpid());
        }
    }
    
    var List = require('List').List,
        freeList = new List(),
        activeList = new List();

    for (var n=0; n<Config.numChildren*2; n++) {
        freeList.addTail({ n: n, pid: 0, control: 0, status: '' });
    }

    function dumpList(list, heading) {
        heading = heading || 'List Dump';
        console.log(heading);
        list.each(function(node) {
            console.dir({
                n: node.n,
                pid: node.pid,
                control: node.control,
                status: node.status
            });
        });
    }

    var children = {},
        children_map = {};
    function forkChild() {
        var pair = net.socketpair();
        if (pair === false) {
            console.dir(fs.error());
            return;
        }
        pid = process.fork();
        if (pid === 0) {
            net.close(pair[1]);
            HttpChild.run(serverSocket, process.getpid(), pair[0]);
            process.exit(0);
        }
        else if (pid == -1) {
            console.error(process.error());
        }
        else {
            net.close(pair[0]);
            var node = freeList.remHead();
            node.pid = pid;
            node.control = pair[1];
            node.status = 'f';
            activeList.addTail(node);
            children_map[pair[1]] = children[pid] = node;
        }
    }

    for (var i=0; i<Config.numChildren; i++) {
        forkChild();
    }
    var logMessage = 'SilkJS HTTP running with ' + Config.numChildren + ' children on port ' + Config.port + ' from documentRoot ' + Config.documentRoot;
    if (Config.listenIp !== '0.0.0.0') {
        logMessage += ' on IP ' + Config.listenIp;
    }
//    console.log('Silk running with ' + Config.numChildren + ' children on port ' + Config.port);
//    logfile.write('Silk running with ' + Config.numChildren + ' children on port ' + Config.port + '\n');
    console.log(logMessage);
    logfile.writeln(logMessage);


    var readfds = async.alloc_fd_set();
    var maxfd;
    function build_fd_set() {
        async.FD_ZERO(readfds);
        async.FD_SET(serverSocket, readfds);
        maxfd = serverSocket;
        activeList.each(function(child) {
            // if (!child.control) {
            //     console.dir(child);
            //     dumpList(activeList);
            // }
            var fd = child.control;
            if (fd > maxfd) {
                maxfd = fd;
            }
            async.FD_SET(fd, readfds);
        });
    }

    var child;
    function processInput(fd) {
        if (fd === serverSocket) {
            return;
        }
        var child = children_map[fd];
        if (!child) {
            // console.log('processInput no child ' + fd);
            return;
        }
        var status = async.read(child.control, 1);
        if (status === false) {
            return;
        }
        child.status = status;
        wakeupChild();
    }
    var wakeupCount = 0;
    function wakeupChild() {
        if (!wakeupCount) {
            return;
        }
        if (activeList.next.status !== 'r') {
            return;
        }
        var child = activeList.remHead();
        net.write(child.control, 'g', 1);
        net.read(child.control, 1);
        child.status = 'x';
        wakeupCount--;
        activeList.addTail(child);
    }

    function removeChild(pid) {
        var child = children[pid];
        if (child) {
            var control = child.control;
            async.close(control);
            activeList.remove(child);
            freeList.addTail(child);
            delete children_map[control];
            delete children[child.pid];
        }
    }
    while (true) {
        build_fd_set();
        var o = async.select(maxfd+1, readfds);
        while ((child = process.wait(true))) {
            if (!children[child.pid]) {
                console.log('********************** CHILD EXITED THAT IS NOT HTTP CHILD');
                continue;
            }
            removeChild(child.pid);
            forkChild();
        }
        if (o !== false) {
            // console.dir(o);
            o.read.each(processInput);
            if (o.read.indexOf(serverSocket) !== -1) {
                wakeupCount++;
            }
            if (wakeupCount) {
                wakeupChild();
            }
        }
    }
}
