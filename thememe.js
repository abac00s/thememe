/*
  Thememe is a library for managing and switching between CSS themes.
  Copyright (C) 2017  Adam Bac

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var thememe = {};


thememe.UrlParser = {
    parse: function(url) {
	var obj = Object.create(thememe.UrlParser);

	var s = url.split('#', 2);
	if(s.length == 2)
	    obj.afterHash = s[1];
	else
	    obj.afterHash = null;

	s = s[0].split('?', 2)
	obj.baseUrl = s[0];

	obj.params = {};
	if(s.length < 2) return obj;
	var paramString = s[1];
	paramString.split('&').forEach(function(param){
	    pair = param.split('=');
	    obj.params[pair[0]] = pair[1];
	});
	return obj;
    },

    generateUrl: function() {
	var url = this.baseUrl;
	var keys = Object.keys(this.params);
	if(keys.length > 0) {
	    url += '?';
	    for(var i = 0; i < keys.length; i++){
		url += keys[i] + '=' + this.params[keys[i]];
		if(i < keys.length - 1) url += '&';
	    }
	}
	if(this.afterHash)
	    url += '#' + this.afterHash;
	return url;
    },
};



/*
  Object containig all available themes, and their css files.
  If the value is null, it means that the theme doesn't load any css
  file. 
  Don't remove the default 'none' theme, it's necessary in order for
  library to work properly.
  Of course all custom themes must be added to it here, or in some other
  JS code loaded before any function provided by the library is called.
*/
thememe.themes = {
    'none': null,
    /* 'example-theme': '/themes/example.css', */
};

thememe.current_theme = 'none';


/*
  Load theme given in url's thememe parameter.
  If no such is given or the theme doesn't exist,
  load empty theme (none).
*/
thememe.loadThemeFromUrl = function() {
    var regex = /[?&]thememe=([^&#]*)/g;
    var match = regex.exec(window.location.href);
    if(match && match[1] in this.themes)
	this.current_theme = match[1];
    else
	this.current_theme = 'none';
    this.loadTheme(this.current_theme);
}

thememe.updateThemeInUrl = function(url, theme) {
    var parser = this.UrlParser.parse(url);
    if(this.themes[theme]) parser.params['thememe'] = theme;
    else delete parser.params['thememe'];
    return parser.generateUrl();
} 

/*
  Load given theme.
*/
thememe.loadTheme = function(theme) {
    if(!(theme in this.themes)) return;

    var prev = document.getElementById('thememe-loaded');
    if(prev) document.head.removeChild(prev);
    
    this.current_theme = theme;
    var css = this.themes[theme];
    if(css) {
	var el = document.createElement('link');
	el.setAttribute('rel', 'stylesheet');
	el.setAttribute('type', 'text/css');
	el.setAttribute('href', css);
	el.id = 'thememe-loaded';
	document.head.appendChild(el);
    }

    var elements = document.getElementsByClassName('thememe-update');
    for(var i = 0; i < elements.length; i++) {
	if(elements[i].href) {
	    elements[i].href = this.updateThemeInUrl(elements[i].href, theme);
	}
    }
}

/*
  Switches between theme1 and theme2 when called.
*/
thememe.toggleThemes = function(theme1, theme2) {
    if(this.current_theme == theme1)
	this.loadTheme(theme2);
    else if(this.current_theme == theme2)
	this.loadTheme(theme1);
}
