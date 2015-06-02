<!DOCTYPE HTML>
<html>
<head>
	<title>Latex Editor</title>
	
	<link rel="stylesheet" type="text/css" href="style.css">
	<script src="scripts/jquery-2.1.1.min.js"></script>
	<script> var $j = jQuery.noConflict(); </script> <!--  fix conflict -->
	<script src="scripts/prototype.js"></script>

	<script src="ace-builds/src-noconflict/ace.js" type="text/javascript" charset="utf-8"></script>
	<script src="scripts/ltx/Lexer.js"></script>
	<script src="scripts/ltx/Reader.js"></script>
	<script src="scripts/ltx/Tag.js"></script>
	<script src="scripts/ltx/Main.js"></script>
	
	<script src="scripts/dom/dom.js"></script>
</head>
<body>
	

	
	
	
<div id="input">
\documentclass{article}

\addbibresource{references.bib}

\author{<?=$_GET["userToken"]?>}
\title{Document title here}
\date{\today}

\begin{document}
% title page ---------------------------------------------///
	\maketitle
	\clearpage
	
% table of contents page ---------------------------------///
	\tableofcontents
	\clearpage
	\listoffigures
	\listoftables
	\clearpage
	

Some Example Text Here :D
	
\end{document}
</div>
<div id="document">
<div id="documenteditor"></div>
</div>
<div id="document-controls">
<button id="convert">convert</button>
<button id="bold">bold</button>
<button id="unbold">unbold</button><br/>
Table: 
<button id="addtable">InsertTable</button>
<button id="addrow">Insert Row</button>
<button id="addcolumn">Insert Column</button>
<button id="toggleborder">Toggle Border</button>
</div>

</body>
</html>
