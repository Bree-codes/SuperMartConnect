# Supermarket Distributed Web App

## Overview
A web application for a supermarket chain with branches in Kisumu, Mombasa, Nakuru, and Eldoret.

## Features
- **Authentication**: Role-based login (Admin/Customer).
- **Customer**: Browse products, stock check, purchase simulation (MPesa).
- **Admin**: Inventory management, restocking, sales reporting.

## Tech Details
- **Frontend**: React + TailwindCSS
- **Data**: 
  - **Cloud Mode**: Trickle Database (simulating distributed MariaDB) when deployed on Trickle.
  - **Local Mode**: Browser LocalStorage when running locally on your machine.
- **Charts**: Chart.js for reports

## How to Run Locally (On your IDE)
1. Download all the files (`.html`, `.js`, `.css`) to a folder on your computer.
2. Ensure you have the folder structure:
   - Root folder
     - `index.html`
     - `dashboard.html`
     - `app.js`
     - `dashboard-app.js`
     - `utils/`
       - `db.js`
     - `components/`
       - `AuthForms.js`
       - `Layout.js`
       - `CustomerView.js`
       - `AdminView.js`
3. Open `index.html` in your browser (or use a simple server like Live Server in VS Code).
4. The app will automatically detect it's running locally and use **LocalStorage** instead of the cloud database.
5. Default Local Credentials:
   - **Admin**: username: `admin`, password: `123`
   - **Customer**: username: `user`, password: `123`

## Maintenance
- Check this README for updates whenever major features are added.