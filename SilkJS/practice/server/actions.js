function foo_action() {
	res.write('foo_action\n');
	res.stop();
}

function bar_action() {
	res.write('bar_action\n');
	res.stop();
}

function main_action() {
	res.write([
    '<!doctype html>',
    '<html>',
    ' <head>',
		'		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />',
    '   <title>SilkJS / mysql demo</title>',
    '		<style type="text/css">   ',                 
    '  		html , body { ',
    '    		font: normal 0.9em arial , helvetica; ',
    ' 		} ',                    
    ' 	</style> ',
		'		<script type="text/javascript" src="test.js"></script>' ,
    ' </head>',
    ' <body>',
		'		<b>Create new employee</b>' ,
		'		<div>Name: <input type=\'text\' id=\'employee_name\' value=\'\'></div>',
		'		<div>Salary: <input type=\'text\' id=\'employee_salary\' value=\'\'></div>' ,
		'		<div><input type=\'button\' value=\'Save\' id=\'save\'></div>' ,
    
    '		<br> ',
    '		<b>List of Employees:</b>',
    '		<ul id=\'employees\'></ul>' ,
    ' </body>',
    '</html>'
  ].join('\n'));
  res.stop();
}

function notFound_action() {
	res.write('My 404 handler\n');
	res.stop();
}

