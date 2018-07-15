#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
Menu, Tray, Icon, icon.ico
menu, tray, NoStandard

Menu, tray, add, Settings, ChangeSettings
Menu, tray, add, Quit, Quit

IniRead, username, %A_WorkingDir%\prefs.ini, prefs, username
IniRead, userRegion, %A_WorkingDir%\prefs.ini, prefs, region

if (username = "ERROR") {
	Gui, New
	Gui, Add, Text,, Username:
	Gui, Add, Edit, vusername
	Gui, Add, Text,, Region:
	Gui, Add, DropdownList,vRegion,NA||EUW|EUNE|BR|TR|RU|LAN|LAS|OCE|KR|JP
	Gui, Add, Text,, Run With Windows:
	Gui, Add, Checkbox, Checked vRunWithWindows,
	Gui, Add, Text,, 
	Gui, Add, Button, w120 Default gOK, OK
	Gui, Show
	return
	GuiClose:
	ExitApp
	OK:
	Gui, Submit

	if (Region = "NA") {
		Region := "na1"
	}
	if (Region = "EUW") {
		Region := "euw1"
	}
	if (Region = "EUNE") {
		Region := "eun1"
	}
	if (Region = "BR") {
		Region := "br1"
	}
	if (Region = "TR") {
		Region := "tr1"
	}
	if (Region = "RU") {
		Region := "ru"
	}
	if (Region = "LAN") {
		Region := "la1"
	}
	if (Region = "LAS") {
		Region := "la2"
	}
	if (Region = "OCE") {
		Region := "oc1"
	}
	if (Region = "KR") {
		Region := "kr"
	}
	if (Region = "JP") {
		Region := "jp1"
	}

	if (RunWithWindows = "1") {
		FileCreateShortcut, "%A_ScriptFullPath%", %A_Startup%\Tiltseeker.lnk
	}
	
	userRegion := %Region%
	IniWrite, %username%, %A_WorkingDir%\prefs.ini, prefs, username
	IniWrite, %Region%, %A_WorkingDir%\prefs.ini, prefs, region

	return
}



if (username = "ERROR") {
	MsgBox, derp
	ExitApp
}


InGame = 0

if (username != "ERROR") {
	Process, Exist, League of Legends.exe
	If errorLevel {
		Run, https://tiltseeker.com/tiltseek.html?username=%username%&region=%userRegion%&fromApp=true
		InGame = 1
	}
}

SetTimer, OneSecLoop, 1000

OneSecLoop:
if (username != "ERROR") {
	Process, Exist, League of Legends.exe
	If errorLevel && InGame = 0 {
		Run, https://tiltseeker.com/tiltseek.html?username=%username%&region=%userRegion%&fromApp=true
		InGame = 1
	}

	If !errorLevel && InGame = 1 {
		InGame = 0
	}
}
return


ChangeSettings:
	IniDelete, %A_WorkingDir%\prefs.ini, prefs, username
	IniDelete, %A_WorkingDir%\prefs.ini, prefs, region
	Reload
return

Quit:
	ExitApp
return
