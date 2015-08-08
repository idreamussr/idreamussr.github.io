var Flipper = {};
Cell = function(params) {
    //this.params = params;
    var i = params.i;
    var j = params.j;
    this.color = params.color;
    this.colorIndex = params.colorIndex;
    
    this.getCoords = function() {
        return {
            i: i, 
            j: j
        };
    }
    this.changeColorTo = function(index) {
        this.colorIndex = index;
        this.color = Flipper.getColor(index);
        $(this.node)
        .css('background-color', this.color)
        .data('colorIndex', this.colorIndex);
    }
    this.getColorIndex = function() {
        return this.colorIndex;
    }
    this.setOnClick = function(callback) {
        $(this.node).click(callback);
        return this;
    }
    // add div
    //var el = $('<div class="cell">'+i+','+j+'</div>');
    var el = $('<div class="cell">&nbsp;</div>');
    el.css('width', Flipper.CELL_WIDTH+'px');
    el.css('height', Flipper.CELL_WIDTH+'px');
    el.css('background-color', this.color);
    el.click(this.onClickCell)
    el.attr('index', i+','+j);
    el.data('index', i+','+j);
    el.data('colorIndex', this.colorIndex);
    this.node = el;      
    
    return this;
}
var a = new Cell({});

Flipper = {
    _canvas:null,
    CELL_WIDTH: 25,// px
    COLORS: ['red', 'green', 'blue', 'yellow', 'brown', 'aqua', 'gray', 'magenta', 'indigo'],
    //COLORS: ['red', 'green', 'blue', 'yellow'],
    M: 0,//rows
    N: 0,//columns
    _map: null,
    _currentPlayer: 1,
    
    getColor: function(index) {
        return this.COLORS[index];
    },
    getCell: function(i, j) {
        return this._map[i][j];  
    },
    getMap: function() {
        return this._map;
    },
    setMap: function(map) {
        this._map = map;
        return this;
    },
    
    init: function(params) {
        this._canvas = params.canvas;
        this.M = params.M;
        this.N = params.N;
        // create area;
        map = [];
        for(var i=0; i < this.M; i++) {
            map[i] = [];
            for(var j=0; j < this.N; j++) {
                var colorIndex = Math.floor(Math.random()*this.COLORS.length);
                var color = this.COLORS[colorIndex];
                map[i][j] = new Cell({
                    i:i,
                    j:j, 
                    'color': color, 
                    'colorIndex':colorIndex
                });
                map[i][j].setOnClick(this.onClickCell);
            }
        }
        
        this.setMap(map);
        this.setPlayers();
    },
    switchPlayer: function() {
        this._currentPlayer = !this._currentPlayer;
    },
    getCurrentPlayer: function() {
        return this._currentPlayer;
    },
    clearColorFlags: function() {
        var map = Flipper.getMap();
        for(var i=0; i < this.M; i++) {
            for(var j=0; j < this.N; j++) {
                $(map[i][j].node).data('my', false);
            }
        }
    },
    onClickCell: function() {
        var colorIndex = $(this).data('colorIndex');
//        var player1Cell = Flipper.getCell(0, 0);
//        var player2Cell = Flipper.getCell(Flipper.M-1, Flipper.N-1);
        var player1Cell = Flipper.getCell(Flipper.M-1, Flipper.N-1);        
        var player2Cell = Flipper.getCell(0, 0);
        if(Flipper.getCurrentPlayer()) {
            cell = player1Cell;
            opponent = player2Cell;
        } 
        
//        if(colorIndex == cell.getColorIndex() || colorIndex == opponent.getColorIndex()) {
//            return;
//        }

        Flipper.updateSelfArea(cell, colorIndex, cell.getColorIndex());
        Flipper.clearColorFlags();
        Flipper.markMyPoints(cell);
        // walk for opponent
//            cell = player2Cell;
//            opponent = player1Cell;

//        do {
//            selectRightColor = true;
//            var colorIndex = Math.floor(Math.random()*Flipper.COLORS.length);
//            if(colorIndex == cell.getColorIndex() || colorIndex == opponent.getColorIndex()) {
//                selectRightColor = false;
//            } else {
//                Flipper.updateSelfArea(cell.getCoords(), colorIndex, cell.getColorIndex());
//            }
//        } while(!selectRightColor);
        
        Flipper.render();
    },
//    onClickCell: function() {
//        var colorIndex = $(this).data('colorIndex');
//        var player1Cell = Flipper.getCell(0, 0);
//        var player2Cell = Flipper.getCell(Flipper.M-1, Flipper.N-1);
//        if(Flipper.getCurrentPlayer()) {
//            cell = player1Cell;
//            opponent = player2Cell;
//        } else {
//            cell = player2Cell;
//            opponent = player1Cell;
//        }
//        if(colorIndex == cell.getColorIndex()) {
//            return;
//        }
//        if(colorIndex == opponent.getColorIndex()) {
//            return;
//        }
//
//        Flipper.updateSelfArea(cell.getCoords(), colorIndex, cell.getColorIndex());
//        Flipper.switchPlayer();
//        Flipper.render();
//    },
    render: function() {
        $(this._canvas).css('width', (this.N*(this.CELL_WIDTH+2))+'px');
        var map = this._map;
        for(var i=0; i < this.M; i++) {
            for(var j=0; j < this.N; j++) {
                el = map[i][j];
                $(this._canvas).append(el.node);
            }
        }
    },
    correctUniqueNodeColor: function(cell, opponentColorIndex) {
        
        var roundList = Flipper.ROUND_INDEX;
        var point = cell.getCoords();
        var max = 500, c=0;
        var map = this.getMap();
        var uniqueColor = true;
        do {
            uniqueColor = true;
            for (var x=0; x < roundList.length; x++) {
                var el = roundList[x];
                ci = point.i+el.i;
                cj = point.j+el.j;
                if(undefined == map[ci]) continue;
                if(undefined == map[ci][cj]) continue;
                var check = map[ci][cj];                

                if(cell.colorIndex == check.getColorIndex()) {
                    uniqueColor = false;
                }
            }
            if(cell.colorIndex == opponentColorIndex) {
                uniqueColor = false;
            }
            if(uniqueColor) break;
            
            // generate new color
            var colorIndex = Math.floor(Math.random()*this.COLORS.length);
            var color = this.COLORS[colorIndex];
            cell.changeColorTo(colorIndex);
            if(++c>max) break;
        } while(!uniqueColor);
    },
    setPlayers: function() {
        this.correctUniqueNodeColor(this.getCell(0, 0));
        this.correctUniqueNodeColor(this.getCell(this.M-1, this.N-1), this.getCell(0, 0).getColorIndex());
    },
    updateSelfArea: function(cell, newColorIndex, oldIndex) {
        if(newColorIndex == oldIndex) return;
        console.debug(cell, newColorIndex, oldIndex);
        var map = Flipper.getMap();
        var roundList = Flipper.ROUND_INDEX;
        var point = cell.getCoords();
        for (var x = 0; x < roundList.length; x++) {
            var el = roundList[x];
            ci = point.i+el.i;
            cj = point.j+el.j;
            if(undefined == map[ci]) continue;
            if(undefined == map[ci][cj]) continue;
            var check = map[ci][cj];
            if(oldIndex == check.getColorIndex()) {
                check.changeColorTo(newColorIndex);
                Flipper.updateSelfArea({
                    i:ci,
                    j:cj
                }, newColorIndex, oldIndex);
            }
        }
        cell.changeColorTo(newColorIndex);
    },
    markMyPoints: function(cell) {
        console.debug(cell);
        var map = Flipper.getMap();
        var roundList = Flipper.ROUND_INDEX;
        var myColorIndex = cell.getColorIndex();
        var coords = cell.getCoords();
        for (var x = 0; x < roundList.length; x++) {
            var el = roundList[x];
            ci = coords.i+el.i;
            cj = coords.j+el.j;
            if(undefined == map[ci]) continue;
            if(undefined == map[ci][cj]) continue;
            var check = map[ci][cj];
            console.debug(myColorIndex, check.getColorIndex())
            if(myColorIndex == check.getColorIndex() && !$(cell.node).data('my')) {
                console.debug('is my:', $(cell.node).data('my'));
                $(check.node).html('1');
                $(cell.node).data('my', true);
                Flipper.markMyPoints(check);
                
            }
        }
        $(cell.node).html('1');
        $(cell.node).data('my', true);
    }
    
};

Flipper.ROUND_INDEX = [ {
    i:-1, 
    j:0
},

{
    i:0, 
    j:-1
}, {
    i:0, 
    j:+1
},

{
    i:+1, 
    j:0
}
            
];
