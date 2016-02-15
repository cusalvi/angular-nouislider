'use strict';
angular.module('nouislider', []).directive('slider', function() {
    return {
        restrict: 'A',
        scope: {
            start: '@',
            step: '@',
            end: '@',
            ticks: '@',
            increment: '@',
            startpointer: '@',
            callback: '@',
            margin: '@',
            ngModel: '=',
            ngFrom: '=',
            ngTo: '='
        },
        link: function(scope, element, attrs) {
            var callback, fromParsed, parsedValue, slider, toParsed;
            slider = $(element);
            callback = scope.callback ? scope.callback : 'slide';
            if (scope.ngFrom != null && scope.ngTo != null) {
                fromParsed = null;
                toParsed = null;
                slider.noUiSlider({
                    start: [
                        scope.ngFrom || scope.start,
                        scope.ngTo || scope.end
                    ],
                    step: parseFloat(scope.step || 1),
                    connect: true,
                    margin: parseFloat(scope.margin || 0),
                    range: {
                        min: [parseFloat(scope.start)],
                        max: [parseFloat(scope.end)]
                    }
                });
                slider.on(callback, function() {
                    var from, to, _ref;
                    _ref = slider.val(), from = _ref[0], to = _ref[1];
                    fromParsed = parseFloat(from);
                    toParsed = parseFloat(to);
                    return scope.$apply(function() {
                        scope.ngFrom = fromParsed;
                        return scope.ngTo = toParsed;
                    });
                });
                scope.$watch('ngFrom', function(newVal, oldVal) {
                    if (newVal !== fromParsed) {
                        return slider.val([
                            newVal,
                            null
                        ]);
                    }
                });
                return scope.$watch('ngTo', function(newVal, oldVal) {
                    if (newVal !== toParsed) {
                        return slider.val([
                            null,
                            newVal
                        ]);
                    }
                });
            } else {
                parsedValue = null;
                slider.noUiSlider({
                    start: [scope.ngModel || scope.start],
                    step: parseFloat(scope.step || 1),
                    range: {
                        min: [parseFloat(scope.start)],
                        max: [parseFloat(scope.end)]
                    }
                });
                slider.on(callback, function() {
                    parsedValue = parseFloat(slider.val());
                    return scope.$apply(function() {
                        return scope.ngModel = parsedValue;
                    });
                });

                if (!scope.ticks) {
                    return scope.$watch('ngModel', function(newVal, oldVal) {
                        if (newVal !== parsedValue) {
                            return slider.val(newVal);
                        }
                    });
                }

                /* function - thousandSuffix
                 * It assigns appropriate suffixes to numbers above thousands values.
                 */
                scope.thousandSuffix = function(input, decimals) {
                    // return function(input, decimals) {
                    var exp, rounded,
                        suffixes = ['k', 'M', 'B', 'T', 'P', 'E'];

                    if (window.isNaN(input)) {
                        return null;
                    }

                    if (input < 1000) {
                        return input;
                    }

                    exp = Math.floor(Math.log(input) / Math.log(1000));

                    return (input / Math.pow(1000, exp)).toFixed(decimals) + suffixes[exp - 1];
                    // };

                };

                slider.on('update', function(event) {
                    var elm = $('#' + event.currentTarget.id);
                    var counter,
                        background = slider.css("border-color"),
                        left = 0,
                        leftMargin = 0;

                    for (counter = 0; counter <= scope.end; counter++) {
                        if (counter == 0) {
                            leftMargin = scope.startpointer * 1;
                            left = leftMargin + "%";
                            // left = leftMargin;
                        } else if (counter == scope.end) {
                            leftMargin += scope.increment * 1;
                            left = leftMargin + "%";
                        } else {
                            leftMargin += scope.increment * 1;
                            left = leftMargin + "%";
                            // left = leftMargin;
                            $("<div/>").addClass("ui-slider-tick")
                                .appendTo(slider)
                                .css({
                                    left: left,
                                    background: background
                                });
                            console.log(scope.$parent);

                        }
                        if (scope.end < 5) {
                            $("<div/>").addClass("ui-slider-value")
                                .appendTo(slider)
                                .text(scope.$parent.model.pageSize.values[counter])
                                .css({
                                    left: left,
                                    display: 'block',
                                    // background: background,
                                    position: 'absolute',
                                    top: '100%'
                                });
                        } else {
                            var value = scope.thousandSuffix(scope.$parent.model.pageViews.values[counter], 0);
                            $("<div/>").addClass("ui-slider-value")
                                .appendTo(slider)
                                .text(value)
                                .css({
                                    left: left,
                                    display: 'block',
                                    // background: background,
                                    position: 'absolute',
                                    top: '100%'
                                });
                        }
                    }
                });

                return scope.$watch('ngModel', function(newVal, oldVal) {
                    if (newVal !== parsedValue) {
                        slider.trigger('update')
                        return slider.val(newVal);
                    }

                });
            }
        }
    };
});
