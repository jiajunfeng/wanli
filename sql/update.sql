use wanli_db;
alter table `user_table` Add column colour int not null default 0 AFTER `sex`;

CREATE TABLE `feedback_table` (
id INT(11) NOT NULL AUTO_INCREMENT,
uid INT(11),
content VARCHAR(512),
PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `contracts_table` (
id INT(11) NOT NULL AUTO_INCREMENT,
uid INT(11),
contracts_uid INT(11),
contracts_name VARCHAR(32),
PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;