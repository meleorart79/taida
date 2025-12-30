<?xml version="1.0" ?>
<!--
	Copyright (c) by Hugo Leisink <hugo@leisink.net>
	This file is part of the Taida web desktop
	https://gitlab.com/hsleisink/taida

	Licensed under the GPLv2 License
-->
<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" doctype-system="about:legacy-compat" />

<!-- Desktop -->
<xsl:template match="desktop">
<div class="desktop" version="{../@version}" path="{@path}" username="{../login/username}" debug="{../@debug}" mobile="{@mobile}" login="{../login/method}" timeout="{../login/timeout}" editor="{@editor}" read_only="{@readonly}" counter="{@counter}">
	<div class="windows"></div>
	<div class="icons"></div>
	<div class="taskbar">
		<div class="start btn btn-primary btn-sm"></div>
		<div class="startmenu">
			<div class="system"></div>
			<div class="applications"></div>
		</div>
		<div class="tasks"></div>
		<div class="clock"></div>
	</div>
	<div id="sleep-screen">
		<video autoplay="autoplay" muted="muted" loop="loop" id="idle-video">
			<source src="/images/idle_background.webm" type="video/webm" />
		</video>
	</div>
</div>
</xsl:template>

<!-- Error -->
<xsl:template match="error">
<script type="text/javascript">
taida_alert('<xsl:value-of select="." />', 'Taida error');
</script>
</xsl:template>

<!-- Output -->
<xsl:template match="/output">
<html lang="en">

<head>
<meta name="viewport" content="width=device-width, initial-scale={desktop/@zoom}, maximum-scale={desktop/@zoom}" />
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
<script src="https://www.instagram.com/embed.js" async="async"></script>
</head>

<body>
<xsl:apply-templates select="desktop" />
<xsl:apply-templates select="error" />
</body>

</html>
</xsl:template>

</xsl:stylesheet>
