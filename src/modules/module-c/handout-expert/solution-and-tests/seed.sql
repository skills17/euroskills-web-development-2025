SET NAMES utf8;
SET
time_zone = '+00:00';
SET
foreign_key_checks = 0;
SET
sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP
DATABASE IF EXISTS `windfarm`;
CREATE
DATABASE `windfarm` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE
`windfarm`;

DROP TABLE IF EXISTS `Action`;
CREATE TABLE `Action`
(
    `id`        int                                     NOT NULL AUTO_INCREMENT,
    `turbineId` int                                     NOT NULL,
    `type`      enum('control','start','shutdown','maintenance') COLLATE utf8mb4_unicode_ci NOT NULL,
    `pitch`     int DEFAULT NULL,
    `yaw`       int DEFAULT NULL,
    `timestamp` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user`      varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
    PRIMARY KEY (`id`),
    KEY         `Action_turbineId_timestamp_idx` (`turbineId`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `Alert`;
CREATE TABLE `Alert`
(
    `id`           int                                     NOT NULL AUTO_INCREMENT,
    `turbineId`    int                                     NOT NULL,
    `type`         varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
    `status`       enum('firing','resolved') COLLATE utf8mb4_unicode_ci NOT NULL,
    `acknowledged` enum('acknowledged','unacknowledged') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unacknowledged',
    `timestamp`    datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `Alert_turbineId_type_key` (`turbineId`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `LogEntry`;
CREATE TABLE `LogEntry`
(
    `id`        int                             NOT NULL AUTO_INCREMENT,
    `turbineId` int                             NOT NULL,
    `timestamp` datetime(3) NOT NULL,
    `level`     enum('info','warning','error') COLLATE utf8mb4_unicode_ci NOT NULL,
    `message`   text COLLATE utf8mb4_unicode_ci NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `LogEntry_turbineId_timestamp_message_key` (`turbineId`,`timestamp`,`message`(191)),
    KEY         `LogEntry_turbineId_timestamp_idx` (`turbineId`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `TurbineCache`;
CREATE TABLE `TurbineCache`
(
    `turbineId`      int                                     NOT NULL,
    `name`           varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
    `locationLat` double NOT NULL,
    `locationLng` double NOT NULL,
    `data`           json                                    NOT NULL,
    `propsUpdated`   json                                    NOT NULL,
    `overallUpdated` datetime(3) NOT NULL,
    PRIMARY KEY (`turbineId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `User`;
CREATE TABLE `User`
(
    `id`           int                                     NOT NULL AUTO_INCREMENT,
    `username`     varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
    `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
    `role`         enum('operator','admin') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `createdAt`    datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `User_username_key` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `User` (`id`, `username`, `passwordHash`, `role`, `createdAt`)
VALUES (1, 'user', '$2b$10$LDnvEfprGeCnDzhqwh8EMuVe46NGOnQ5T.O1NNATfEEYkLGzyooYK', NULL, '2025-09-06 09:28:44.886'),
       (2, 'bob', '$2b$10$SXtZwadIDOex5NFoELZU1uEiKV48DWBQKNXJgi7c/94vPCC2z0BxO', 'operator',
        '2025-09-06 09:28:44.886'),
       (3, 'alice', '$2b$10$e7r48SEx/JLOn.j4.rzqKekavnl25e9yJWPUQbH9O7KM6qI0O5jyC', 'admin', '2025-09-06 09:28:44.886');

DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE `_prisma_migrations`
(
    `id`                  varchar(36) COLLATE utf8mb4_unicode_ci  NOT NULL,
    `checksum`            varchar(64) COLLATE utf8mb4_unicode_ci  NOT NULL,
    `finished_at`         datetime(3) DEFAULT NULL,
    `migration_name`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `logs`                text COLLATE utf8mb4_unicode_ci,
    `rolled_back_at`      datetime(3) DEFAULT NULL,
    `started_at`          datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`,
                                  `started_at`, `applied_steps_count`)
VALUES ('ffa451c9-6c3d-45d0-9210-979f1a502b13', 'e3bb6e967d00d31fe9a77a4133fa6d1d05295dabdfefa8dd91c22f419b9c6036',
        '2025-09-06 09:28:25.624', '20250902212308_init', NULL, NULL, '2025-09-06 09:28:25.533', 1);
