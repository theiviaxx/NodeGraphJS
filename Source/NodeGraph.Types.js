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

NodeGraph.Types = {
    'String': {
        'icon': '/static/i/String.png'
    },
    'Number': {
        'icon': '/static/i/Number.png'
    },
    'Boolean': {
        'icon': '/static/i/Bool.png'
    },
    'Array': {
        'icon': '/static/i/Array.png'
    },
    'Null': {
        'icon': '/static/i/Null.png'
    },
    'Object': {
        'icon': '/static/i/Object.png'
    },
    'Date': {
        'icon': '/static/i/Date.png',
        serialize: function(val) {
            return val.toISOString();
        }
    }
}