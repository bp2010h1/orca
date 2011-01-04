/**
 * A drawing library for the HTML 5 canvas element that follows the Graphics library in the JDK.
 */
(function () {
    ctk = {
        /**
        * Constructs a new Rectangle whose upper-left corner is specified as (x,y) and whose width
        * and height are specified by the arguments of the same name
        * @param {Number} x  the specified X coordinate
        * @param {Number} y  the specified Y coordinate
        * @param {Number} width  the width of the Rectangle
        * @param {Number} height  the height of the Rectangle
        */
        Rectangle: function (x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;

            this.clone = function () {
                return new ctk.Rectangle(this.x, this.y, this.width, this.height);
            };
        },


        /**
        * Construct a new graphics object.
        * @param {HTMLElement} canvas  A reference to the canvas DOM element
        */
        Graphics: function (canvas) {
            var _canvas = (typeof(canvas) === 'string') ? document.getElementById(canvas) : canvas;
            var _context = _canvas.getContext("2d");
            var _origin = new ctk.Rectangle(0, 0);


            /**
            * Get the underlying canvas
            * @returns {HTMLElement}  this object's underlying canvas
            */
            this.getCanvas = function () {
                return _canvas;
            };

            /**
            * Get the graphic's context
            * @returns {Context}  this object's graphic's context
            */
            this.getContext = function () {
                return _context;
            };

            /**
            * Get the width of the canvas
            * @returns {Number}  The width of the canvas
            */
            this.getWidth = function () {
                return _canvas.width;
            };

            /**
            * Get the height of the canvas
            * @returns {Number}  The height of the canvas
            */
            this.getHeight = function () {
                return _canvas.height;
            };

            /**
            * Creates a new Graphics object based on this Graphics object, but with a new translation and clip area
            * @param {Number} x  the x coordinate
            * @param {Number} y  the y coordinate
            * @param {Number} width  the width of the clipping rectangle
            * @param {Number} height  the height of the clipping rectangle
            * @returns {ctk.Graphics}  a new graphics context
            */
            this.create = function (x, y, width, height) {
                var copy = new ctk.Graphics(_canvas);

                if (x !== undefined && x !== null && y !== undefined && y !== null) {
                    copy.translate(x, y);
                }

                return copy;
            }

            /**
            * Sets this graphics context's current color to the specified color.
            * @param {String} color  the new rendering color
            */
            this.setColor = function (color) {
                _context.fillStyle = color;
            };

            /**
            * Gets this graphics context's current color.
            * @returns {String}  this graphics context's current color
            */
            this.getColor = function () {
                return _context.fillStyle;
            };

            /**
            * Sets this graphics context's current stroke color to the specified color.
            * @param {String} color  the new rendering stroke color
            */
            this.setStrokeColor = function (color) {
                _context.strokeStyle = color;
            };

            /**
            * Gets this graphics context's current stroke color.
            * @returns {String}  this graphics context's current stroke color
            */
            this.getStrokeColor = function () {
                return _context.strokeStyle;
            };

            function createOvalPath(x, y, radius) {
                _context.beginPath();
                _context.arc(_origin.x + x + radius, _origin.y + y + radius, radius, 0, Math.PI * 2, true);
                _context.closePath();
            }

            function createPolygonPath(xPoints, yPoints, nPoints) {
                _context.beginPath();

                if ((xPoints !== null) && (yPoints !== null)) {
                    var numberOfPoints = Math.min(nPoints, Math.min(xPoints.length, yPoints.length));

                    if (numberOfPoints > 0) {
                        for (var i = 0; i < nPoints && i < numberOfPoints; i++) {
                            var x = _origin.x + xPoints[i];
                            var y = _origin.y + yPoints[i];

                            if (i === 0) {
                                _context.moveTo(x, y);
                            } else {
                                _context.lineTo(x, y);
                            }
                        }
                    }
                }
            }

            /**
            * Intersects the current clip with the specified rectangle
            * @param {Number} x  the x coordinate of the rectangle to intersect the clip with
            * @param {Number} y  the y coordinate of the rectangle to intersect the clip with
            * @param {Number} width  the width of the rectangle to intersect the clip with
            * @param {Number} height  the height of the rectangle to intersect the clip with
            */
            this.clipRect = function (x, y, width, height) {

            };

            /**
            * Fills the specified rectangle
            * @param {Number} x  the x coordinate of the rectangle to be filled
            * @param {Number} y   the y coordinate of the rectangle to be filled
            * @param {Number} width  the width of the rectangle to be filled
            * @param {Number} height  the height of the rectangle to be filled
            */
            this.fillRect = function (x, y, width, height) {
                _context.fillRect(_origin.x + x, _origin.y + y, width, height);
            };

            /**
            * Clears the specified rectangle by filling it with the background color of the current drawing surface
            * @param {Number} x  the x coordinate of the rectangle to clear
            * @param {Number} y   the y coordinate of the rectangle to clear
            * @param {Number} width  the width of the rectangle to clear
            * @param {Number} height  the height of the rectangle to clear
            */
            this.clearRect = function (x, y, width, height) {
                _context.clearRect(x, y, width, height);
            };

            /**
            * Draws the outline of the specified rectangle.
            * @param {Number} x  the x coordinate of the rectangle to be drawn
            * @param {Number} y   the y coordinate of the rectangle to be drawn
            * @param {Number} width  the width of the rectangle to be drawn
            * @param {Number} height  the height of the rectangle to be drawn
            */
            this.drawRect = function (x, y, width, height) {
                _context.strokeRect(_origin.x + x, _origin.y + y, width, height);
            };

            /**
            * Fills a circle bounded by the specified rectangle with the current color
            * @param {Number} x  the x coordinate of the upper left corner of the circle to be filled
            * @param {Number} y  the y coordinate of the upper left corner of the circle to be filled
            * @param {Number} radius  the radius of the circle to be filled
            */
            this.fillCircle = function (x, y, radius) {
                createOvalPath(x, y, radius);
                _context.fill();
            };

            /**
            * Draws the outline of a circle
            * @param {Number} x  the x coordinate of the upper left corner of the circle to be drawn
            * @param {Number} y  the y coordinate of the upper left corner of the circle to be drawn
            * @param {Number} radius  the radius of the circle to be drawn
            */
            this.drawCircle = function (x, y, radius) {
                createOvalPath(x, y, radius);
                _context.stroke();
            };

            /**
            * Draws a line, using the current color, between the points (x1, y1) and (x2, y2) in this graphics context's coordinate system
            * @param {Number} x1  the first point's x coordinate
            * @param {Number} y1  he first point's y coordinate
            * @param {Number} x2  the second point's x coordinate
            * @param {Number} y2  the second point's y coordinate
            */
            this.drawLine = function (x1, y1, x2, y2) {
                _context.beginPath();
                _context.moveTo(_origin.x + x1, _origin.y + y1);
                _context.lineTo(_origin.x + x2, _origin.y + y2);
                _context.stroke();
            };

            /**
            * Draws a closed polygon defined by arrays of x and y coordinates
            * @param {Array} xPoints  an array of x coordinates
            * @param {Array} yPoints  an array of y coordinates
            * @param {Number} nPoints  the total number of points
            */
            this.drawPolygon = function (xPoints, yPoints, nPoints) {
                if ((nPoints > 0) && (xPoints !== null) && (yPoints !== null)) {
                    createPolygonPath(xPoints, yPoints, nPoints);
                    _context.stroke();
                }
            };

            /**
            * Fills a closed polygon defined by arrays of x and y coordinates
            * @param {Array} xPoints  an array of x coordinates
            * @param {Array} yPoints  an array of y coordinates
            * @param {Number} nPoints  the total number of points
            */
            this.fillPolygon = function (xPoints, yPoints, nPoints) {
                if ((nPoints > 0) && (xPoints !== null) && (yPoints !== null)) {
                    createPolygonPath(xPoints, yPoints, nPoints);
                    _context.fill();
                }
            };

            /**
            * Translates the origin of the graphics context to the point (x, y) in the current coordinate system
            * @param {Number} x  the x coordinate
            * @param {Number} y  the y coordinate
            */
            this.translate = function (x, y) {
                _origin.x = x;
                _origin.y = y;
            };
        }
    };

}());