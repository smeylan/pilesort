
<?php 
require_once __DIR__ . 'SysLog.php'; // Autoload files using Composer autoload
use coderofsalvation\SysLog;
SysLog::send( "this is a local test " );
SysLog::$hostname = "logs5.papertrailapp.com";
SysLog::$port     = 23777;
SysLog::send( "this is a local + papertrail test " );
SysLog::$local = false;
SysLog::send( "this is a papertrail test only" );
