var toCamelCase = require('to-camel-case')

function ifValThen(column, property, value, then) {
	var equal = Array.isArray(value) ? value.some(function(value) { return column[property] === value}) : column[property] === value

	return equal ? then : ''
}

// Number of bytes mapped to signed integer range
function bytesToSignedRange(num) {
    const bits = num * 8;
    const min = -Math.pow(2, bits - 1);
    const max = Math.pow(2, bits - 1) - 1;
    return [min, max];
}

function bytesToUnsignedRange(num) {
    const bits = num * 8;
    const max = Math.pow(2, bits) - 1;
    return [0, max];
}

function decimalLessThan(precision) {
	return Math.pow(10, precision)
}

function unrollEnum(col) {
	return col.columnType.match(/enum\((.+)\)/)[1]
}

var checks = [

	function intCheck(intf, column) {
    
		var checks = ''
        var bytes = intf.intToBytes[column.dataType];

		if (bytes) {

			checks += '.number().integer()'
            
			if (!intf.hasUnsigned) { 
			    let [min, max] = bytesToSignedRange(bytes);
                checks += '.max(' + max + ').min(' + min + ')'
			}
            else if(column.columnType.indexOf('unsigned') !== -1) {

                let [min, max] = bytesToUnsignedRange(bytes);
                checks += '.max(' + max + ').min(' + min + ')'
            }

		}

		return checks
	},

	function dateCheck(intf, column) {
		return ifValThen(column, 'dataType', ['datetime', 'date', 'timestamp'], '.date()')
	},

	function stringCheck(intf, column) {
	    const max = column.characterMaximumLength ? '.max(' + column.characterMaximumLength + ')' : '';

		return ifValThen(column, 'dataType', ['text', 'varchar', 'char', 'character', 'character varying'], '.string()' + max)
	},

	function boolCheck(intf, column) {
	    let isBool = column.dataType === 'bit' && column.numericPrecision == '1';
	    isBool |= column.dataType === 'boolean';

		return isBool ? '.boolean()' : ''
	},

	function decimalCheck(intf, column) {
		return ifValThen(column, 'dataType', 'decimal', '.number().precision('
			+ column.numericScale + ').less(' + decimalLessThan(column.numericPrecision - column.numericScale) + ')')
	},

	function enumCheck(intf, column) {
		if (column.dataType === 'enum') {
			return '.any().valid(' + unrollEnum(column) + ')'
		}
		return ''
	},

	function nullableCheck(intf, column) {
		if (column.isNullable === 'YES') {
			return '.allow(null)'
		} else if (column.isNullable === 'NO') {
			return '.invalid(null)'
		}
	}

]

module.exports = function(intf, columns, camelCaseProperties) {

	return 'Joi.object({\n\t' + columns.map(function(column) {
		var property = camelCaseProperties ? toCamelCase(column.columnName) : column.columnName
		return property + ': Joi' + checks.map(function(check) {
			return check(intf, column)
		}).join('')
	}).join(',\n\t') + '\n})'
}
