-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('operator', 'admin') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Action` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `turbineId` INTEGER NOT NULL,
    `type` ENUM('control', 'start', 'shutdown', 'maintenance') NOT NULL,
    `pitch` INTEGER NULL,
    `yaw` INTEGER NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user` VARCHAR(191) NOT NULL,

    INDEX `Action_turbineId_timestamp_idx`(`turbineId`, `timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alert` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `turbineId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` ENUM('firing', 'resolved') NOT NULL,
    `acknowledged` ENUM('acknowledged', 'unacknowledged') NOT NULL DEFAULT 'unacknowledged',
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Alert_turbineId_type_key`(`turbineId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `turbineId` INTEGER NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `level` ENUM('info', 'warning', 'error') NOT NULL,
    `message` TEXT NOT NULL,

    INDEX `LogEntry_turbineId_timestamp_idx`(`turbineId`, `timestamp`),
    UNIQUE INDEX `LogEntry_turbineId_timestamp_message_key`(`turbineId`, `timestamp`, `message`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TurbineCache` (
    `turbineId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `locationLat` DOUBLE NOT NULL,
    `locationLng` DOUBLE NOT NULL,
    `data` JSON NOT NULL,
    `propsUpdated` JSON NOT NULL,
    `overallUpdated` DATETIME(3) NOT NULL,

    PRIMARY KEY (`turbineId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
