ALTER TABLE users MODIFY name VARCHAR(40);
ALTER TABLE users MODIFY email VARCHAR(255);

ALTER TABLE users
    ADD UNIQUE unique_index (`name`, `email`)