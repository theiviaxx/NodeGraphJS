/*
 * Copyright (c) 2009-2010 Takashi Kitao
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @class A 2-element vector which is represented by xy coordinates.
 * @param {Number} x The x-coordinate. Possible not to specify.
 * @param {Number} y The y-coordinate. Possible not to specify.
 */
NodeGraph.Vector2D = function() {
    /** hoge */
    this.x = 0.0;

    /** hoge */
    this.y = 0.0;

    if (arguments === 2) {
        this.x = arguments[0];
        this.y = arguments[1];
    } else if (arguments === 1) {
        this.x = arguments[0].x;
        this.y = arguments[0].y;
    }
};

/** private */
NodeGraph.Vector2D._s1 = 0.0;

/** private */
NodeGraph.Vector2D._s2 = 0.0;

/** private */
NodeGraph.Vector2D._v1 = NodeGraph.Vector2D();

/**
 * Sets the coordinates.
 * @param {Number} x The x-coordinate.
 * @param {Number} y The y-coordinate.
 */
NodeGraph.Vector2D.prototype.set = function()
{
    if (arguments === 2) {
        this.x = arguments[0];
        this.y = arguments[1];
    } else if (arguments === 1) {
        this.x = arguments[0].x;
        this.y = arguments[0].y;
    }
};

/**
 *
 */
NodeGraph.Vector2D.prototype.neg = function() {
    this.x = -this.x;
    this.y = -this.y;
};

/**
 *
 * @param {NodeGraph.Vector2D} vec2
 */
NodeGraph.Vector2D.prototype.add = function(vec) {
    this.x += vec.x;
    this.y += vec.y;
};

/**
 *
 * @param {NodeGraph.Vector2D} vec2
 */
NodeGraph.Vector2D.prototype.sub = function(vec) {
    this.x -= vec.x;
    this.y -= vec.y;
};

/**
 *
 * @param {Number} s
 */
NodeGraph.Vector2D.prototype.mul = function(s) {
    this.x *= s;
    this.y *= s;
};

/**
 * @param {Number} s
 */
NodeGraph.Vector2D.prototype.div = function(s) {
    this._s1 = 1.0 / s;
    this.x *= this._s1;
    this.y *= this._s1;
};

/**
 *
 */
NodeGraph.Vector2D.prototype.mag = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 *
 */
NodeGraph.Vector2D.prototype.sqMag = function() {
    return this.x * this.x + this.y * this.y;
};

/**
 *
 */
NodeGraph.Vector2D.prototype.dist = function(vec) {
    Vector2D._v1.set(this);
    Vector2D._v1.sub(vec);
    return Vector2D._v1.mag();
};

/**
 *
 */
NodeGraph.Vector2D.prototype.sqDist = function(vec) {
    Vector2D._v1.set(this);
    Vector2D._v1.sub(vec);
    return Vector2D._v1.sqMag();
};

/**
 *
 */
NodeGraph.Vector2D.prototype.dot = function(vec) {
    return (this.x * vec.x) + (this.y * vec.y);
};

/**
 *
 */
NodeGraph.Vector2D.prototype.rotate = function(deg) {
    Vector2D._s1 = NodeGraph.Math.sin(deg);
    Vector2D._s2 = NodeGraph.Math.cos(deg);

    Vector2D._v1.x = x * Vector2D._s2 - y * Vector2D._s1;
    Vector2D._v1.y = y * Vector2D._s2 + x * Vector2D._s1;

    this.set(Vector2D._v1);
};

/**
 *
 */
NodeGraph.Vector2D.prototype.rotate_int = function(deg) {
    Vector2D._s1 = NodeGraph.Math.sin_int(deg);
    Vector2D._s2 = NodeGraph.Math.cos_int(deg);

    Vector2D._v1.x = x * Vector2D._s2 - y * Vector2D._s1;
    Vector2D._v1.y = y * Vector2D._s2 + x * Vector2D._s1;

    this.set(Vector2D._v1);
};

/**
 *
 */
NodeGraph.Vector2D.prototype.normalize = function() {
    Vector2D._s1 = this.mag();
    this.div(Vector2D._s1);
};

