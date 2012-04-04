
NodeGraph.NodeList = {
    SQL: {
        UserTable: {
            properties: {
                name: "user",
                color: "#d49a60"
            },
            ins: {
                'id': {
                    'type': 'Number'
                },
                'username': {
                    'type': 'String'
                }
            },
            outs: {
                'id': {
                    'type': 'Number'
                }
            }
        },
        PostTable: {
            properties: {
                name: "post",
                color: "#d49a60"
            },
            ins: {
                'id': {
                    'type': 'Number'
                },
                'user_id': {
                    'type': 'Number'
                },
                'content': {
                    'type': 'String'
                }
            },
            outs: {
                'blog_id': {
                    'type': 'Number'
                }
            }
        },
        BlogTable: {
            properties: {
                name: "blog",
                color: "#829f72"
            },
            ins: {
                'id': {
                    'type': 'Number'
                },
                'title': {
                    'type': 'String'
                },
                'created': {
                    'type': 'Date'
                },
                'modified': {
                    'type': 'Date'
                }
            }
        }
    },
    Math: {
        Add: {
            properties: {
                name: "Add",
                color: "#d49a60"
            },
            ins: {
                'A': {
                    'type': 'Number'
                },
                'B': {
                    'type': 'Number'
                }
            },
            outs: {
                'out': {
                    'type': 'Number',
                    'value': 1000
                }
            },
            run: function() {
                this.outs.out.value = this.ins.A.value + this.ins.B.value;
                return true;
            }
        },
        Subtract: {
            properties: {
                name: "Subtract",
                color: "#d49a60"
            },
            ins: {
                'A': {
                    'type': 'Number'
                },
                'B': {
                    'type': 'Number'
                }
            },
            outs: {
                'out': {
                    'type': 'Number',
                    'value': 1000
                }
            },
            run: function() {
                this.outs.out.value = this.ins.A.value - this.ins.B.value;
                return true;
            }
        },
        Multiply: {
            properties: {
                name: "Multiply",
                color: "#d49a60"
            },
            ins: {
                'A': {
                    'type': 'Number'
                },
                'B': {
                    'type': 'Number'
                }
            },
            outs: {
                'out': {
                    'type': 'Number',
                    'value': 1000
                }
            },
            run: function() {
                this.outs.out.value = this.ins.A.value * this.ins.B.value;
                return true;
            }
        },
        Divide: {
            properties: {
                name: "Divide",
                color: "#d49a60"
            },
            ins: {
                'A': {
                    'type': 'Number'
                },
                'B': {
                    'type': 'Number'
                }
            },
            outs: {
                'out': {
                    'type': 'Number',
                    'value': 1000
                }
            },
            run: function() {
                this.outs.out.value = this.ins.A.value / this.ins.B.value;
                return true;
            }
        }
    }
};