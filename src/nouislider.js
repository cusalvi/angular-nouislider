'use strict';
angular.module('nouislider', []).directive('slider', function($timeout) {
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
                    /* Styling for active value under slider */
                    var currentValue, currentPageSizeValue, filteredPageViewValue;
                    $(element.find($('.ui-slider-value'))[parsedValue]).css({'color': 'rgb(65, 66, 74)', 'font-weight': 'normal'});
                    parsedValue = parseFloat(slider.val());

                    currentValue = $(element.find($('.ui-slider-value'))[parsedValue]).text();
                    currentPageSizeValue = scope.$parent.model.pageSize.values[parsedValue];
                    filteredPageViewValue = scope.thousandSuffix(scope.$parent.model.pageViews.values[parsedValue], 0)
                    if (currentValue == currentPageSizeValue || currentValue == filteredPageViewValue) {
                        $(element.find($('.ui-slider-value'))[parsedValue]).css({'color': '#f08041', 'font-weight': '600'});
                    }

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
                        suffixes = ['K', 'M', 'B', 'T', 'P', 'E'];

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
                        leftMargin = 0,
                        leftValue = 0;

                    for (counter = 0; counter <= scope.end; counter++) {
                        if (counter == 0) {
                            leftMargin = scope.startpointer * 1;
                            left = leftMargin + "%";
                        } else if (counter == scope.end) {
                            leftMargin += scope.increment * 1;
                            left = leftMargin + "%";
                            leftValue = (leftMargin - 1) + "%";
                        } else {
                            leftMargin += scope.increment * 1;
                            left = leftMargin + "%";
                            leftValue = (leftMargin - 2) + "%";
                            $("<div/>").addClass("ui-slider-tick")
                                .appendTo(slider)
                                .css({
                                    left: left,
                                    background: background
                                });
                        }
                        if (scope.end < 5) {
                            $("<div/>").addClass("ui-slider-value")
                                .appendTo(slider)
                                .text(scope.$parent.model.pageSize.values[counter])
                                .css({
                                    left: leftValue,
                                    display: 'block',
                                    position: 'absolute',
                                    top: '100%',
                                    margin: '10px auto'
                                });
                        } else {
                            var value = scope.thousandSuffix(scope.$parent.model.pageViews.values[counter], 0);
                            $("<div/>").addClass("ui-slider-value")
                                .appendTo(slider)
                                .text(value)
                                .css({
                                    left: leftValue,
                                    display: 'block',
                                    position: 'absolute',
                                    top: '100%',
                                    margin: '10px auto'
                                });
                        }
                    }
                });

                return scope.$watch('ngModel', function(newVal, oldVal) {
                    if (newVal !== parsedValue) {
                        slider.trigger('update');
                        $timeout(function() {
                            slider.trigger("slide");
                        }, 1000);
                        return slider.val(newVal);
                    }

                });
            }
        }
    };
});