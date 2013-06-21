/**
 * Copyright (c) 2013 Wes Jones
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/*global angular */
(function () {
    'use strict';

    angular.scenario.dsl('waitFor', function () {

        var KEY_VALUE_METHODS = ['attr', 'css', 'prop'],
            VALUE_METHODS = [
                'val', 'text', 'html', 'height', 'innerHeight', 'outerHeight', 'width',
                'innerWidth', 'outerWidth', 'position', 'scrollLeft', 'scrollTop', 'offset'
            ],
            PASSTHROUGH_METHODS = ['mousedown', 'mouseup', 'focus', 'blur', 'change', 'enter', 'scrollTop'],
            chain = {};

        /**
         * Because it returns a count value. It must return a future.
         * @return {angular.scenario.Future}
         */
        chain.count = function () {
            return this.addFutureAction("element '" + this.label + "' count", function ($window, $document, done) {
                try {
                    done(null, $document.elements().length);
                } catch (e) {
                    done(null, 0);
                }
            });
        };

        /**
         * Returns the chain so it can have another call executed.
         * @return {Object}
         */
        chain.click = function () {
            this.addFutureAction("element '" + this.label + "' click", function ($window, $document, done) {
                var elements = $document.elements();
                var href = elements.attr('href');
                var eventProcessDefault = elements.trigger('click')[0];

                if (href && elements[0].nodeName.toUpperCase() === 'A' && eventProcessDefault) {
                    this.application.navigateTo(href, function () {
                        done();
                    }, done);
                } else {
                    done();
                }
            });
            return chain;
        };

        chain.trigger = function (eventName, params) {
            this.addFutureAction("element '" + this.label + "' " + eventName, function ($window, $document, done) {
                $document.elements().trigger(eventName, params);
                done();
            });
            return chain;
        };

        /**
         * Custom query that must return a future
         * @param fn
         * @return {angular.scenario.Future}
         */
        chain.query = function (fn) {
            return this.addFutureAction('element ' + this.label + ' custom query', function ($window, $document, done) {
                fn.call(this, $document.elements(), done);
            });
        };

        /**
         * Each of the KEY_VALUE_METHODS must return a future, because they return that object.
         */
        angular.forEach(KEY_VALUE_METHODS, function (methodName) {
            chain[methodName] = function (name, value) {
                var args = arguments,
                    futureName = (args.length == 1)
                        ? "element '" + this.label + "' get " + methodName + " '" + name + "'"
                        : "element '" + this.label + "' set " + methodName + " '" + name + "' to " + "'" + value + "'";

                return this.addFutureAction(futureName, function ($window, $document, done) {
                    var element = $document.elements();
                    done(null, element[methodName].apply(element, args));
                });
            };
        });

        /**
         * Each value method must return a Future because the values are used to validate.
         */
        angular.forEach(VALUE_METHODS, function (methodName) {
            chain[methodName] = function (value) {
                var args = arguments,
                    futureName = (args.length == 0)
                        ? "element '" + this.label + "' " + methodName
                        : futureName = "element '" + this.label + "' set " + methodName + " to '" + value + "'";

                return this.addFutureAction(futureName, function ($window, $document, done) {
                    var element = $document.elements();
                    done(null, element[methodName].apply(element, args));
                });
            };
        });

        /**
         * This performs an action. So it can return the chain.
         */
        angular.forEach(PASSTHROUGH_METHODS, function (methodName) {
            chain[methodName] = function (value) {
                var args = arguments;
                this.addFutureAction("element '" + this.label + "' " + methodName, function ($window, $document, done) {
                    var elms = $document.elements();
                    elms[methodName].apply(elms, args);
                    done();
                });
                return chain;
            };
        });

        /**
         * We want to have the addFutureAction function here to make things wait.
         * But we also want to return the chain so they can call more methods that will
         * be called after this addFutureAction so they are then futures of futures.
         */
        return function (selector, label, timeout) {
            var attempts = 0,
                self = this;
            if (isNaN(timeout)) {
                timeout = 10;
                label = label || selector; // in case they forgot to pass the label, make it still work.
            }
            this.label = label;
            this.addFutureAction("wait for element '" + label + "'", function ($window, $document, done) {
                var interval = $window.setInterval(function () {
                    var length = $document.find(selector).length;
                    if (length) {
                        $window.clearInterval(interval);
                        self.dsl.using(selector, label);
                        done(null, length);
                    } else if (attempts > timeout) {
                        $window.clearInterval(interval);
                        done("Timed out after " + timeout + " seconds. Element for '" + selector + "' was not found.");
                    }
                    attempts += 0.01;
                }, 10);
            });
            return chain;
        };
    });
}());
