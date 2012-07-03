Sample usage for localdata.js 
=============

* Store - $.localdata("name", "value"); 
value can be integer, string, object, array 
$.localdata("name", [1,2,3,4,5]); 
$.localdata("name", {name: "John Dow", email: "john@company.com"}); 
 
* Read - $.localdata("name"); 
* Delete One Item By Key - $.localdata.remove("name"); or $.localdata("name",null,{expires:-1}); 
* Delete entire cookie - $.localdata.clear(); 
* Count Stored Items - $.localdata.count(); 
* Force Reload - $.localdata.reload(); 
* Get/Set cookie configuration - $.localdata.config() and $.localdata.config({expires: 'in days', path: 'your new path', domain: 'domain', 'secure': true or false}) defaults are expires: 365, path: '/', domain: '', 'secure': '' 
* Get/Set cookie prefix - $.localdata.prefix() and $.localdata.prefix("new_prefix_") default is "localdata_cookie_" 
 
PHP: Sample usage for localdata.php 
=============

* Include - include('localdata.php');  
* Create Object - $localdata = localdata::get();  
 
* Store - $localdata("name", "value"); or $localdata->name = "value"; 
 value can be integer, string, array  
$localdata("name", array(1,2,3,4,5));  
$localdata("name", array("name" => "John Dow", "email" => "john@company.com"));  
 
* Read - $localdata("name"); or $localdata->name 
* Delete One Item By Key - $localdata->remove("name");  
* Delete entire cookie - $localdata->clear();  
* Count Stored Items - $localdata->count(); 
* Get/Set cookie configuration - $localdata->config() and $localdata->config(Array('expires' => 'in days', 'path' => 'your new path', 'domain' => 'domain', 'secure' => true or false}) defaults are 'expires' => 365, 'path' => '/', 'domain' => NULL, 'secure' => NULL 
* Get/Set cookie prefix - $localdata->prefix() and $localdata->prefix("new_prefix_") default is "localdata_cookie_"  