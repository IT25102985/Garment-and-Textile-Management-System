# StitchWork — Textile and Garment Management System

StitchWork is a web application for managing a garment business. It brings employees, suppliers, garment designs, production, inventory, and customer orders into one system.

## Main features

- Employee records, attendance, payroll, and user roles
- Suppliers, raw materials, and purchase orders
- Garment products, sizes, colours, and bills of materials
- Production orders, tasks, and quality control
- Warehouse locations and stock movements
- Customers, sales orders, invoices, and delivery tracking

Built with **React, Spring Boot, and MySQL**.

## Project purpose

This project was developed for the **SE2030 Software Engineering** module. It provides a central place to manage the main activities of a textile and garment business, replacing separate paper records and spreadsheets with connected modules.

Suppliers provide raw materials, designers define garments and their material requirements, production staff manufacture garments, inventory staff record stock movements, and sales staff handle customer orders. HR manages employee information and access to the system.

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React, Vite, React Router |
| Styling and UI | Tailwind CSS, Bootstrap, Radix UI |
| API communication | Axios, TanStack Query |
| Backend | Java 17, Spring Boot 3.3.2 |
| Persistence | Spring Data JPA, Hibernate, MySQL |
| Authentication | Spring Security, JWT, password hashing |
| Build tools | npm, Maven |

Dependency versions are recorded in `frontend/package.json`, `frontend/package-lock.json`, and `backend/pom.xml`.

## Project structure

```text
Your-Repository/
├── README.md
├── .gitignore
└── StitchWorks/
    ├── backend/
    │   ├── pom.xml
    │   └── src/main/
    │       ├── java/com/stitchworks/
    │       │   ├── StitchworksApplication.java
    │       │   ├── config/
    │       │   ├── shared/
    │       │   ├── admin/
    │       │   ├── hr/
    │       │   ├── purchasing/
    │       │   ├── product/
    │       │   ├── production/
    │       │   ├── inventory/
    │       │   └── sales/
    │       └── resources/
    │           └── application.properties
    └── frontend/
        ├── package.json
        ├── package-lock.json
        ├── vite.config.js
        ├── index.html
        ├── public/images/
        └── src/
            ├── App.jsx
            ├── main.jsx
            ├── assets/landpage/
            ├── components/
            ├── context/
            ├── pages/
            ├── services/
            └── lib/
```

The backend separates controllers, services, repositories, models, and DTOs by module. The frontend separates pages, reusable components, application contexts, and API services. Some garment-design pages are located inside `frontend/src/pages/production/`.

## Requirements

- Git
- Java 17 and Maven
- Node.js 22.12 or later in the Node 22 series, or a compatible newer version, with npm
- MySQL 8

## 1. Clone the project

Replace the placeholders with this repository's owner and name:

```bash
git clone https://github.com/IT25102985/Garment-and-Textile-Management-System.git
cd YOUR-REPOSITORY/StitchWorks
```

The commands below run from `YOUR-REPOSITORY/StitchWorks/`, where `backend/` and `frontend/` are located. The README stays in the repository root.

## 2. Set up the database

Start MySQL and run:

```sql
CREATE DATABASE IF NOT EXISTS stitchworks_db;
```

The backend creates the tables automatically when it starts.

## 3. Run the backend

From the application folder (`StitchWorks/`), open **PowerShell** and run:

```powershell
$env:SPRING_DATASOURCE_USERNAME = 'root'
$env:SPRING_DATASOURCE_PASSWORD = 'YOUR_MYSQL_PASSWORD'
$env:JWT_SECRET = 'YOUR_RANDOM_SECRET_AT_LEAST_32_CHARACTERS'
cd backend
mvn spring-boot:run
```

Replace the password and secret with your own values. Use a random secret of at least 32 ASCII characters and keep it the same between runs. These settings apply to the current terminal; set them again in a new terminal.

The default database connection is `localhost:3306/stitchworks_db`. The backend runs at `http://localhost:8080`. Keep this terminal open.

## 4. Run the frontend

Open a **second terminal** inside the application folder (`StitchWorks/`):

```bash
cd frontend
npm ci
npm run dev
```

Open **http://localhost:5173** in your browser. Keep both terminals running.

## Development administrator

The backend creates this account on a fresh database:

- Login page: `http://localhost:5173/admin/login`
- Email: `admin@stitchworks.com`
- Password: `admin123`

Change the default password before deployment.

## Uploaded files

The backend automatically creates an `uploads/` folder and saves new uploads there. Git ignores this folder, so existing uploaded files do not come with a clone. To restore existing records and their images, restore both the matching database and uploaded files. Permanent website images are included in the frontend source.

## Build the project

From the application folder (`StitchWorks/`):

```bash
cd frontend
npm run build
cd ../backend
mvn package
```

Build only after all six members' files are present in the repository.

The frontend build generates `backend/src/main/resources/static/`. Maven includes those generated files in the backend application. From `backend/`, you can start the packaged application in PowerShell with:

```powershell
$appJar = Get-ChildItem target -Filter '*.jar' | Select-Object -First 1
java -jar $appJar.FullName
```

Set the database credentials and JWT secret in that terminal first. The combined application is available at `http://localhost:8080/`.

## Configuration reference

| Setting | Purpose | Default / requirement |
|---|---|---|
| `SPRING_DATASOURCE_URL` | MySQL connection URL | Local MySQL on port 3306, database `stitchworks_db` |
| `SPRING_DATASOURCE_USERNAME` | MySQL username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | MySQL password | Required environment variable |
| `JWT_SECRET` | Signs authentication tokens | Required; at least 32 ASCII characters |
| Backend port | Spring Boot server | 8080 |
| Frontend development port | Vite development server | 5173 |

To use a different database server, set the URL before starting the backend:

```powershell
$env:SPRING_DATASOURCE_URL = 'jdbc:mysql://localhost:3306/stitchworks_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
```

The example is for local development. The application does not automatically load a root `.env` file; set backend variables in the terminal or your IDE's run configuration. Update the frontend API settings if you change the backend address or port.

## Checks and testing

Run the frontend linter from `frontend/`:

```bash
npm run lint
```

Run Maven's test phase from `backend/`:

```bash
mvn test
```

These commands do not establish complete test coverage. Optional manual PowerShell test scripts are excluded from this minimal source upload.

After starting both servers, check administrator login, access permissions, and the main module workflows using development data. For an integration check, create the required supplier/material and product records, then check stock changes through a sales and production workflow. A fresh clone and database do not include the original demonstration records.

## Troubleshooting

| Problem | What to check |
|---|---|
| `mvn`, `java`, or `npm` is not recognised | Install the required tool and check that it is on PATH. Reopen the terminal. |
| MySQL connection refused | Start MySQL and check its host and port. |
| Access denied by MySQL | Check the username, password, and database permissions. |
| Missing password or JWT configuration | Set the required environment variables in the same terminal that starts the backend. |
| JWT key is too short | Use a random secret of at least 32 ASCII characters. |
| Port 8080 or 5173 is already used | Stop the conflicting application or change ports and corresponding frontend settings. |
| Browser reports a CORS error | Check the backend CORS settings. The current `CorsConfig.java` lists `http://localhost:3000`; align it and other security CORS settings with the actual frontend origin, normally `http://localhost:5173`. |
| Existing uploaded images are missing | Restore the matching uploads directory and database records. |
| Frontend imports cannot be found | Make sure all six members' files were merged with their original relative paths. |
| Backend serves a missing homepage | Build the frontend before packaging the backend. |

## Team members

Responsibilities follow the project proposal.

| Member | Student ID | Main responsibility |
|---|---|---|
| Abhishek K.D.K | IT25102039 | HR, employee data and automated payroll |
| Mohammed M.H.S | IT25201066 | Suppliers and raw materials |
| Dissanayake D.M.C.D | IT25101181 | Garment products and designs |
| Maleesha K.P.T | IT25102185 | Production management |
| Perera G.A.S.I | IT25200639 | Inventory and warehouse management |
| Jayasundara J.M.B.P | IT25102985 | Sales and customer orders |

## Contributing

Create a branch for your changes, keep files in their existing module folders, and use a commit message that describes the work. Open a pull request for another team member to review before merging. Coordinate changes to shared routing, authentication, database relationships, and stock workflows with the affected module owners.

Keep installed dependencies, generated builds, credentials, runtime uploads, and local IDE settings out of commits. Commit source images and dependency lockfiles. Credit existing work accurately.
