/**!
 * delegate-event.test.js - test/delegate-event.test.js
 *
 * Copyright(c) 2014 luckydrq Holding Limited.
 * Authors:
 *   luckydrq <drqzju@gmail.com> (http://github.com/luckydrq)
 */

"use strict";

/**
 * Module dependencies
 */
var assert = require('assert');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var delegate = require('../index');

describe('delegate event test', function() {
  it('should support literal event', function(done) {
    var sender = new EE();
    var recv = new EE();
    var i = 0;

    sender.on('addI', function() {
      ++i;
    });
    recv.on('addI', function() {
      ++i;
    });

    delegate(sender, recv, 'addI');
    sender.emit('addI');
    assert.ok(i === 2);
    done();
  });

  it('should be idempotent', function(done) {
    var sender = new EE();
    var recv = new EE();
    var i = 0;

    sender.on('addI', function() {
      ++i;
    });
    recv.on('addI', function() {
      ++i;
    });

    delegate(sender, recv, 'addI');
    delegate(sender, recv, 'addI');
    delegate(sender, recv, 'addI');
    delegate(sender, recv, 'addI');
    sender.emit('addI');
    assert.ok(i === 2);
    done();
  });

  it('should support *', function(done) {
    var sender = new EE();
    var recv = new EE();
    var a = 0, b = 0;

    sender.on('addA', function() {
      ++a;
    });
    sender.on('addB', function() {
      ++b;
    });
    recv.on('addA', function() {
      ++a;
    });
    recv.on('addB', function() {
      ++b;
    });

    delegate(sender, recv, 'add*');
    sender.emit('addA');
    sender.emit('addB');
    assert.ok(a === 2);
    assert.ok(b === 2);
    done();
  });

  it('should support regexp', function(done) {
    var sender = new EE();
    var recv = new EE();
    var a = 0;

    sender.on('addA', function() {
      ++a;
    });
    recv.on('addA', function() {
      ++a;
    });

    delegate(sender, recv, /add\w*/);
    sender.emit('addA');
    assert.ok(a === 2);
    done();
  });

   it('should support space', function(done) {
    var sender = new EE();
    var recv = new EE();
    var a = 0;

    sender.on('add A', function() {
      ++a;
    });
    recv.on('add A', function() {
      ++a;
    });

    delegate(sender, recv, 'add A');
    sender.emit('add A');
    assert.ok(a === 2);
    done();
  });

  it('should be nested', function(done) {
    var sender = new EE();
    var recv = new EE();
    var recv2 = new EE();
    var a = 0, b = 0, c = 0;

    sender.on('add', function() {
      ++a;
    });
    recv.on('add', function() {
      ++b;
    });
    recv2.on('add', function() {
      ++c;
    });

    delegate(sender, recv, 'add*');
    delegate(recv, recv2, 'add*');
    sender.emit('add');
    assert.ok(a === 1);
    assert.ok(b === 1);
    assert.ok(c === 1);
    done();
  });
});

function EE() {
  EventEmitter.call(this);
}

util.inherits(EE, EventEmitter);
