<?php

$path = "results/{$_POST["userToken"]}";
$file = "{$path}/current.tex";

if (!file_exists($file)) {
	http_response_code(404);
}
else {
	$contents = file_get_contents($file);
	echo $contents;
}
