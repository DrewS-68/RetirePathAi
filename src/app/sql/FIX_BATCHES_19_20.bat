@echo off
REM INSTANT FIX for Batches 19 & 20 (Windows)
REM Simply double-click this file or run: FIX_BATCHES_19_20.bat

echo ============================================================
echo   BATCH 19 ^& 20 JSON FIX SCRIPT
echo   Fixes: \\" -^> "
echo ============================================================
echo.

REM Check if we're in the right directory
if not exist "seed_batch_19_50_villages.sql" (
    echo WARNING: Can't find batch files in current directory!
    echo.
    echo Please run this script from the \sql directory
    echo.
    pause
    exit /b 1
)

echo Fixing Batch 19...
powershell -Command "(Get-Content 'seed_batch_19_50_villages.sql') -replace '\\\"', '\"' | Set-Content 'seed_batch_19_50_villages_CORRECTED.sql'"
if %ERRORLEVEL% EQU 0 (
    echo Created: seed_batch_19_50_villages_CORRECTED.sql
) else (
    echo ERROR fixing Batch 19
)

echo.
echo Fixing Batch 20...
powershell -Command "(Get-Content 'seed_batch_20_50_villages.sql') -replace '\\\"', '\"' | Set-Content 'seed_batch_20_50_villages_CORRECTED.sql'"
if %ERRORLEVEL% EQU 0 (
    echo Created: seed_batch_20_50_villages_CORRECTED.sql
) else (
    echo ERROR fixing Batch 20
)

echo.
echo ============================================================
echo SUCCESS! Both batches fixed!
echo.
echo You now have:
echo   * seed_batch_19_50_villages_CORRECTED.sql
echo   * seed_batch_20_50_villages_CORRECTED.sql
echo.
echo Ready to import! Your complete lineup:
echo   1. seed_batch_13_50_villages.sql -^> 555 total
echo   2. seed_batch_14_50_villages.sql -^> 605 total
echo   3. seed_batch_15_50_villages_CORRECTED.sql -^> 655 total
echo   4. seed_batch_16_50_villages_CORRECTED.sql -^> 705 total
echo   5. seed_batch_17_50_villages_CORRECTED.sql -^> 755 total
echo   6. seed_batch_18_50_villages_CORRECTED.sql -^> 805 total
echo   7. seed_batch_19_50_villages_CORRECTED.sql -^> 855 total
echo   8. seed_batch_20_50_villages_CORRECTED.sql -^> 905 total
echo.
echo Import via Supabase SQL Editor and reach 905 villages!
echo ============================================================
echo.
pause
