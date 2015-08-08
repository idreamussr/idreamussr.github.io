var Flipper = {};
Cell = function(params) {
    this.STATUS_FREE = 'free';
    this.STATUS_MY = 'my';
    //this.params = params;
    var i = params.i;
    var j = params.j;
    this.color = params.color;
    this.colorIndex = params.colorIndex;
    this.status = this.STATUS_FREE;
    
    this.getCoords = function() {
        return {
            i: i, 
            j: j
        };
    },
    this.setStatus = function(status) {
        return this;
    },
    this.setStatus = function(status) {
        return this.status;
    },
    this.isMy = function() {
        return this.status == this.STATUS_MY;
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
    COLORS: ['red', 'green', 'blue', 'yellow', 'brown', 'aqua', 'magenta', 'indigo'],
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
        console.debug('clear');
        var map = Flipper.getMap();
        for(var i=0; i < this.M; i++) {
            for(var j=0; j < this.N; j++) {
                $(map[i][j].node).data('my', false);
                $(map[i][j].node).data('free', false);
                $(map[i][j].node).html('');                
            }
        }
    },
    fillRestArea: function(myColorIndex) {
        var map = Flipper.getMap();
        for(var i=0; i < this.M; i++) {
            for(var j=0; j < this.N; j++) {
                if(!$(map[i][j].node).data('free', true)) {
                    console.debug($(map[i][j].node).data('free', true));
                    map[i][j].node.changeColorTo(myColorIndex);
                }
                //$(map[i][j].node).html('');
            }
        }
    },
    drawOutline: function(cell) {
        var map = Flipper.getMap();
        var roundList = Flipper.ROUND_INDEX;
        var coords = cell.getCoords();
        $(cell.node).html('0');
        $(cell.node).data('free', true);

        for (var x = 0; x < roundList.length; x++) {
            var el = roundList[x];
            ci = coords.i+el.i;
            cj = coords.j+el.j;
            if(undefined == map[ci]) continue;
            if(undefined == map[ci][cj]) continue;
            var check = map[ci][cj];
            if(!$(check.node).data('my') && !$(check.node).data('free')) {
                $(check.node).html('0');
                $(cell.node).data('free', true);
                Flipper.drawOutline(check);
            }
        }
    },
    onClickCell: function() { 
       var colorIndex = $(this).data('colorIndex');
        var player1Cell = Flipper.getCell(Flipper.M-1, Flipper.N-1);        
        var player2Cell = Flipper.getCell(0, 0);
        if(Flipper.getCurrentPlayer()) {
            cell = player1Cell;
            opponent = player2Cell;
        } 
        
        Flipper.updateSelfArea(cell, colorIndex, cell.getColorIndex());
        Flipper.clearColorFlags();
        Flipper.markMyPoints(cell);
        // paint all area from opposite point
        Flipper.drawOutline(opponent);
        Flipper.fillRestArea(cell.getColorIndex());
        Flipper.render();
    },
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
                Flipper.updateSelfArea(check, newColorIndex, oldIndex);
            }
        }
        cell.changeColorTo(newColorIndex);
    },
    markMyPoints: function(cell) {
        var map = Flipper.getMap();
        var roundList = Flipper.ROUND_INDEX;
        var myColorIndex = cell.getColorIndex();
        var coords = cell.getCoords();
        $(cell.node).html('1');
        //$(cell.node).data('my', true);
        cell.setStatus(Cell.STATUS_MY);

        for (var x = 0; x < roundList.length; x++) {
            
            var el = roundList[x];
            ci = coords.i+el.i;
            cj = coords.j+el.j;

            if(undefined == map[ci]) continue;
            if(undefined == map[ci][cj]) continue;
            var check = map[ci][cj];
            //if(myColorIndex == check.getColorIndex() && !$(check.node).data('my')) {
            if(myColorIndex == check.getColorIndex() && !check.isMy()) {                
                
                $(check.node).html('1');
                check.setStatus(Cell.STATUS_MY);
                //$(cell.node).data('my', true);
                Flipper.markMyPoints(check);
            }
        }
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
