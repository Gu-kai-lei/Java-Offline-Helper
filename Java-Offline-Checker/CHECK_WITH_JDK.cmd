@echo off
setlocal
cd /d "%~dp0"
set "CHECKER_JAVA="
if defined JAVA_HOME call :tryJava "%JAVA_HOME%\bin\java.exe"
if not defined CHECKER_JAVA for /f "delims=" %%J in ('where javac 2^>nul') do if not defined CHECKER_JAVA call :tryJava "%%~dpJjava.exe"
if not defined CHECKER_JAVA for /f "delims=" %%J in ('where java 2^>nul') do if not defined CHECKER_JAVA call :tryJava "%%J"
if not defined CHECKER_JAVA (
  echo A full JDK 17+ was not found in JAVA_HOME or PATH.
  echo Set JAVA_HOME to a JDK 17+ folder, then run this launcher again.
  echo You can still double-click index.html for offline rule checks.
  pause
  exit /b 1
)
echo Starting the local checker. Keep this window open.
echo The browser will open automatically when possible. No Internet is needed.
echo Using: %CHECKER_JAVA%
if /i "%~1"=="--no-browser" (
  "%CHECKER_JAVA%" --add-modules jdk.httpserver OfflineJavaChecker.java
) else (
  "%CHECKER_JAVA%" --add-modules jdk.httpserver OfflineJavaChecker.java --open-browser
)
echo Checker stopped. If startup failed, verify that a full JDK 17+ is selected.
pause
exit /b

:tryJava
if defined CHECKER_JAVA exit /b
if not exist "%~1" exit /b
if not exist "%~dp1javac.exe" exit /b
set "CHECKER_VERSION="
set "CHECKER_MAJOR="
for /f "tokens=2" %%V in ('""%~1" --version 2^>nul"') do if not defined CHECKER_VERSION set "CHECKER_VERSION=%%V"
if not defined CHECKER_VERSION exit /b
for /f "tokens=1 delims=.-" %%M in ("%CHECKER_VERSION%") do set "CHECKER_MAJOR=%%M"
if not defined CHECKER_MAJOR exit /b
if %CHECKER_MAJOR% LSS 17 exit /b
set "CHECKER_JAVA=%~1"
exit /b
