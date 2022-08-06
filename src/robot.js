/**
 * Notes:
 * @todo add code validation. no code validation done for (some) input and robot status. depends on form object 'disabled' attribute
 * @todo perhaps refactor this to be reusable plugin? for multi-instance, etc
 * @todo no accessibility 
 * @todo no unit testing
 * @todo not tested on mobile, other browsers (only Chrome)
 */
$(function() {
    var currentLocation = {
        x: -1,
        y: -1,
        f: 'x'
    };

    /**
     * initialize
     */
    init(config);

    function init(config) {
        // disable some buttons
        disable();

        // create board and dropdown options
        var td = '',
        placeXOptions = '';
        for(i = 0; i < config.maxX; i++) {
            td += '<td class="cell"></td>';

            $(config.form.placeX).append($('<option>', {
                value: i,
                text: i
            }));
        }

        for(i = config.maxY - 1; i >= 0; i--) {
            $('<tr>').html(td).appendTo(config.selectors.tableId);

            $(config.form.placeY).append($('<option>', {
                value: i,
                text: i
            }));
        }

        // set placeY to 0
        $(config.form.placeY).val(0);

        // populate direction dropdown
        $.each(config.directions, function (i, item) {
            $(config.form.placeF).append($('<option>', { 
                value: item,
                text : item
            }));
        });        
    }

    /**
     * place the robot 
     * @param x - x coordinate
     * @param y - y coordinate
     * @param f - face/direction (north...)
     */
    function goPlace(x, y, f) {
        // check if f is a valid input
        if (config.debug) console.log('goPlace', x, y, f, config.maxX, config.maxY);
        // shortcuts
        if (f === 'n') f = 'north';
        if (f === 'e') f = 'east';
        if (f === 's') f = 'south';
        if (f === 'w') f = 'west';
        if (config.directions.indexOf(f) < 0) {
            goReport('Invalid face/position.');
            return;
        }

        clearBoard();
        var image = getImage(config.images[f]);
        if (config.debug) console.log(image);
        x = parseInt(x);
        y = parseInt(y);
        $(config.selectors.tableId + ' > tr').eq(config.maxY - (y + 1)).find('td').eq(x).html(image);
        $(config.selectors.tableId + ' > tr').eq(config.maxY - (y + 1)).find('td').eq(x).addClass('selected');
        currentLocation.x = x;
        currentLocation.y = y;
        currentLocation.f = f;
        $(config.form.placeX).val(x);
        $(config.form.placeY).val(y);
        $(config.form.placeF).val(f);

        goReport();

        // enable some buttons
        enable();
    }

    /**
     * clear board (remove robot and set data)
     */
    function clearBoard() {
        var tbl = $(config.selectors.tableId + ' > tr');
        $(tbl).each(function(i, value) {
            $(value).find('td').empty();
            $(value).find('td').removeClass('selected');
        });
        currentLocation.x = -1;
        currentLocation.y = -1;
        currentLocation.f = 'x';

        // disable some buttons
        disable();
    };

    /**
     * report position and face/direction
     */
    function goReport(msg) {
        var message = '';
        if (msg) message = msg;
        else message = currentLocation.x + ', ' + currentLocation.y + ', ' + currentLocation.f;
        $(config.selectors.messageId).html(message);
    }

    /**
     * disable some bottons
     */
    function disable() {
        $(config.selectors.disableClass).attr('disabled', 'disabled');
    }

    /**
     * enable some bottons
     */
    function enable() {
        $(config.selectors.disableClass).removeAttr('disabled');
    }

    /**
     * generate
     */
    function getImage (img) {
        return '<img class="img" src="' + img + '"></img>';
    }

    /**
     * rotate image counter clockwise, and set new face/direction
     */
    function goRotateL() {
        if (config.debug) console.log('goRotateL', currentLocation.x, currentLocation.y, currentLocation.f);
        if (currentLocation.x === -1) {
            goReport('Place Rockman on the board first before issuing this command.');
            return;
        }
        var index = config.directions.indexOf(currentLocation.f); 
        if (index === 0) index = config.directions.length - 1;
        else index--;
        $(config.selectors.tableId + ' > tr > td.selected').html(getImage(config.images[config.directions[index]]));
        currentLocation.f = config.directions[index];
        goReport();
    }

    /**
     * rotate image counter clockwise, and set new face/direction
     */
     function goRotateR() {
        if (config.debug) console.log('goRotateR', currentLocation.x, currentLocation.y, currentLocation.f);
        if (currentLocation.x === -1) {
            goReport('Place Rockman on the board first before issuing this command.');
            return;
        }
        var index = config.directions.indexOf(currentLocation.f); 
        if (index === config.directions.length - 1) index = 0;
        else index++;
        $(config.selectors.tableId + ' > tr > td.selected').html(getImage(config.images[config.directions[index]]));
        currentLocation.f = config.directions[index];
        goReport();
    }

    /**
     * move robot to the next cell on the board, if possible
     * if not, display error
     */
    function goMove() {
        if (config.debug) console.log('goMove', currentLocation.x, currentLocation.y, currentLocation.f);
        if (currentLocation.x === -1) {
            goReport('Place Rockman on the board first before issuing this command.');
            return;
        }
        switch (currentLocation.f) {
            case 'north':
                if (currentLocation.y < config.maxY - 1) {
                    goPlace(currentLocation.x, currentLocation.y + 1, currentLocation.f);
                }
                else {
                    // reached top, can not move further
                    goReport('You\'re at the top. You can\'t go much higher!');
                }
                break;
            case 'east':
                if (currentLocation.x < config.maxX - 1) {
                    goPlace(currentLocation.x + 1, currentLocation.y, currentLocation.f);
                }
                else {
                    // reached top, can not move further
                    goReport('You\'ve reach the east. Time to go home.');
                }
                break;
            case 'south':
                if (currentLocation.y > 0) {
                    goPlace(currentLocation.x, currentLocation.y - 1, currentLocation.f);
                }
                else {
                    // reached bottm, can not move further
                    goReport('You\'re at the bottom. Nothing more to see here.');
                }
                break;
            
            case 'west':
                if (currentLocation.x > 0) {
                    goPlace(currentLocation.x - 1, currentLocation.y, currentLocation.f);
                }
                else {
                    // reached top, can not move further
                    goReport('You\'ve reach the west. Time to sail back.');
                }
                break;
            default:
                // invalid location
                goReport('Something went wrong. Try again later.');
        }
    }

    // execute typed command if valid
    function goCommand(command) {
        command = jQuery.trim(command.toLowerCase());
        var success = 0;
        switch (command) {
            case 'move':
                if (currentLocation.x === -1) break;
                goMove();
                success++;
                break;
            case 'report':
                if (currentLocation.x === -1) break;
                goReport();
                success++;
                break;
            default:
                // place goes here
                if (command.indexOf('place') === 0) {
                    // there should only be 1 space
                    var param = command.substring(command.indexOf(' ') + 1);
                    // split comma-delimited
                    var params = param.split(',');
                    goPlace(parseInt(params[0]), parseInt(params[1]), params[2]);
                    success++;
                }
                break;
        }

        if (config.misc.clearCommandAfterExec && success) $(config.form.goCommand).val('');
        if (success === 0) goReport('Place Rockman on the board first before issuing this command.');
    }
    

    $(config.form.goReport).on('click touchstart', function(e) {
        goReport();
        e.preventDefault();
    });

    $(config.form.goPlace).on('click touchstart', function(e) {
        goPlace($(config.form.placeX).val(), $(config.form.placeY).val(), $(config.form.placeF).val());
        e.preventDefault();
    });

    $(config.form.goRotateL).on('click touchstart', function(e) {
        goRotateL();
        e.preventDefault();
    });

    $(config.form.goRotateR).on('click touchstart', function(e) {
        goRotateR();
        e.preventDefault();
    });

    $(config.form.goMove).on('click touchstart', function(e) {
        goMove();
        e.preventDefault();
    });
    
    $(config.form.goCommand).on('keypress', function(e) {
        if(e.which == 13) {
            goCommand($(config.form.goCommand).val());
            e.preventDefault();
            return false;
        }
    });

    $(document).on('keydown', function(e) {
        switch (e.which) {
            case 37:
                // left arrow
                goRotateL();
                break;
            case 39:
                // right arrow
                goRotateR();
                break;
            case 32:
                // spacebar
                goMove();
                break;
        }
    });
    
});