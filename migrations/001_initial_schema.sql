-- Initial TripChat Database Schema
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'TripChatDB')
BEGIN
  CREATE DATABASE TripChatDB;
END
GO

USE TripChatDB;
GO

BEGIN TRY
BEGIN TRAN;

-- ===============================================
-- CREATE TABLES
-- ===============================================

-- UserRole enum - Defines user roles in the system
CREATE TABLE [dbo].[Roles] (
    [roleId] INT IDENTITY(1,1) PRIMARY KEY,
    [roleName] NVARCHAR(50) NOT NULL UNIQUE
);

-- Insert default roles into Roles table
INSERT INTO [dbo].[Roles] (RoleName) VALUES
('SUPER_ADMIN'),
('ADMIN'),
('MODERATOR'),
('EDITOR'),
('AUTHOR'),
('MEMBER'),
('GUEST');

-- User table - Core user information
CREATE TABLE [dbo].[User] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [username] NVARCHAR(100) NOT NULL,
    [email] NVARCHAR(255) NOT NULL UNIQUE,
    [password] NVARCHAR(255) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [User_isActive_df] DEFAULT 1,
    [roleId] INT NOT NULL CONSTRAINT [User_RoleId_df] DEFAULT 6, 
    [createdAt] DATETIME NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME NOT NULL CONSTRAINT [User_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [lastLogin] DATETIME NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [User_roleId_fkey] FOREIGN KEY (roleId) REFERENCES [dbo].[Roles] (roleId)
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION
);

-- Room table - Chat rooms for trips
CREATE TABLE [dbo].[Room] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [name] NVARCHAR(255) NOT NULL,
    [type] NVARCHAR(50) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [Room_isActive_df] DEFAULT 1,
    [createdAt] DATETIME NOT NULL CONSTRAINT [Room_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [Room_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- RoomParticipant table - Many-to-many relationship between users and rooms
CREATE TABLE [dbo].[RoomParticipant] (
    [roomId] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [joinedAt] DATETIME NOT NULL CONSTRAINT [RoomParticipant_joinedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [isHost] BIT NOT NULL CONSTRAINT [RoomParticipant_isHost_df] DEFAULT 0,
    CONSTRAINT [RoomParticipant_pkey] PRIMARY KEY CLUSTERED ([roomId],[userId])
);

-- Message table - Public messages in rooms
CREATE TABLE [dbo].[Message] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [roomId] UNIQUEIDENTIFIER NOT NULL,
    [senderId] UNIQUEIDENTIFIER NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [sentAt] DATETIME NOT NULL CONSTRAINT [Message_sentAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Message_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- PrivateChat table - Direct messages between users
CREATE TABLE [dbo].[PrivateChat] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [senderId] UNIQUEIDENTIFIER NOT NULL,
    [receiverId] UNIQUEIDENTIFIER NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [sentAt] DATETIME NOT NULL CONSTRAINT [PrivateChat_sentAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PrivateChat_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- TripPlan table - Trip planning information
CREATE TABLE [dbo].[TripPlan] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [roomId] UNIQUEIDENTIFIER NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [startDate] DATE NOT NULL,
    [endDate] DATE NOT NULL,
    [createdBy] UNIQUEIDENTIFIER NOT NULL,
    [createdAt] DATETIME NOT NULL CONSTRAINT [TripPlan_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [TripPlan_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- TripParticipant table - Trip plan participants
CREATE TABLE [dbo].[TripParticipant] (
    [planId] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [confirmed] BIT NOT NULL CONSTRAINT [TripParticipant_confirmed_df] DEFAULT 0,
    CONSTRAINT [TripParticipant_pkey] PRIMARY KEY CLUSTERED ([planId],[userId])
);

-- Expense table - Trip expenses tracking
CREATE TABLE [dbo].[Expense] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [planId] UNIQUEIDENTIFIER NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [amount] DECIMAL(10,2) NOT NULL,
    [paidBy] UNIQUEIDENTIFIER NOT NULL,
    [createdAt] DATETIME NOT NULL CONSTRAINT [Expense_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Expense_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- ExpenseShare table - How expenses are split between participants
CREATE TABLE [dbo].[ExpenseShare] (
    [expenseId] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [amount] DECIMAL(10,2) NOT NULL,
    CONSTRAINT [ExpenseShare_pkey] PRIMARY KEY CLUSTERED ([expenseId],[userId])
);

-- ===============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- User indexes
CREATE NONCLUSTERED INDEX [User_email_idx] ON [dbo].[User]([email]);
CREATE NONCLUSTERED INDEX [User_username_idx] ON [dbo].[User]([username]);

-- Room indexes
CREATE NONCLUSTERED INDEX [Room_createdBy_idx] ON [dbo].[Room]([createdBy]);
CREATE NONCLUSTERED INDEX [Room_type_idx] ON [dbo].[Room]([type]);

-- RoomParticipant indexes
CREATE NONCLUSTERED INDEX [RoomParticipant_roomId_idx] ON [dbo].[RoomParticipant]([roomId]);
CREATE NONCLUSTERED INDEX [RoomParticipant_userId_idx] ON [dbo].[RoomParticipant]([userId]);

-- Message indexes
CREATE NONCLUSTERED INDEX [Message_roomId_idx] ON [dbo].[Message]([roomId]);
CREATE NONCLUSTERED INDEX [Message_senderId_idx] ON [dbo].[Message]([senderId]);
CREATE NONCLUSTERED INDEX [Message_sentAt_idx] ON [dbo].[Message]([sentAt]);

-- PrivateChat indexes
CREATE NONCLUSTERED INDEX [PrivateChat_senderId_idx] ON [dbo].[PrivateChat]([senderId]);
CREATE NONCLUSTERED INDEX [PrivateChat_receiverId_idx] ON [dbo].[PrivateChat]([receiverId]);
CREATE NONCLUSTERED INDEX [PrivateChat_sentAt_idx] ON [dbo].[PrivateChat]([sentAt]);

-- TripPlan indexes
CREATE NONCLUSTERED INDEX [TripPlan_roomId_idx] ON [dbo].[TripPlan]([roomId]);
CREATE NONCLUSTERED INDEX [TripPlan_createdBy_idx] ON [dbo].[TripPlan]([createdBy]);
CREATE NONCLUSTERED INDEX [TripPlan_startDate_idx] ON [dbo].[TripPlan]([startDate]);

-- TripParticipant indexes
CREATE NONCLUSTERED INDEX [TripParticipant_planId_idx] ON [dbo].[TripParticipant]([planId]);
CREATE NONCLUSTERED INDEX [TripParticipant_userId_idx] ON [dbo].[TripParticipant]([userId]);

-- Expense indexes
CREATE NONCLUSTERED INDEX [Expense_planId_idx] ON [dbo].[Expense]([planId]);
CREATE NONCLUSTERED INDEX [Expense_paidBy_idx] ON [dbo].[Expense]([paidBy]);
CREATE NONCLUSTERED INDEX [Expense_createdAt_idx] ON [dbo].[Expense]([createdAt]);

-- ExpenseShare indexes
CREATE NONCLUSTERED INDEX [ExpenseShare_expenseId_idx] ON [dbo].[ExpenseShare]([expenseId]);
CREATE NONCLUSTERED INDEX [ExpenseShare_userId_idx] ON [dbo].[ExpenseShare]([userId]);

-- ===============================================
-- CREATE FOREIGN KEY CONSTRAINTS
-- ===============================================

-- Room foreign keys
ALTER TABLE [dbo].[Room] ADD CONSTRAINT [Room_createdBy_fkey] 
    FOREIGN KEY ([createdBy]) REFERENCES [dbo].[User]([id]) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- RoomParticipant foreign keys
ALTER TABLE [dbo].[RoomParticipant] ADD CONSTRAINT [RoomParticipant_roomId_fkey] 
    FOREIGN KEY ([roomId]) REFERENCES [dbo].[Room]([id]) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [dbo].[RoomParticipant] ADD CONSTRAINT [RoomParticipant_userId_fkey] 
    FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) 
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Message foreign keys
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_roomId_fkey] 
    FOREIGN KEY ([roomId]) REFERENCES [dbo].[Room]([id]) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_senderId_fkey] 
    FOREIGN KEY ([senderId]) REFERENCES [dbo].[User]([id]) 
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- PrivateChat foreign keys
ALTER TABLE [dbo].[PrivateChat] ADD CONSTRAINT [PrivateChat_senderId_fkey] 
    FOREIGN KEY ([senderId]) REFERENCES [dbo].[User]([id]) 
    ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [dbo].[PrivateChat] ADD CONSTRAINT [PrivateChat_receiverId_fkey] 
    FOREIGN KEY ([receiverId]) REFERENCES [dbo].[User]([id]) 
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- TripPlan foreign keys
ALTER TABLE [dbo].[TripPlan] ADD CONSTRAINT [TripPlan_roomId_fkey] 
    FOREIGN KEY ([roomId]) REFERENCES [dbo].[Room]([id]) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [dbo].[TripPlan] ADD CONSTRAINT [TripPlan_createdBy_fkey] 
    FOREIGN KEY ([createdBy]) REFERENCES [dbo].[User]([id]) 
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- TripParticipant foreign keys
ALTER TABLE [dbo].[TripParticipant] ADD CONSTRAINT [TripParticipant_planId_fkey] 
    FOREIGN KEY ([planId]) REFERENCES [dbo].[TripPlan]([id]) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [dbo].[TripParticipant] ADD CONSTRAINT [TripParticipant_userId_fkey] 
    FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) 
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Expense foreign keys
ALTER TABLE [dbo].[Expense] ADD CONSTRAINT [Expense_planId_fkey] 
    FOREIGN KEY ([planId]) REFERENCES [dbo].[TripPlan]([id]) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [dbo].[Expense] ADD CONSTRAINT [Expense_paidBy_fkey] 
    FOREIGN KEY ([paidBy]) REFERENCES [dbo].[User]([id]) 
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ExpenseShare foreign keys
ALTER TABLE [dbo].[ExpenseShare] ADD CONSTRAINT [ExpenseShare_expenseId_fkey] 
    FOREIGN KEY ([expenseId]) REFERENCES [dbo].[Expense]([id]) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [dbo].[ExpenseShare] ADD CONSTRAINT [ExpenseShare_userId_fkey] 
    FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) 
    ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;
PRINT 'TripChat database schema created successfully';

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRAN;
    END;
    
    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();
    
    PRINT 'Error creating TripChat database schema: ' + @ErrorMessage;
    RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
END CATCH
