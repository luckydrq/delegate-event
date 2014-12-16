/**!
 * index.js
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
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('delegate-event');
var slice = Array.prototype.slice;

module.exports = delegate;

function delegate(sender, receiver, pattern) {
  assert.ok(sender instanceof EventEmitter);
  assert.ok(receiver instanceof EventEmitter);

  pattern = pattern || '*';
  if (!Array.isArray(pattern)) pattern = [pattern];

  var delegateEvents = sender._delegateEvents = sender._delegateEvents || {};
  pattern.forEach(function(p) {
    var re = makeRegExp(p);
    var reStr = re.toString();
    debug('got pattern: %s', reStr);
    var receivers = delegateEvents[reStr] || (delegateEvents[reStr] = []);
    receivers.re = re;
    if (!~receivers.indexOf(receiver)) receivers.push(receiver);
  });

  // already hooked, just return
  if (sender._delegated) return;

  Object.keys(sender._events).forEach(function(evt) {
    sender.on(evt, function() {
      debug('sender emit %s', evt);
      var args = slice.call(arguments);
      dispatchEvent(sender, evt, args);
    });
  });

  sender._delegated = true;
}

function dispatchEvent(sender, event, args) {
  var delegateEvents = sender._delegateEvents;

  Object.keys(delegateEvents).forEach(function(reStr) {
    var receivers = delegateEvents[reStr];
    var re = receivers.re;

    if (re.test(event)) {
      receivers.forEach(function(receiver) {
        debug('receiver emit %s', event);
        receiver.emit.apply(receiver, [event].concat(args));
      });
    }
  });
}

function makeRegExp(pattern) {
  if (pattern instanceof RegExp) return pattern;
  if (!pattern || 'string' !== typeof pattern) {
    pattern = '*';
  }

  if (pattern[0] === '^') pattern = pattern.slice(1);
  if (pattern[pattern.length - 1] === '$') pattern = pattern.slice(-1);

  var re = [];

  re.push('^');

  for (var i = 0; i < pattern.length; i++) {
    var ch = pattern[i];

    if ('?' === ch || '+' === ch || '*' === ch) {
      var pre = pattern[i - 1];
      if (pre !== '\\' && pre !== ']' && pre !== '.' && pre !== ')') {
        re.push('[\\w ]');
      }
    }

    re.push(ch);
  }

  re.push('$');

  // do not use `g` flag
  // @see http://stackoverflow.com/questions/6891545/javascript-regexp-test-returns-false-even-though-it-should-return-true
  return new RegExp(re.join(''), 'i');
}
