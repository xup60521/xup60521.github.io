set folderpath=%~dp0
cd %folderpath%
git add .
set /p comment="input commit comment: "
git commit -m "%comment%"
git push -u origin main
pause
