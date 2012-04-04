NodeGraphJS
=========

NodeGraphJS is released under the MIT license. It is simple and easy to understand and places almost no restrictions on what you can do with NodeGraphJS.
[More Information](http://en.wikipedia.org/wiki/MIT_License)

The NodeGraph will display a NodeGraph control using HTML5 canvas.  Node objects can be defined in the NodeGraph.NodeList file or the NodePgraph.NodeList object can be overwritten in some other fashion.  Node Types are defined in NodeGraph.Types.  This is a very early version and has most of the feature, but it needs a good polish pass before 1.0.

![Screenshot](http://www.brettdixon.com/static/i/NodeGraph_ss_01.png)

How to use
----------

Create a new NodeGraph object and optionally tell it which element to insert the graph into.  If omitted, it defaults to document.body.

Next Define Nodes to fit your needs in the NodeGraph.NodeList object.  The format is as follows:

    NodeName: {
        properties: {
            name: "NodeLabel",
            color: "#d49a60"
        },
        ins: {
            'id': {
                'type': 'Number'
            }
        },
        outs: {
            'id': {
                'type': 'Number',
                'value': 1000
            }
        },
        run: function() {
            this.outs.id.value = this.ins.id.value * 2
        }
    }

The properties section describes the node being displayed.  You can also add id, x, and y, however these are probably best set at node creation.

The ins/outs are in incoming and outgoing rows of the node.  They can be given a type and a default value.

The run function is used for evaluating data throug the graph.  An example of this would be a Shader for a 3D engine.

Once you have the nodes defined, call .addNode() on the NodeGraph instance with the node definition as the only argument.  For example:

    var NG = new NodeGraph();
    NG.addNode('NodeName', {x: 100, y: 100});

This should insert a node and allow you to drag it around and add links to other nodes.

Calling .save() on the NodeGraph instance will return a JSON string of the nodes in their current state.

TODO
----
* Add better curve hit testing using maths
* Add Thumbnails to nodes
* Toggle display state to show/hide ins/outs on nodes
* Add a way to expand a nodes outs on demand.  This would prevent some graphs from loading too much at once