<?php
/*
 * localdata.php
 *
 * @author Pavel Kukov
 * 
 * date: 2012-07-02 18:41:11
 *
 *
 *	Sample usage for localdata.php 
 *	Include - include('localdata.php');
 *	 
 *	Create Object - $localdata = localdata::get(); 
 *	
 *	Store - $localdata("name", "value"); or $localdata->name = "value"; value can be integer, string, array
 *	$localdata("name", array(1,2,3,4,5));
 *	$localdata("name", array("name" => "John Dow", "email" => "john@company.com")); 
 *	
 *	Read - $localdata("name"); or $localdata->name 
 *	Delete One Item By Key - $localdata->remove("name"); 
 *	Delete entire cookie - $localdata->clear(); 
 *	Count Stored Items - $localdata->count(); 
 *	Get/Set cookie configuration - $localdata->config() and $localdata->config(Array('expires' => 'in days', 'path' => 'your new path', 'domain' => 'domain', 'secure' => true or false}) defaults are 'expires' => 365, 'path' => '/', 'domain' => NULL, 'secure' => NULL 
 *	Get/Set cookie prefix - $localdata->prefix() and $localdata->prefix("newprefix") default is "localdatacookie" 
 *
 */
class localdata
{
	private $cookie_data;
	private $cookie_prefix;
	private $cookie_count;
	private $cookie_found;
	private $cookie_string;
	private $cookie_default_options;
	
	private static $localdata_obj;
	
	public function __construct()
	{
		$this->cookie_default_options = Array("path"=>"/", "expires"=>365, 'domain'=>NULL, 'secure'=>NULL);
		$this->cookie_string = '';
		$this->cookie_prefix = "localdata_cookie_";
		$this->cookie_count = 0;
		
		if(isset($_COOKIE) && !empty($_COOKIE))
		{
			$this->cookie_found = array_key_exists($this->cookie_prefix.$this->cookie_count, $_COOKIE);
			
			if($this->cookie_found)
			{
				$this->cookie_string = $_COOKIE[$this->cookie_prefix.$this->cookie_count];
			}
			while($this->cookie_found)
			{
				$this->cookie_count++;
				$this->cookie_found = array_key_exists($this->cookie_prefix.$this->cookie_count, $_COOKIE);
				
				if($this->cookie_found)
				{
					$this->cookie_string .= $_COOKIE[$this->cookie_prefix.$this->cookie_count];
					if(strpos($this->cookie_string, '__END__') !== false)
					{
						$this->cookie_found = false;
					}
				}
			}
		}
		if($this->cookie_string != '')
		{
			$this->cookie_string = str_replace('__END__', '', $this->cookie_string);
			$this->cookie_data = json_decode( base64_decode( $this->cookie_string ), true);
		}
		else 
		{
			$this->cookie_data = array();
		}
	}
	
	public static function get()
	{
		if (!(self::$localdata_obj instanceof localdata)) 
		{
            self::$localdata_obj = new self();
        }
        return self::$localdata_obj;
	}
	
	public function __get($option)
	{
		if(array_key_exists($option, $this->cookie_data))
		{
			return $this->cookie_data[$option];
		}
	}
	
	public function __set($option, $value)
	{
		$this->cookie_data[$option] = $value;
		$this->save();
	}
	
	public function __invoke()
	{
		$numargs = func_num_args();
		if($numargs > 0)
		{
			$arg_list = func_get_args();
			if(array_key_exists(1, $arg_list))
			{
				return $this->$arg_list[0] = $arg_list[1];
			}
			else 
			{
				return $this->$arg_list[0];
			}
		}
	}
	
	public function __isset($option)
	{
		if(array_key_exists($option, $this->cookie_data))
		{
			return true;
		}
		else 
		{
			return false;
		}
	}
	
	public function count()
	{
		return $this->cookie_count;
	}
	
	public function config()
	{
		$numargs = func_num_args();
		
		if($numargs > 0)
		{
			$arg_list = func_get_args();
			$this->cookie_default_options = array_merge($this->cookie_default_options, $arg_list[0]);
		}
		
		return $this->cookie_default_options;
	}
	
	public function prefix()
	{
		$numargs = func_num_args();
		
		if($numargs > 0)
		{
			$arg_list = func_get_args();
			$this->cookie_prefix = $arg_list[0];
		}
		
		return $this->cookie_prefix;
	}
	
	public function remove($key)
	{
		unset($this->cookie_data[$key]);
		$this->save();
	}
	
	public function clear()
	{
		foreach($this->cookie_data as $key=>$v)
		{
			unset($this->cookie_data[$key]);
		}
		
		$this->save();
	}
	
	public function push($option, $value)
	{
		$this->cookie_data[$option] = $value;
	}
	
	public function dump()
	{
		var_dump($this->cookie_data);
	}
	
	public function save()
	{
		$this->cookie_string = base64_encode(json_encode($this->cookie_data));
		$size = mb_strlen($this->cookie_string.'__END__', "UTF-8");
		$parts = ceil($size/4096);
		if($parts > 1)
		{
			$cookies = str_split($this->cookie_string.'__END__', 4096);
			foreach($cookies as $k=>$cookie_content)
			{
				setcookie($this->cookie_prefix.$k, $cookie_content, time() + (86400 * $this->cookie_livetime_in_days), "/");
			}
		}
		else 
		{
			setcookie($this->cookie_prefix."0", $this->cookie_string.'__END__', time() + (86400 * $this->cookie_default_options['expires']), $this->cookie_default_options['path'], $this->cookie_default_options['domain'], $this->cookie_default_options['secure']);
		}
	}

	private function substr_unicode($str, $s, $l = null) {
	     return join("", array_slice(
	     preg_split("//u", $str, -1, PREG_SPLIT_NO_EMPTY), $s, $l));
	}
}
?>