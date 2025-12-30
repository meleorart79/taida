<?xml version="1.0" ?>
<!--
	Copyright (c) by Hugo Leisink <hugo@leisink.net>
	This file is part of the Orb web desktop
	https://gitlab.com/hsleisink/orb

	Licensed under the GPLv2 License
-->
<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" doctype-system="about:legacy-compat" />

<xsl:template match="/output">
<html lang="en">

<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<meta name="generator" content="File" />
<link rel="apple-touch-icon" href="/images/taidasansfond.png" />
<link rel="icon" href="/images/taidasansfond.png" />
<link rel="shortcut icon" href="/images/taidasansfond.png" />
<title><xsl:value-of select="@title" /></title>
<xsl:for-each select="styles/style">
<link rel="stylesheet" type="text/css" href="{.}" />
</xsl:for-each>
<xsl:for-each select="javascripts/javascript">
<script type="text/javascript" src="{.}" /><xsl:text>
</xsl:text></xsl:for-each>
</head>

<body class="login">
<div class="content notification">
<h1>Taida</h1>
<div class="form-group">
<label for="username">Username:</label>
<input type="text" id="username" name="username" value="{username}" autocapitalize="off" autocorrect="off" class="form-control" />
</div>
<div class="form-group">
<label for="password">Password:</label>
<input type="password" id="password" name="password" class="form-control" />
</div>

<div class="btn-group">
<button class="btn btn-default">Login</button>
</div>

<div class="source"><a href="https://gitlab.com/hsleisink/taida" target="_blank">Source</a></div>
</div>
</body>

</html>
</xsl:template>

</xsl:stylesheet>
