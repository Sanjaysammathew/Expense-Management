
-- DATABASE : Claimly Expense Management
-- SQL Server


CREATE DATABASE ClaimlyDB;
GO

USE ClaimlyDB;
GO


-- USERS TABLE

CREATE TABLE Users
(
    UserId INT IDENTITY(1,1) PRIMARY KEY,

    EmployeeId VARCHAR(20) NOT NULL UNIQUE,

    FullName VARCHAR(100) NOT NULL,

    Email VARCHAR(100) NOT NULL UNIQUE,

    PasswordHash VARCHAR(255) NOT NULL,

    DOB DATE NOT NULL,

    Department VARCHAR(50) NOT NULL,

    Designation VARCHAR(100) NOT NULL,

    Gender VARCHAR(10)
        CHECK (Gender IN ('Male','Female','Other')),

    Role VARCHAR(20)
        CHECK (Role IN ('Admin','Employee')),

    CreatedAt DATETIME DEFAULT GETDATE()
);
GO


-- EXPENSES TABLE


CREATE TABLE Expenses
(
    ExpenseId INT IDENTITY(1,1) PRIMARY KEY,

    EmployeeId VARCHAR(20) NOT NULL,

    EmployeeName VARCHAR(100) NOT NULL,

    Department VARCHAR(50) NOT NULL,

    Title VARCHAR(150) NOT NULL,

    Category VARCHAR(50) NOT NULL
        CHECK (Category IN ('Travel','Meals','Equipment')),

    Amount DECIMAL(10,2)
        CHECK (Amount > 0),

    ExpenseDate DATE NOT NULL,

    Description VARCHAR(500),

    Status VARCHAR(20)
        DEFAULT 'Pending'
        CHECK (Status IN ('Pending','Completed','Rejected')),

    IsDeleted BIT DEFAULT 0,

    Remark VARCHAR(500),

    ApprovedBy VARCHAR(100),

    DecisionDate DATETIME,

    CreatedAt DATETIME DEFAULT GETDATE(),

    UpdatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Expense_User
        FOREIGN KEY(EmployeeId)
        REFERENCES Users(EmployeeId)
);
GO


-- INDEXES


CREATE INDEX IX_EmployeeId
ON Expenses(EmployeeId);

CREATE INDEX IX_Status
ON Expenses(Status);

CREATE INDEX IX_ExpenseDate
ON Expenses(ExpenseDate);

CREATE INDEX IX_IsDeleted
ON Expenses(IsDeleted);

CREATE INDEX IX_Category
ON Expenses(Category);
GO


-- VIEWS
-- CREATE VIEWS AFTER TABLES & INDEXES


CREATE VIEW vw_ActiveExpenses
AS
SELECT *
FROM Expenses
WHERE IsDeleted = 0;
GO

CREATE VIEW vw_CompletedExpenses
AS
SELECT *
FROM Expenses
WHERE Status='Completed'
AND IsDeleted=0;
GO

CREATE VIEW vw_PendingExpenses
AS
SELECT *
FROM Expenses
WHERE Status='Pending'
AND IsDeleted=0;
GO

CREATE VIEW vw_RejectedExpenses
AS
SELECT *
FROM Expenses
WHERE Status='Rejected'
AND IsDeleted=0;
GO

CREATE VIEW vw_DashboardSummary
AS
SELECT
    COUNT(*) AS TotalExpenses,

    SUM(CASE
            WHEN Status='Completed'
            THEN 1
            ELSE 0
        END) AS CompletedExpenses,

    SUM(CASE
            WHEN Status='Pending'
            THEN 1
            ELSE 0
        END) AS PendingExpenses,

    SUM(CASE
            WHEN Status='Rejected'
            THEN 1
            ELSE 0
        END) AS RejectedExpenses

FROM Expenses
WHERE IsDeleted=0;
GO


-- INSERT SAMPLE USERS


INSERT INTO Users
(
EmployeeId,
FullName,
Email,
PasswordHash,
DOB,
Department,
Designation,
Gender,
Role
)
VALUES
('101','Sanjay Sam Mathew','Sanjay05@gmail.com','Sanjay@2005','2004-07-20','HR','Software Engineer','Male','Employee'),
('102','Monisha','monisha05@gmail.com','Monisha@05','2004-06-16','IT','Manager','Female','Admin'),
('103','Rohan','Rohan05@gmail.com','Rohan@2005','2001-07-20','IT','Manager','Male','Admin');
GO


-- INSERT SAMPLE EXPENSE


INSERT INTO Expenses
(
EmployeeId,
EmployeeName,
Department,
Title,
Category,
Amount,
ExpenseDate,
Description,
Status,
Remark,
ApprovedBy
)
VALUES
(
'101',
'Sanjay Sam Mathew',
'HR',
'Travel To Japan',
'Travel',
2000,
'2025-05-14',
'Business Conference',
'Completed',
'Approved',
'Monisha'
);
GO

-- CRUD OPERATIONS

-- CREATE

INSERT INTO Expenses
(
EmployeeId,
EmployeeName,
Department,
Title,
Category,
Amount,
ExpenseDate,
Description
)
VALUES
(
'101',
'Sanjay Sam Mathew',
'HR',
'Hotel Expense',
'Travel',
3500,
GETDATE(),
'Accommodation Charges'
);

-- READ

SELECT * FROM vw_ActiveExpenses;

-- UPDATE

UPDATE Expenses
SET
Title='Updated Hotel Expense',
Amount=5000,
UpdatedAt=GETDATE()
WHERE ExpenseId=1
AND Status='Pending';

-- SOFT DELETE

UPDATE Expenses
SET
IsDeleted=1
WHERE ExpenseId=1;

-- RESTORE

UPDATE Expenses
SET
IsDeleted=0
WHERE ExpenseId=1;

-- APPROVE

UPDATE Expenses
SET
Status='Completed',
Remark='Approved Successfully',
ApprovedBy='Monisha',
DecisionDate=GETDATE()
WHERE ExpenseId=1;

-- REJECT

UPDATE Expenses
SET
Status='Rejected',
Remark='Invoice Missing',
ApprovedBy='Monisha',
DecisionDate=GETDATE()
WHERE ExpenseId=1;


-- FILTERS USING VIEWS


SELECT * FROM vw_CompletedExpenses;

SELECT * FROM vw_PendingExpenses;

SELECT * FROM vw_RejectedExpenses;

SELECT * FROM vw_DashboardSummary;

-- Search

SELECT *
FROM vw_ActiveExpenses
WHERE Title LIKE '%Travel%';

-- Date Filter

SELECT *
FROM vw_ActiveExpenses
WHERE ExpenseDate BETWEEN
'2026-06-01' AND '2026-06-30';