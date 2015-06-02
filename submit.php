<?php

$path = "results/{$_POST["userToken"]}";

if (!file_exists($path)) {
	mkdir($path);
	chdir($path);
	echo exec("git init");
}
else {
	chdir($path);
}

$date = date("Y-m-d H:i:s");
file_put_contents("current.tex", $_POST["content"]);


echo exec("git add .");
echo exec("git commit -m '{$date}'");
