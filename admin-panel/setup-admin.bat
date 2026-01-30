@echo off
echo Setting up admin panel...

echo Replacing App.js...
(
echo import React from 'react';
echo import './App.css';
echo 
echo function App() {
echo   return (
echo     ^<div className="App"^>
echo       ^<div className="admin-header"^>
echo         ^<h1^>Admin Dashboard^</h1^>
echo         ^<p^>Welcome to the Admin Panel^</p^>
echo       ^</div^>
echo       
echo       ^<div className="admin-stats"^>
echo         ^<div className="stat-card"^>
echo           ^<h3^>Total Users^</h3^>
echo           ^<div className="stat-value"^>1,234^</div^>
echo         ^</div^>
echo         ^<div className="stat-card"^>
echo           ^<h3^>Active Trades^</h3^>
echo           ^<div className="stat-value"^>567^</div^>
echo         ^</div^>
echo         ^<div className="stat-card"^>
echo           ^<h3^>Revenue Today^</h3^>
echo           ^<div className="stat-value"^>^$12,345^</div^>
echo         ^</div^>
echo       ^</div^>
echo       
echo       ^<div className="admin-content"^>
echo         ^<p^>Admin panel is working! You can now add your admin features here.^</p^>
echo       ^</div^>
echo     ^</div^>
echo   );
echo }
echo 
echo export default App;
) > src\App.js

echo Replacing App.css...
(
echo .App {
echo   min-height: 100vh;
echo   background: #0f172a;
echo   color: #e2e8f0;
echo   padding: 2rem;
echo }
echo 
echo .admin-header {
echo   text-align: center;
echo   margin-bottom: 3rem;
echo }
echo 
echo .admin-header h1 {
echo   font-size: 2.5rem;
echo   color: #6366f1;
echo   margin-bottom: 0.5rem;
echo }
echo 
echo .admin-header p {
echo   color: #94a3b8;
echo   font-size: 1.1rem;
echo }
echo 
echo .admin-stats {
echo   display: grid;
echo   grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
echo   gap: 1.5rem;
echo   margin-bottom: 3rem;
echo }
echo 
echo .stat-card {
echo   background: #1e293b;
echo   border-radius: 12px;
echo   padding: 1.5rem;
echo   border: 1px solid #334155;
echo   text-align: center;
echo   transition: transform 0.2s;
echo }
echo 
echo .stat-card:hover {
echo   transform: translateY(-5px);
echo   border-color: #6366f1;
echo }
echo 
echo .stat-card h3 {
echo   color: #94a3b8;
echo   margin-bottom: 1rem;
echo   font-size: 1rem;
echo }
echo 
echo .stat-value {
echo   font-size: 2rem;
echo   font-weight: 700;
echo   color: #10b981;
echo }
echo 
echo .admin-content {
echo   background: #1e293b;
echo   border-radius: 12px;
echo   padding: 2rem;
echo   border: 1px solid #334155;
echo }
echo 
echo .admin-content p {
echo   color: #cbd5e1;
echo   font-size: 1.1rem;
echo }
echo 
echo @media (max-width: 768px) {
echo   .App {
echo     padding: 1rem;
echo   }
echo   
echo   .admin-stats {
echo     grid-template-columns: 1fr;
echo   }
echo }
) > src\App.css

echo.
echo ✅ Admin panel setup complete!
echo.
echo The page should automatically reload with your admin dashboard.
echo If not, refresh the browser or restart with: npm start
echo.
pause