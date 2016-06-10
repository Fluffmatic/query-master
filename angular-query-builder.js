var app = angular.module('app', ['ngSanitize', 'queryBuilder']);
app.controller('QueryBuilderCtrl', ['$scope', function ($scope) {
    var data = '{"group": {"operator": "AND","rules": []}}';

    function htmlEntities(str) {
        return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function computed(group) {
        if (!group) return "";
        for (var str = "(", i = 0; i < group.rules.length; i++) {
            i > 0 && (str += " <strong>" + group.operator + "</strong> ");
            str += group.rules[i].group ?
                computed(group.rules[i].group) :
                group.rules[i].field.name + " " + htmlEntities(group.rules[i].condition) + " " + group.rules[i].data;
        }
        return str + ")";
    }

    $scope.json = null;

    $scope.filter = JSON.parse(data);

    $scope.$watch('filter', function (newValue) {
        $scope.json = JSON.stringify(newValue, null, 2);
        $scope.output = computed(newValue.group);
    }, true);
}]);

var queryBuilder = angular.module('queryBuilder', []);
queryBuilder.directive('queryBuilder', ['$compile', function ($compile) {
    return {
        restrict: 'E',
        scope: {
            group: '='
        },

        templateUrl: '/queryBuilderDirective.html',
        compile: function (element, attrs) {
            var content, directive;
            content = element.contents().remove();
            return function (scope, element, attrs) {
				scope.user = {searchfield: ''};
				
				scope.searchfields = [{
					name: 'First Name',
					datatype: '0'
					}, {
					name: 'Start Date',
					datatype: '2'
					}, {
					name: 'Height (cm)',
					datatype: '1'	
					}];
				
				scope.conditions = [{
					"datatype": "String",
					"condition": [
                    { name: 'Equals' },
                    { name: 'Contains' },
                    { name: 'Starts With' },
                    { name: 'Ends With' }
					]
					}, {
					"datatype": "Number",
					"condition": [
                    { name: '=' },
                    { name: '<>' },
                    { name: '<' },
                    { name: '<=' },
                    { name: '>' },
                    { name: '>=' }
					]
					},{
					"datatype": "Datetime",
					"condition": [
                    { name: 'Equals' },
                    { name: 'Before' },
                    { name: 'After' }
					]
				}];

				scope.operators = [
                    { name: 'AND' },
                    { name: 'NOT' },
                    { name: 'OR' }
                ];

                scope.addCondition = function () {
                    scope.group.rules.push({
                        field: 'First Name',
                        condition: 'Equals',
                        data: ''
                    });
                };

                scope.removeCondition = function (index) {
                    scope.group.rules.splice(index, 1);
                };

                scope.addGroup = function () {
                    scope.group.rules.push({
                        group: {
                            operator: 'AND',
                            rules: []
                        }
                    });
                };
                
                scope.removeGroup = function () {
                    "group" in scope.$parent && scope.$parent.group.rules.splice(scope.$parent.$index, 1);
                };

                directive || (directive = $compile(content));

                element.append(directive(scope, function ($compile) {
                    return $compile;
                }));
            }
        }
    }
}]);

