/*
---
description: NodeGraph class.

license: MIT-style

authors:
- Brett Dixon

requires:
- core/1.3.1: *
- more/1.3.2: Color
- easel.js

provides: [NodeGraph]

...
*/


var NodeGraph = {};

NodeGraph.NodeGraph = new Class({
    Implements: [Options, Events],
    options: {
        width: 800,
        height: 800,
        onLoad: function(){},
        onSave: function(){}
    },
    initialize: function(el, options) {
        this.setOptions(options);
        var element = (typeof el === 'undefined') ? $(document.body) : $(el);
        this.canvas = new Element('canvas', {width: this.options.width, height: this.options.height}).inject(element);

        this.isMouseDown = false;
        this.nodes = [];
        this.origin = {x:0, y:0};
        this.hitOrigin = {x:0, y:0};
        this.update = true;
        this.selection = new NodeGraph.Selection();
        this.currentNode = null;
        this.currentDock = null;

        this.container = new Container();
        
        this.stage = new Stage(this.canvas);

        // enabled mouse over / out events
        this.stage.enableMouseOver(20);
        this.bg = new Shape();
        this.stage.addChild(this.bg);
        var bgImg = new Image();
        var self = this;
        bgImg.onload = function() {
            //self.bg.graphics.beginBitmapFill(this).rect(0, 0, self.options.width, self.options.height).endFill();
            self.bg.graphics.beginFill('#ccc').rect(0, 0, self.options.width, self.options.height).endFill();
        };
        bgImg.src = '/static/i/grid.png';

        this.stage.addChild(this.container);

        Ticker.setInterval(20);
        Ticker.addListener(window);
    },
    drawWires: function() {
        this.nodes.each(function(node) {
            node.drawWires();
        }, this);
    },
    getNodeById: function(id) {
        for (var i=0;i<this.nodes.length;i++) {
            var node = this.nodes[i];
            if (node.properties.id === id) {
                return node;
            }
        }

        return false;
    },
    getNodeFromType: function(type) {
        var key = NodeGraph.NodeList;
        type.split('.').each(function(item) {
            key = key[item];
        });

        return key;
    },
    addNode: function(n, options) {
        options = options || {};
        options.id = options.id || this.nodes.length + 1;
        var node = new NodeGraph.Node(this, this.getNodeFromType(n), options);
        this.nodes.push(node);
        node.build();

        this.update = true;

        return node;
    },
    removeNode: function(node) {
        this.container.removeChild(node.container);
        node.container.visible = false;
        this.drawWires();
        this.update = true;
    },
    result: function() {
        var msg = {
            isError: false,
            isSuccess: false,
            value: null,
            values: [],
            message: ""
        };
        this.nodes.each(function(node) {
            var res = node._run();
            msg.isError = !res;
            msg.isSuccess = res;
            if (Object.getLength(node.outs) === 0) {
                msg.values.push(node);
            }
        });
        if (msg.values.length) {
            msg.value = msg.values[0];
        }

        return msg;
    },
    save: function() {
        var obj = [];
        this.nodes.each(function(item) {
            obj.push(item.toJSON());
        });
        
        this.fireEvent('onSave', [obj]);

        return JSON.stringify(obj, null, 4);
    },
    load: function(url) {
        var r = new Request.JSON({
            url: url,
            noCache: true,
            onComplete: function(nodes) {
                nodes.each(function(node) {
                    if (node.type) {
                        var nodeType = this.getNodeFromType(node.type);
                        var nodeProps = Object.append(nodeType.properties, node.properties);
                        
                        node = Object.append(nodeType, node);
                        node.properties = nodeProps;
                    }
                    var n = new NodeGraph.Node(this, node);
                    this.nodes.push(n);
                }, this);
                this.nodes.each(function(node) {
                    node.build();
                }, this);
                this.nodes.each(function(node) {
                    node.post();
                }, this);
                this.nodes.each(function(node) {
                    node.drawWires();
                }, this);
                this.stage.update();
                this.fireEvent('onLoad');
            }.bind(this)
        });
        r.GET();
    }
});

NodeGraph.Node = new Class({
    Implements: Options,
    options: {
        id: -1,
        x: 0,
        y: 0,
        mutable: false
    },
    initialize: function(nodeGraph, node, options) {
        this.setOptions(options);
        this.nodeGraph = nodeGraph;
        
        this.node = node;
        this.properties = Object.merge(this.options, node.properties);
        this.ins = Object.clone(node.ins);
        this.outs = Object.clone(node.outs);

        this.selected = false;
        if (this.options.mutable) {
            this.muted = false;
        }
    },
    build: function() {
        if (this.container) {
            return;
        }
        this.container = new Container();
        this.nodeGraph.container.addChild(this.container);
        var r = new Shape();
        this.container.addChild(r);

        var i;
        var width = 150;
        var padding = 28;
        var ctx = this.nodeGraph.stage.canvas.getContext("2d")
        var rowOptions = {
            iconOffset: 19,
            height: 18,
            padding: 12,
            fontSize: 11,
            dockRadius: 4
        }
        var height = rowOptions.height * (Object.getLength(Object.filter(this.ins, function(o) {return o.hidden !== true})) + (Object.getLength(Object.filter(this.outs, function(o) {return o.hidden !== true}))) + 1) + rowOptions.padding;
        var tail = rowOptions.iconOffset + rowOptions.padding + padding;

        var nameWidth = ctx.measureText(this.properties.name).width + tail;
        width = Math.max(nameWidth, width);

        Object.each(this.node.ins, function(val, key) {
            nameWidth = ctx.measureText(key).width + tail;
            width = Math.max(nameWidth, width);
        });
        Object.each(this.node.outs, function(val, key) {
            nameWidth = ctx.measureText(key).width + tail;
            width = Math.max(nameWidth, width);
        });

        this.properties.width = width;
        this.properties.height = height;

        this.container.x = this.properties.x;
        this.container.y = this.properties.y;

        r.graphics.beginFill(this.properties.color).drawRoundRect(0, 0, this.properties.width, this.properties.height + 10, 8);
        this.drawBorder();

        this.label = new Text(this.properties.name, "12px Verdana bold", "#000");
        this.label.x = r.x + 4;
        this.label.y = r.y + 14;
        this.label.maxWidth = this.properties.width - 8;
        this.container.addChild(this.label);

        i = 0;
        // Ins
        Object.each(this.ins, function(item, key) {
            this.ins[key] = new NodeGraph.Import(this, i, key, item, rowOptions);
            var row = this.ins[key].build();
            this.container.addChild(row);

            i += 1;
        }, this);
        // Outs
        Object.each(this.outs, function(item, key) {
            this.outs[key] = new NodeGraph.Export(this, i, key, item, rowOptions);
            var row = this.outs[key].build();
            this.container.addChild(row);

            i += 1;
        }, this);
        var self = this;

        (function(target) {
            r.onPress = function(evt) {
                self.nodeGraph.stage.addChild(target);
                var offset = {x:target.x-evt.stageX, y:target.y-evt.stageY};
                evt.onMouseMove = function(ev) {
                    target.x = ev.stageX+offset.x;
                    target.y = ev.stageY+offset.y;
                    self.properties.x = evt.stageX;
                    self.properties.y = evt.stageY;
                    self.nodeGraph.nodes.each(function(node) {
                        node.drawWires();
                    });
                    self.nodeGraph.update = true;
                }
                self.nodeGraph.selection.add(self);
            }
            r.onMouseOver = function(e) {
                currentNode = self;
            };
            r.onMouseOut = function(e) {
                currentNode = undefined;
            };
        })(this.container);
    },
    post: function() {
        Object.each(this.outs, function(item, key) {
            item.getTarget();
        }, this);
    },
    drawBorder: function(color) {
        color = color || '#000';
        var g = this.container.children[0];
        g.graphics.setStrokeStyle(1).beginStroke(color).drawRoundRect(0.5,0.5,this.properties.width, this.properties.height + 10, 8);
    },
    drawLabel: function(color) {

    },
    drawWires: function(pt) {
        Object.each(this.outs, function(item, key) {
            item.drawWire(pt);
        }, this);
    },
    setLabel: function(text) {
        var tail = this.properties.width - this.label.getMeasuredWidth(this.label.text);
        var newLabel = new Text(text);
        var nameWidth = newLabel.getMeasuredWidth(text) + tail;

        this.label.text = text;
        this.properties.width = Math.max(nameWidth, this.properties.width);
        this.nodeGraph.update = true;
    },
    run: function() {
        // Override this
        // Will wait until all inputs can be satisfied
        // Put all results into this.outs[i].value before returning
        return true;
    },
    setSelected: function(sel) {
        sel = (typeof sel === 'undefined') ? true : sel;
        this.selected = true;
        var color = (sel) ? '#fff' : '#000';
        this.drawBorder(color);
        this.nodeGraph.update = true;
    },
    toJSON: function() {
        var obj = {
            properties: {
                x: this.properties.x,
                y: this.properties.y,
                color: this.properties.color,
                name: this.properties.name,
                id: this.properties.id
            },
            type: this.node.type,
            ins: {},
            outs: {}
        };
        Object.each(this.ins, function(val, key) {
            obj.ins[key] = {
                type: val.type,
                value: val.value
            }
        });
        Object.each(this.outs, function(val, key) {
            obj.outs[key] = {
                type: val.type,
                value: val.value,
                links: val.links
            }
        });

        return obj;
    },
    // Protected methods
    _run: function() {
        Object.each(this.ins, function(item, key) {
            if (item.link) {
                // Wait until satisfied
                var target = item.getTarget();
                target.node._run();
                item.value = target.value;
            }
            if (this.muted === true) {
                this.outs[key].value = item.value;

                return true;
            }
        }, this);
        var func = (this.node.run) ? this.node.run.bind(this) : this.run.bind(this);
        // All ins will either have a value or do not have a link
        return func();
    }
});


NodeGraph.Import = new Class({
    Implements: Options,
    options: {
        iconOffset: 16,
        height: 18,
        padding: 10,
        fontSize: 11,
        dockRadius: 4,
        hidden: false
    },
    initialize: function(node, index, label, obj, options) {
        this.setOptions(options);
        this.node = node;
        this.index = index;
        this.label = label;
        this.type = obj.type;
        this.link = false;
        this.value = obj.value;
        this.hidden = (typeof obj.hidden === 'undefined') ? false : obj.hidden;

        this.dock = null;
        this.element = null;
    },
    build: function() {
        this.element = new Container();
        var rowY = this.index * this.options.iconOffset + (this.options.height * 2) + this.options.padding;
        // Plate
        this.drawPlate(rowY);
        // Row icon
        this.drawIcon(rowY);
        // Row label
        this.drawLabel(rowY);
        // Draw connector dot
        this.drawDock(rowY);

        this.bindings();

        return this.element;
    },
    bindings: function() {
        this.element.onMouseOver = function() {
            var color = new Color(this.node.properties.color).mix('#fff', 30);
            this.plate.graphics.clear();
            this.plate.graphics.beginFill(color.hex).rect(0,0,this.node.properties.width - 1, this.options.height).endFill();
            currentDock = this;
            this.node.nodeGraph.update = true;
        }.bind(this);
        this.element.onMouseOut = function() {
            this.plate.graphics.clear();
            this.plate.graphics.beginFill(this.node.properties.color).rect(0,0,this.node.properties.width - 1, this.options.height).endFill();
            currentDock = undefined;
            this.node.nodeGraph.update = true;
        }.bind(this);
    },
    drawIcon: function(y) {
        var self = this;
        icon = new Image();
        icon.onload = function() {
            var b = new Bitmap(this);
            b.x = self.options.padding;
            b.y = y - self.options.height;
            if (!self.hidden) {
                self.element.addChild(b);
                self.node.nodeGraph.update = true;
            }
        }
        icon.src = (NodeGraph.Types[this.type]) ? NodeGraph.Types[this.type].icon : '';
    },
    drawLabel: function(y) {
        var label = new Text(this.label, this.options.fontSize + 'px Verdana');
        label.x = this.options.iconOffset + 2 + 2 + this.options.padding;
        label.y = y - (this.options.fontSize / 2);
        label.maxWidth = this.node.properties.width - 8 - this.options.iconOffset;
        if (!this.hidden) {
            this.element.addChild(label);
        }
    },
    drawPlate: function(y) {
        this.plate = new Shape();
        this.plate.x = 1;
        this.plate.y = y - this.options.height;
        this.plate.graphics.beginFill(this.node.properties.color).rect(0,0,this.node.properties.width - 1, this.options.height).endFill();
        if (!this.hidden) {
            this.element.addChild(this.plate);
        }
    },
    drawDock: function(y) {
        this.dock = new Shape();
        this.dock.x = this.options.dockRadius * 1.5;
        this.dock.y = y - (this.options.height / 2) - 2;
        this.dock.graphics.beginFill('#000').drawCircle(0,0, this.options.dockRadius);
        if (!this.hidden) {
            this.element.addChild(this.dock);
        }
    },
    typeCheck: function(i, o) {
        if (!i || !o) return false;
        if (i.type !== o.type) return false;
        if (!Object.contains(i.node.ins, i)) return false;
        if (i.link) return false;
        return true;
    },
    getTarget: function() {
        var sig = this.node.properties.id + '.' + this.label;
        var found;
        for (var i=0;i<this.node.nodeGraph.nodes.length;i++) {
            var node = this.node.nodeGraph.nodes[i];
            if (!found) {
                Object.each(node.outs, function(o) {
                    if (o.links.contains(sig)) {
                        found = o;
                    }
                })
            }
        }
        
        return found;
    }
});


NodeGraph.Export = new Class({
    Extends: NodeGraph.Import,
    initialize: function(node, index, label, obj, options) {
        this.parent(node, index, label, obj, options);
        this.noodles = [];
        this.tempNoodle = new Shape();
        this.targets = [];
        this.links = obj.links || [];
    },
    bindings: function() {
        this.parent();
        this.element.onPress = function(evt) {
            evt.onMouseMove = function(e) {
                this.move(evt, e);
            }.bind(this);
        }.bind(this);
    },
    getTarget: function() {
        this.links.each(function(link) {
            var parts = link.split('.');
            var targetNode = this.node.nodeGraph.getNodeById(parts[0].toInt());
            this.addTarget(targetNode.ins[parts[1]])
        }, this)
    },
    addTarget: function(target) {
        if (!this.targets.contains(target)) {
            this.targets.push(target);
            this.links.push(target.node.properties.id +'.' + target.label);
            var noodle = new Shape();
            noodle.onMouseOver = function() {
                this.highlight = true;
            };
            noodle.onMouseOut = function() {
                this.highlight = false;
            };
            noodle.onPress = function(evt) {
                this.removeTarget(target);
                evt.onMouseMove = function(e) {
                    this.move(evt, e);
                }.bind(this);
            }.bind(this);
            this.noodles.push(noodle);
            target.link = true;
        }
    },
    removeTarget: function(target) {
        var idx = this.targets.indexOf(target);
        if (idx >= 0) {
            this.targets.erase(target);
            this.links.splice(idx, 1);
            this.noodles.splice(idx, 1)[0].graphics.clear();
            target.link = false;
        }
    },
    move: function(parentEvent, e) {
        var pt = {}, color;
        var hitPad = 20;
        pt.x = e.stageX;
        pt.y = e.stageY;
        var hitbox = {
            x: e.stageX - hitPad,
            y: e.stageY - hitPad,
            w: hitPad * 2,
            h: hitPad * 2
        }
        if (currentDock) {
            parentEvent.onMouseUp = function() {
                if (this.typeCheck(currentDock, this)) {
                    this.addTarget(currentDock);
                }
                this.tempNoodle.graphics.clear();
                this.node.nodeGraph.update = true;
                this.drawWire();
            }.bind(this);
            var ptx = {x: currentDock.element._matrix.tx, y: currentDock.element._matrix.ty};
            if (ptx, hitbox.x, hitbox.y, hitbox.w, hitbox.h) {
                if (this.typeCheck(currentDock, this)) {
                    color = '#0f0';
                    pt.y = currentDock.dock.localToGlobal(0,0).y;
                }
                else {
                    color = '#f00';
                }
                if (currentDock.node !== this.node) {
                    pt.x = currentDock.node.container.localToGlobal(0,0).x;
                }
            }
        }
        else {
            parentEvent.onMouseUp = function() {
                
                this.tempNoodle.graphics.clear();
                this.node.nodeGraph.update = true;
            }.bind(this);
        }
        if (currentNode && currentNode !== this.node) {
            pt.x = currentNode.nodeGraph.stage.localToGlobal(currentNode.properties.x, currentNode.properties.y).x;
        }

        this.node.nodeGraph.update = true;
        this.drawWire(pt, color);
    },
    drawIcon: function(y) {
        var self = this;
        var icon = new Image();
        icon.onload = function() {
            var b = new Bitmap(this);
            b.x = self.node.properties.width - self.options.iconOffset +  - self.options.dockRadius - 4;
            b.y = y - self.options.height;
            if (!self.hidden) {
                self.element.addChild(b);
                self.node.nodeGraph.update = true;
            }
        }
        icon.src = NodeGraph.Types[this.type].icon;
    },
    drawLabel: function(y) {
        var label = new Text(this.label, this.options.fontSize + 'px Verdana');
        label.x = this.node.properties.width - this.options.iconOffset +  - this.options.dockRadius - 4 - label.getMeasuredWidth() - this.options.padding;
        label.y = y - (this.options.fontSize / 2);
        label.maxWidth = this.node.properties.width - 8 - this.options.iconOffset;
        if (!this.hidden) {
            this.element.addChild(label);
        }
    },
    drawDock: function(y, color) {
        color = color || '#000';
        if (!this.dock) {
            this.dock = new Shape();
        }
        y = (y) ? y - (this.options.height / 2) - (this.options.dockRadius / 2) : this.dock.y
        this.dock.x = this.node.properties.width - this.options.dockRadius - 1,
        this.dock.y = y;
        this.dock.graphics.beginFill(color).drawCircle(0,0, this.options.dockRadius);
        if (!this.hidden) {
            this.element.addChild(this.dock);
        }
    },
    drawWire: function(pt, color) {
        color = color || '#000';
        var pt0 = this.element.localToGlobal(this.dock.x, this.dock.y);
        if (pt) {
            pt1 = pt;
            if (pt.mouseEvent) {
                pt.x = pt.stageX;
                pt.y = pt.stageY;
            }
            this.node.nodeGraph.stage.addChild(this.tempNoodle);
            this.tempNoodle.graphics.clear();
            this._curve(pt0, pt1, this.tempNoodle, color);
            this.tempNoodle.graphics.endStroke().beginFill(color).drawPolyStar(pt1.x, pt1.y, 5, 3).endFill();
        }
        else {
            this.targets.each(function(target, idx) {
                var noodle = this.noodles[idx];
                if (!target.node.container.visible) {
                    noodle.graphics.clear();
                }
                else {
                    var pt1 = target.dock.localToGlobal(target.element.x, target.element.y);
                    color = (noodle.highlight) ? '#fff' : color;

                    noodle.graphics.clear();
                    this.node.nodeGraph.stage.addChild(noodle);
                    this._curve(pt0, pt1, noodle, color);
                }
                this.node.nodeGraph.update = true;
            }, this);
        }
    },
    _curve: function(pt0, pt1, noodle, color) {
        var midPoint = {
            x: pt0.x + ((pt1.x - pt0.x) / 2)|0,
            y: pt0.y + ((pt1.y - pt0.y) / 2)|0
        }
        var points = [midPoint.x, pt0.y, midPoint.x, pt1.y, pt1.x, pt1.y];
        if (noodle) {
            noodle.graphics.setStrokeStyle(2).beginStroke(color).moveTo(pt0.x, pt0.y).bezierCurveTo(
                points[0],
                points[1],
                points[2],
                points[3],
                points[4],
                points[5]
            ).endStroke();
        }

        return points;
    }
});


NodeGraph.Selection = new Class({
    initialize: function() {
        this.selected = null;
    },
    clear: function() {
        // Reset selection
        if (this.selected) {
            this.selected.setSelected(false);
            this.selected = null;
        }
    },
    add: function(node) {
        // Add node to selection
        if (this.selected === node) {
            this.clear();
        }
        else {
            this.clear();
            this.selected = node;
            node.setSelected();
        }
    }
});