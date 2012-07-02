/**
 * @author Pavel Kukov
 * 
 * date: 2012-07-02
 */
(function($)
{
	//
	var localdata_obj = {};
	var read_local = true;
	var prefix = "localdata_cookie_";
	var saved_to_cookies = 0;
	var defaultOptions =
	{
		expires : 365,
		path : "/"
	};
	//
	jQuery.localdata = function()
	{
		var option, value;
		
		var args = arguments;
		
		if(args.length)
		{
			option = args[0];
			
			if(1 in args)
			{
				value = args[1];
			}
			
			if(2 in args && "expires" in args[2] && args[2]["expires"] === -1)
			{
				jQuery.localdata.remove(option);
				return;
			}
		}
		//
		if(read_local)
		{
			jQuery.localdata.load();
			read_local = false;
		}
		//
		if( (!value || value == "NaN" || value == "undefined") && value !== false && value !== 0 && value !== null && value !== "")
		{
			if(localdata_obj && typeof localdata_obj == "object" && option in localdata_obj)
			{
				return localdata_obj[option];
			}
			else
			{
				return;
			}
		}
		else
		{
			localdata_obj[option] = value;
			jQuery.localdata.save();
		}
	};

	jQuery.localdata.save = function()
	{
		var save_string = base64_encode(json_encode(localdata_obj));
		//
		var size = encodeURIComponent(save_string + '__END__').length;
		var parts = Math.ceil(size / 4096);
		if(parts > 1)
		{
			var chunks = str_split(save_string + '__END__', 4096)
			for( i = 0; i < chunks.length; i++)
			{
				jqcookie(prefix + i, chunks[i], defaultOptions);
			}
		}
		else
		{
			jqcookie(prefix + "0", save_string + '__END__', defaultOptions);
		}
	}

	jQuery.localdata.load = function()
	{
		var item_count = 0;
		var cookie_found = jqcookie(prefix + item_count);
		var datastring = cookie_found;
		var valid_cookie = true;
		//
		while(cookie_found)
		{
			item_count++;
			cookie_found = jqcookie(prefix + item_count);
			if(cookie_found)
			{
				if(valid_cookie)
				{
					datastring += cookie_found;
					if(datastring.indexOf('__END__') != -1)
					{
						valid_cookie = false;
					}
				}
				else
				{
					jqcookie(prefix + item_count, null,
					{
						expires : -1
					});
				}
			}
		}
		saved_to_cookies = item_count;
		if(datastring && datastring.indexOf('__END__') != -1)
		{
			datastring = datastring.replace(new RegExp('__END__', 'g'), '');
			localdata_obj = json_decode(base64_decode(datastring));
			//
			if(json_last_error())
			{
				localdata_obj =
				{
					"error" : "json_decode"
				};
			}
		}
	}

	jQuery.localdata.remove = function(key)
	{
		delete localdata_obj[key];
		jQuery.localdata.save();
	}

	jQuery.localdata.clear = function()
	{
		for(i in localdata_obj)
		{
			delete localdata_obj[i];
		}
		jQuery.localdata.save();
	}

	jQuery.localdata.count = function()
	{
		return saved_to_cookies;
	}

	jQuery.localdata.reload = function()
	{
		jQuery.localdata.save();
		jQuery.localdata.load();
		return saved_to_cookies;
	}
	
	var str_split = function(string, split_length)
	{
		if(split_length === null)
		{
			split_length = 1;
		}
		if(string === null || split_length < 1)
		{
			return false;
		}
		string += '';
		var chunks = [], pos = 0, len = string.length;
		while(pos < len)
		{
			chunks.push(string.slice(pos, pos += split_length));
		}
		return chunks;
	}
	
	/*!
	 * jQuery Cookie Plugin
	 * https://github.com/carhartl/jquery-cookie
	 *
	 * Copyright 2011, Klaus Hartl
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://www.opensource.org/licenses/mit-license.php
	 * http://www.opensource.org/licenses/GPL-2.0
	 */
	
	var jqcookie = function(key, value, options) {

        // key and at least value given, set cookie...
        if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
            options = $.extend({}, options);

            if (value === null || value === undefined) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path    ? '; path=' + options.path : '',
                options.domain  ? '; domain=' + options.domain : '',
                options.secure  ? '; secure' : ''
            ].join(''));
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var decode = options.raw ? function(s) { return s; } : decodeURIComponent;

        var pairs = document.cookie.split('; ');
        for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
            if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
        }
        return null;
    };
	
	/*
        http:phpjs.org/
        
        http://www.JSON.org/json2.js
        2008-11-19
        Public Domain.        NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
        See http://www.JSON.org/js.html
    */
	
	var json_decode = function(str_json)
	{
		var json = this.window.JSON;
		if( typeof json === 'object' && typeof json.parse === 'function')
		{
			try
			{
				return json.parse(str_json);
			}
			catch(err)
			{
				if(!( err instanceof SyntaxError))
				{
					throw new Error('Unexpected error type in json_decode()');
				}
				this.php_js = this.php_js || {};
				this.php_js.last_error_json = 4;
				return null;
			}
		}
		var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		var j;
		var text = str_json;
		cx.lastIndex = 0;
		if(cx.test(text))
		{
			text = text.replace(cx, function(a)
			{
				return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			});
		}
		if((/^[\],:{}\s]*$/).test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
		{
			j = new Function('return ' + text);
			return j();
		}
		this.php_js = this.php_js || {};
		this.php_js.last_error_json = 4;
		return null;
	}
	
	/*
        http:phpjs.org/
        
        http://www.JSON.org/json2.js
        2008-11-19        Public Domain.
        NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
        See http://www.JSON.org/js.html
    */
	
	var json_encode = function(mixed_val)
	{
		var retVal, json = this.window.JSON;
		try
		{
			if( typeof json === 'object' && typeof json.stringify === 'function')
			{
				retVal = json.stringify(mixed_val);
				if(retVal === undefined)
				{
					throw new SyntaxError('json_encode');
				}
				return retVal;
			}
			var value = mixed_val;
			var quote = function(string)
			{
				var escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
				var meta =
				{
					'\b' : '\\b',
					'\t' : '\\t',
					'\n' : '\\n',
					'\f' : '\\f',
					'\r' : '\\r',
					'"' : '\\"',
					'\\' : '\\\\'
				};
				escapable.lastIndex = 0;
				return escapable.test(string) ? '"' + string.replace(escapable, function(a)
				{
					var c = meta[a];
					return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				}) + '"' : '"' + string + '"';
			};
			var str = function(key, holder)
			{
				var gap = '';
				var indent = '    ';
				var i = 0;
				var k = '';
				var v = '';
				var length = 0;
				var mind = gap;
				var partial = [];
				var value = holder[key];
				if(value && typeof value === 'object' && typeof value.toJSON === 'function')
				{
					value = value.toJSON(key);
				}
				switch(typeof value)
				{
					case'string':
						return quote(value);
					case'number':
						return isFinite(value) ? String(value) : 'null';
					case'boolean':
					case'null':
						return String(value);
					case'object':
						if(!value)
						{
							return 'null';
						}
						if((this.PHPJS_Resource && value instanceof this.PHPJS_Resource) || (window.PHPJS_Resource && value instanceof window.PHPJS_Resource))
						{
							throw new SyntaxError('json_encode');
						}
						gap += indent;
						partial = [];
						if(Object.prototype.toString.apply(value) === '[object Array]')
						{
							length = value.length;
							for( i = 0; i < length; i += 1)
							{
								partial[i] = str(i, value) || 'null';
							}
							v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
							gap = mind;
							return v;
						}
						for(k in value)
						{
							if(Object.hasOwnProperty.call(value, k))
							{
								v = str(k, value);
								if(v)
								{
									partial.push(quote(k) + ( gap ? ': ' : ':') + v);
								}
							}
						}
						v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
						gap = mind;
						return v;
					case'undefined':
					case'function':
					default:
						throw new SyntaxError('json_encode');
				}
			};
			return str('', {'' : value });
		}
		catch(err)
		{
			if(!( err instanceof SyntaxError))
			{
				throw new Error('Unexpected error type in json_encode()');
			}
			this.php_js = this.php_js || {};
			this.php_js.last_error_json = 4;
			return null;
		}
	}
	
	/*
    http:phpjs.org/
    
    JSON_ERROR_NONE = 0    JSON_ERROR_DEPTH = 1 // max depth limit to be removed per PHP comments in json.c (not possible in JS?)
    JSON_ERROR_STATE_MISMATCH = 2 // internal use? also not documented
    JSON_ERROR_CTRL_CHAR = 3 // [\u0000-\u0008\u000B-\u000C\u000E-\u001F] if used directly within json_decode(),
                                                                  // but JSON functions auto-escape these, so error not possible in JavaScript
    JSON_ERROR_SYNTAX = 4    
    */
	
	var json_last_error = function()
	{
		return this.php_js && this.php_js.last_error_json ? this.php_js.last_error_json : 0;
	}
	
	/*
	 Decodes string using MIME base64 algorithm  
     
     version: 1109.2015
     discuss at: http:phpjs.org/functions/base64_decode     +   original by: Tyler Akins (http:rumkin.com)
     +   improved by: Thunder.m
     +      input by: Aman Gupta
     +   improved by: Kevin van Zonneveld (http:kevin.vanzonneveld.net)
     +   bugfixed by: Onno Marsman     +   bugfixed by: Pellentesque Malesuada
     +   improved by: Kevin van Zonneveld (http:kevin.vanzonneveld.net)
     +      input by: Brett Zamir (http:brett-zamir.me)
     +   bugfixed by: Kevin van Zonneveld (http:kevin.vanzonneveld.net)
     -    depends on: utf8_decode     *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
     *     returns 1: 'Kevin van Zonneveld'
     mozilla has this native
     - but breaks in 2.0.0.12!
    if (typeof this.window['btoa'] == 'function') {        return btoa(data);
    }
	*/
	
	var base64_decode = function(data)
	{
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, dec = "", tmp_arr = [];
		if(!data)
		{
			return data;
		}
		data += '';
		do
		{
			h1 = b64.indexOf(data.charAt(i++));
			h2 = b64.indexOf(data.charAt(i++));
			h3 = b64.indexOf(data.charAt(i++));
			h4 = b64.indexOf(data.charAt(i++));
			bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
			o1 = bits >> 16 & 0xff;
			o2 = bits >> 8 & 0xff;
			o3 = bits & 0xff;
			if(h3 == 64)
			{
				tmp_arr[ac++] = String.fromCharCode(o1);
			}
			else if(h4 == 64)
			{
				tmp_arr[ac++] = String.fromCharCode(o1, o2);
			}
			else
			{
				tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
			}
		}
		while(i<data.length);
		dec = tmp_arr.join('');
		dec = utf8_decode(dec);
		return dec;
	}
	
	/*
	 Encodes string using MIME base64 algorithm  
     
     version: 1109.2015
     discuss at: http:phpjs.org/functions/base64_encode     +   original by: Tyler Akins (http:rumkin.com)
     +   improved by: Bayron Guevara
     +   improved by: Thunder.m
     +   improved by: Kevin van Zonneveld (http:kevin.vanzonneveld.net)
     +   bugfixed by: Pellentesque Malesuada     +   improved by: Kevin van Zonneveld (http:kevin.vanzonneveld.net)
     +   improved by: Rafał Kukawski (http:kukawski.pl)
     -    depends on: utf8_encode
     *     example 1: base64_encode('Kevin van Zonneveld');
     *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='     mozilla has this native
     - but breaks in 2.0.0.12!
    if (typeof this.window['atob'] == 'function') {
        return atob(data);
    }
	 */
	
	var base64_encode = function(data)
	{
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = "", tmp_arr = [];
		if(!data)
		{
			return data;
		}
		data = utf8_encode(data + '');
		do
		{
			o1 = data.charCodeAt(i++);
			o2 = data.charCodeAt(i++);
			o3 = data.charCodeAt(i++);
			bits = o1 << 16 | o2 << 8 | o3;
			h1 = bits >> 18 & 0x3f;
			h2 = bits >> 12 & 0x3f;
			h3 = bits >> 6 & 0x3f;
			h4 = bits & 0x3f;
			tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
		}
		while(i<data.length);
		enc = tmp_arr.join('');
		var r = data.length % 3;
		return ( r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
	}
	
	/*
	    Converts a UTF-8 encoded string to ISO-8859-1  
     
     version: 1109.2015
     discuss at: http:phpjs.org/functions/utf8_decode     +   original by: Webtoolkit.info (http:www.webtoolkit.info/)
     +      input by: Aman Gupta
     +   improved by: Kevin van Zonneveld (http:kevin.vanzonneveld.net)
     +   improved by: Norman "zEh" Fuchs
     +   bugfixed by: hitwork     +   bugfixed by: Onno Marsman
     +      input by: Brett Zamir (http:brett-zamir.me)
     +   bugfixed by: Kevin van Zonneveld (http:kevin.vanzonneveld.net)
     *     example 1: utf8_decode('Kevin van Zonneveld');
     *     returns 1: 'Kevin van Zonneveld'
	 */
	
	var utf8_decode = function(str_data)
	{
		var tmp_arr = [], i = 0, ac = 0, c1 = 0, c2 = 0, c3 = 0;
		str_data += '';
		while(i < str_data.length)
		{
			c1 = str_data.charCodeAt(i);
			if(c1 < 128)
			{
				tmp_arr[ac++] = String.fromCharCode(c1);
				i++;
			}
			else if(c1 > 191 && c1 < 224)
			{
				c2 = str_data.charCodeAt(i + 1);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else
			{
				c2 = str_data.charCodeAt(i + 1);
				c3 = str_data.charCodeAt(i + 2);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return tmp_arr.join('');
	}
	
	/*
	 Encodes an ISO-8859-1 string to UTF-8  
     
     version: 1109.2015
     discuss at: http:phpjs.org/functions/utf8_encode     +   original by: Webtoolkit.info (http:www.webtoolkit.info/)
     +   improved by: Kevin van Zonneveld (http:kevin.vanzonneveld.net)
     +   improved by: sowberry
     +    tweaked by: Jack
     +   bugfixed by: Onno Marsman     +   improved by: Yves Sucaet
     +   bugfixed by: Onno Marsman
     +   bugfixed by: Ulrich
     +   bugfixed by: Rafal Kukawski
     *     example 1: utf8_encode('Kevin van Zonneveld');     *     returns 1: 'Kevin van Zonneveld'
	*/
	
	var utf8_encode = function(argString)
	{
		if(argString === null || typeof argString === "undefined")
		{
			return "";
		}
		var string = (argString + '');
		var utftext = "", start, end, stringl = 0;
		start = end = 0;
		stringl = string.length;
		for(var n = 0; n < stringl; n++)
		{
			var c1 = string.charCodeAt(n);
			var enc = null;
			if(c1 < 128)
			{
				end++;
			}
			else if(c1 > 127 && c1 < 2048)
			{
				enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
			}
			else
			{
				enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
			}
			if(enc !== null)
			{
				if(end > start)
				{
					utftext += string.slice(start, end);
				}
				utftext += enc;
				start = end = n + 1;
			}
		}
		if(end > start)
		{
			utftext += string.slice(start, stringl);
		}
		return utftext;
	}
})(jQuery);
