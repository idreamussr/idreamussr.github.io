var Flipper = {};
Cell = function(params) {
    var i = params.i;
    var j = params.j;
    this.color = params.color;
    this.colorIndex = params.colorIndex;
    this.status = '';
    this.edge = false;
    
    this.getCoords = function() {
        return {
            i: i, 
            j: j
        };
    },
    this.blink = function() {
        if(this.colorIndex == $(this.node).data('colorIndex')) {
            $(this.node).css('background-color', 'white');
            $(this.node).data('colorIndex', -1); 
        } else {
            $(this.node).css('background-color', this.color);
            $(this.node).data('colorIndex', this.colorIndex);
        }
        
    }
    this.clearStatus = function() {
        this.status  = '';
        return this;
    }
    this.isFree = function(status) {
        return this.status == Cell.STATUS_FREE;
    },
    this.setStatus = function(status) {
        this.status = status;
        return this;
    },
    this.isMy = function() {
        return this.status == Cell.STATUS_MY;
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
    this.setEdge = function(status) {
        this.edgeStatus = status;
    }
    this.getEdge = function() {
        return this.edge;
    }
    this.setOnClick = function(callback) {
        $(this.node).click(callback);
        return this;
    }
    // add div
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
Cell.STATUS_FREE = 'free';
Cell.STATUS_MY = 'my';


var a = new Cell({});

Flipper = {
    _canvas:null,
    _colorsCanvas: null,
    CELL_WIDTH: 20,// px
    COLORS: ['red', 'green', 'blue', 'yellow', 'brown', 'aqua', 'magenta'],
    M: 0,//rows
    N: 0,//columns
    _map: null,
    _colors: null,
    _currentPlayer: 1,
    player1Cell:null,
    player2Cell:null,
    colorStats:[],
    opponent: null,
    
    
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
        this._colorsCanvas = params.colors;
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
        colors = [];
        for(var i=0; i < this.COLORS.length; i++) {
            colors[i] = new Cell({i:i,j:0,'color': this.COLORS[i],'colorIndex':i});
            colors[i].setOnClick(this.onClickCell);
        }
        this._colors = colors;
        this.setMap(map);

//        this.player1Cell = Flipper.getCell(Flipper.M-1, Flipper.N-1);        
//        this.player2Cell = Flipper.getCell(0, 0);
        this.player1Cell = Flipper.getCell(Flipper.M-1, (Flipper.N-1)/2);        
        this.player2Cell = Flipper.getCell(0, (Flipper.N-1)/2);

        this.setPlayers();
        this.emptyColorStats();
        
    },
    emptyColorStats: function() {
        for(var i=0; i < this.COLORS.length; i++)
            this.colorStats[i] = 0;
    },
    blink: function (cell) {
        var intValue = setInterval(function() {
            cell.blink();
        }, 200);
    },
    run: function() {
        this.render();
        // blink dot
        this.blink(this.player1Cell);
//        this.player2Cell.blink();
//        this.blink(this.player2Cell);        
    },
    switchPlayer: function() {
        this._currentPlayer = !this._currentPlayer;
    },
    getCurrentPlayer: function() {
        return this._currentPlayer;
    },
    clearColorFlags: function() {
        this.emptyColorStats();
        var map = Flipper.getMap();
        for(var i=0; i < this.M; i++) {
            for(var j=0; j < this.N; j++) {
                map[i][j].clearStatus();
                //$(map[i][j].node).html('');                
            }
        }
    },
    fillRestArea: function(myColorIndex) {
        var map = Flipper.getMap();
        for(var i=0; i < this.M; i++) {
            for(var j=0; j < this.N; j++) {
                if(!map[i][j].isFree()) {
                    map[i][j].changeColorTo(myColorIndex);
                    map[i][j].setStatus(Cell.STATUS_MY);
                    //$(map[i][j].node).html('1');
                }
                //$(map[i][j].node).html('');
            }
        }
    },
    drawOutline: function(cell) {
        var map = Flipper.getMap();
        var roundList = Flipper.ROUND_INDEX;
        var coords = cell.getCoords();
        //$(cell.node).html('0');
        cell.setStatus(Cell.STATUS_FREE);
        for (var x = 0; x < roundList.length; x++) {
            var el = roundList[x];
            ci = coords.i+el.i;
            cj = coords.j+el.j;
            if(undefined == map[ci]) continue;
            if(undefined == map[ci][cj]) continue;
            var check = map[ci][cj];
            if(!check.isMy() && !check.isFree()) {
                check.setStatus(Cell.STATUS_FREE);
                Flipper.drawOutline(check);
            }
        }
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
        cell.setStatus(Cell.STATUS_MY);
        var isEdge = false;
        for (var x = 0; x < roundList.length; x++) {
            
            var el = roundList[x];
            ci = coords.i+el.i;
            cj = coords.j+el.j;

            if(undefined == map[ci]) continue;
            if(undefined == map[ci][cj]) continue;
            var check = map[ci][cj];
            if(myColorIndex == check.getColorIndex() && !check.isMy()) {
//                check.setStatus(Cell.STATUS_MY);
//                $(check.node).html('1');                
                Flipper.markMyPoints(check);
            }
            if(myColorIndex != check.getColorIndex()) {
                if(check.getColorIndex() != this.opponent.getColorIndex()) {
                    this.colorStats[check.getColorIndex()]++;
                }
                isEdge = true;
            }
        }
       
    },
    isWinStep: function(cell) {
        var areaSize = Flipper.M*Flipper.N;
        var myArea = 0;
        var map = Flipper.getMap();
        for(var i=0; i < this.M; i++) {
            for(var j=0; j < this.N; j++) {
                if(map[i][j].isMy()) {
                    myArea++;
                }
            }
        }        
        return myArea>areaSize/2;
    },
    setOpponent: function(cell) {
        this.opponent = cell
    },
    onClickCell: function() { 
        var colorIndex = $(this).data('colorIndex');
        var player1Cell = Flipper.player1Cell;        
        var player2Cell = Flipper.player2Cell;
        if(Flipper.getCurrentPlayer()) {
            cell = player1Cell;
            opponent = player2Cell;
            Flipper.setOpponent(Flipper.player2Cell);            
        } 
        if(colorIndex == cell.getColorIndex() || colorIndex == opponent.getColorIndex()) {
            return;
        }
       
        Flipper.updateSelfArea(cell, colorIndex, cell.getColorIndex());
        Flipper.clearColorFlags();
        Flipper.markMyPoints(cell);
        // paint all area from opposite point
        Flipper.drawOutline(opponent);
        Flipper.fillRestArea(cell.getColorIndex());
        if(Flipper.isWinStep()) {
            alert('Player1 win');
            return;
        }
        Flipper.clearColorFlags();        
        Flipper.aiStep();

        Flipper.render();
    },    
    aiStep: function() {
        // walk for opponent
        cell = this.player2Cell;
        opponent = this.player1Cell;
        Flipper.setOpponent(Flipper.player1Cell);            
        var fromStats = true;
        do {
            Flipper.markMyPoints(cell);
            Flipper.colorStats.indexOf(Math.max.apply(window, Flipper.colorStats));
            selectRightColor = true;
            var colorIndex = Math.floor(Math.random()*Flipper.COLORS.length);
            if(fromStats) {
                colorIndex = Flipper.colorStats.indexOf(Math.max.apply(window, Flipper.colorStats));
            }
            
            if(colorIndex == cell.getColorIndex() || colorIndex == opponent.getColorIndex()) {
                fromStats = false;
                selectRightColor = false;
            } else {
                Flipper.updateSelfArea(cell, colorIndex, cell.getColorIndex());
                Flipper.clearColorFlags();
                Flipper.markMyPoints(cell);
                // paint all area from opposite point
                Flipper.drawOutline(opponent);
                Flipper.fillRestArea(cell.getColorIndex());
                if(Flipper.isWinStep()) {
                    alert('Player2 win');
                }
                
                Flipper.clearColorFlags();   
            }
        } while(!selectRightColor);        
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
        
        this.rendersColors();
    },
    rendersColors: function() {
//        $(this._colorsCanvas).css('width', (this._colors.length*(this.CELL_WIDTH+20))+'px');
        for(var i=0; i < this._colors.length; i++) {
            if(i != this.player1Cell.getColorIndex() && i != this.player2Cell.getColorIndex()) {
                $(this._colors[i].node).css('border', '10px solid ' + this._colors[i].color);
            } else {
                $(this._colors[i].node).css('border', '1px solid black');                
            }
            $(this._colorsCanvas).append(this._colors[i].node);
            
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
        
        this.correctUniqueNodeColor(this.player1Cell);
        this.correctUniqueNodeColor(this.player2Cell, this.player1Cell.getColorIndex());
    }
    
};

Flipper.ROUND_INDEX = [ {
    i:-1, 
    j:0
}, {
    i:0, 
    j:-1
}, {
    i:0, 
    j:+1
    }, {
    i:+1, 
    j:0
}];
