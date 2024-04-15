-- -------------------------------------------------------------
-- TablePlus 5.8.2(528)
--
-- https://tableplus.com/
--
-- Database: hive_multisig
-- Generation Time: 2024-04-15 11:54:37.6010
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `signature-request`;
CREATE TABLE `signature-request` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `expirationDate` datetime NOT NULL,
  `threshold` int(11) NOT NULL,
  `keyType` varchar(255) NOT NULL,
  `initiator` varchar(255) NOT NULL,
  `initiatorPublicKey` varchar(255) NOT NULL,
  `locked` tinyint(4) NOT NULL,
  `broadcasted` tinyint(4) NOT NULL,
  `createdAt` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `signer`;
CREATE TABLE `signer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `publicKey` varchar(255) NOT NULL,
  `encryptedTransaction` text NOT NULL,
  `metaData` varchar(255) NOT NULL,
  `weight` int(11) NOT NULL,
  `signature` varchar(255) DEFAULT NULL,
  `refused` tinyint(4) DEFAULT 0,
  `notified` tinyint(4) DEFAULT 0,
  `signatureRequestId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_fd2755d480740234ef52fb0a9a6` (`signatureRequestId`),
  CONSTRAINT `FK_fd2755d480740234ef52fb0a9a6` FOREIGN KEY (`signatureRequestId`) REFERENCES `signature-request` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;