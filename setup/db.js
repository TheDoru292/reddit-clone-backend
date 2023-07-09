const mysql = require("mysql2/promise");
const config = require("../config");

console.log(process.env);

async function setupDb() {
  console.log(config.db);

  const conn = await mysql.createConnection(config.db);

  await conn.beginTransaction();

  try {
    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password TEXT,
        email VARCHAR(255) NOT NULL UNIQUE,
        registered_on DATETIME,
        about VARCHAR(200),
        gender VARCHAR(255),
        deleted BOOLEAN DEFAULT 0,
        coins INT
      )`
    );

    console.log("Users table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Subreddit (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(21),
        title VARCHAR(75),
        description VARCHAR(200),
        type VARCHAR(3),
        created_on DATETIME,
        owner INT,
        FOREIGN KEY (owner) REFERENCES Users(id),
        UNIQUE(name)
      )`
    );

    console.log("Subreddit table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Subreddit_flairs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subreddit INT,
        name VARCHAR(25),
        bg_color VARCHAR(7),
        FOREIGN KEY (subreddit) REFERENCES Subreddit(id)
      )`
    );

    console.log("Subreddit flairs table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Subreddit_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subreddit INT,
        int_order INT,
        rule VARCHAR(100),
        description VARCHAR(255),
        FOREIGN KEY (subreddit) REFERENCES Subreddit(id)
      )`
    );

    console.log("Subreddit rules table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Subreddit_bans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subreddit INT,
        banned_by_user INT,
        banned_user INT,
        expires_in DATETIME,
        reason TEXT,
        ban_message TEXT,
        FOREIGN KEY (subreddit) REFERENCES Subreddit(id),
        FOREIGN KEY (banned_user) REFERENCES Users(id),
        FOREIGN KEY (banned_by_user) REFERENCES Users(id)
      )`
    );

    console.log("Subreddit bans table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Subreddit_mod_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subreddit INT,
        moderator INT,
        time DATETIME,
        action VARCHAR(50),
        details TEXT,
        FOREIGN KEY (subreddit) REFERENCES Subreddit(id),
        FOREIGN KEY (moderator) REFERENCES Users(id)
      )`
    );

    console.log("Subreddit mod log table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Moderators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subreddit INT,
        user INT,
        FOREIGN KEY (subreddit) REFERENCES Subreddit(id),
        FOREIGN KEY (user) REFERENCES Users(id)
      )`
    );

    console.log("Moderators table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subreddit INT,
        user INT,
        posted_on DATETIME,
        type VARCHAR(4),
        title VARCHAR(150),
        spoiler BOOLEAN,
        nsfw BOOLEAN,
        oc BOOLEAN,
        content TEXT,
        flair INT,
        poll INT,
        link TEXT,
        deleted BOOLEAN,
        FOREIGN KEY (subreddit) REFERENCES Subreddit(id),
        FOREIGN KEY (user) REFERENCES Users(id),
        FOREIGN KEY (flair) REFERENCES Subreddit_flairs(id)
      )`
    );

    console.log("Posts table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Polls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post INT,
        ends_in DATETIME,
        option_1 TEXT,
        option_2 TEXT,
        option_3 TEXT,
        option_4 TEXT,
        option_5 TEXT,
        option_6 TEXT
      )`
    );

    console.log("Poll table created");

    await conn.execute(
      `ALTER TABLE Posts
      ADD FOREIGN KEY (poll) REFERENCES Polls(id)`
    );

    console.log("Added foreign key 'poll' referencings Polls table to Posts.");

    await conn.execute(
      `ALTER TABLE Polls
      ADD FOREIGN KEY (post) REFERENCES Posts(id)`
    );

    console.log("Added foreign key 'post' referencings Posts table to Polls.");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Poll_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user INT,
        poll INT,
        option_num INT,
        FOREIGN KEY (user) REFERENCES Users(id),
        FOREIGN KEY (poll) REFERENCES Polls(id)
      )`
    );

    console.log("Poll responses table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Post_upvotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user INT,
        post INT,
        FOREIGN KEY (user) REFERENCES Users(id),
        FOREIGN KEY (post) REFERENCES Posts(id)
      )`
    );

    console.log("Post upvotes table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Post_downvotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user INT,
        post INT,
        FOREIGN KEY (user) REFERENCES Users(id),
        FOREIGN KEY (post) REFERENCES Posts(id)
      )`
    );

    console.log("Post downvotes table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user INT,
        post INT,
        subreddit INT,
        reason TEXT,
        solved BOOLEAN,
        ignored BOOLEAN DEFAULT 0,
        FOREIGN KEY (user) REFERENCES Users(id),
        FOREIGN KEY (post) REFERENCES Posts(id),
        FOREIGN KEY (subreddit) REFERENCES Subreddit(id)
      )`
    );

    console.log("Reports table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Subreddit_pinned (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post INT,
        subreddit INT,
        FOREIGN KEY (post) REFERENCES Posts(id),
        FOREIGN KEY (subreddit) REFERENCES Subreddit(id)
      )`
    );

    console.log("Subreddit pinned table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Comments(
        id INT AUTO_INCREMENT PRIMARY KEY,
        user INT,
        post INT,
        content TEXT,
        commented_on DATETIME,
        FOREIGN KEY (user) REFERENCES Users(id),
        FOREIGN KEY (post) REFERENCES Posts(id)
      )`
    );

    console.log("Comments table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Comment_upvotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comment INT,
        post INT,
        FOREIGN KEY (comment) REFERENCES Comments(id),
        FOREIGN KEY (post) REFERENCES Posts(id)
      )`
    );

    console.log("Comment upvotes table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Comment_downvotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comment INT,
        post INT,
        FOREIGN KEY (comment) REFERENCES Comments(id),
        FOREIGN KEY (post) REFERENCES Posts(id)
      )`
    );

    console.log("Comment downvotes table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Subreddit_user_flairs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subreddit INT,
        name VARCHAR(25),
        bg_color VARCHAR(7),
        FOREIGN KEY (subreddit) REFERENCES Subreddit(id)
      )`
    );

    console.log("Subreddit user flairs table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS User_flairs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user INT,
        subreddit INT,
        flair INT,
        hidden BOOLEAN,
        FOREIGN KEY (user) REFERENCES Users(id),
        FOREIGN KEY (subreddit) REFERENCES Subreddit(id),
        FOREIGN KEY (flair) REFERENCES Subreddit_user_flairs(id)
      )`
    );

    console.log("User flairs table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Awards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50),
        picture TEXT,
        amount_of_coins INT
      )`
    );

    console.log("Awards table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Post_awards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post INT,
        award INT,
        user INT,
        anon BOOLEAN,
        FOREIGN KEY (post) REFERENCES Posts(id),
        FOREIGN KEY (award) REFERENCES Awards(id),
        FOREIGN KEY (user) REFERENCES Users(id)
      )`
    );

    console.log("Post awards table created");

    conn.execute(
      `CREATE TABLE IF NOT EXISTS Replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user INT,
        comment INT,
        reply INT,
        content TEXT,
        replied_on DATETIME,
        FOREIGN KEY (user) REFERENCES Users(id),
        FOREIGN KEY (comment) REFERENCES Comments(id),
        FOREIGN KEY (reply) REFERENCES Replies(id)
      )`
    );

    console.log("Replies table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Reply_upvotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reply INT,
        post INT,
        FOREIGN KEY (reply) REFERENCES Replies(id),
        FOREIGN KEY (post) REFERENCES Posts(id)
      )`
    );

    console.log("Reply upvotes table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Reply_downvotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reply INT,
        post INT,
        FOREIGN KEY (reply) REFERENCES Replies(id),
        FOREIGN KEY (post) REFERENCES Posts(id)
      )`
    );

    console.log("Reply downvotes table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_one INT,
        user_two INT,
        FOREIGN KEY (user_one) REFERENCES Users(id),
        FOREIGN KEY (user_two) REFERENCES Users(id)
      )`
    );

    console.log("Chat table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Message (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user INT,
        chat INT,
        message TEXT,
        messaged_on DATETIME,
        deleted BOOLEAN DEFAULT 0,
        FOREIGN KEY (user) REFERENCES Users(id),
        FOREIGN KEY (chat) REFERENCES Chats(id)
      )`
    );

    console.log("Message table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Blocked_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user INT,
        blocked_user INT,
        FOREIGN KEY (user) REFERENCES Users(id),
        FOREIGN KEY (blocked_user) REFERENCES Users(id)
      )`
    );

    console.log("Blocked users table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Private_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subreddit INT,
        user INT,
        FOREIGN KEY (subreddit) REFERENCES Subreddit(id),
        FOREIGN KEY (user) REFERENCES Users(id)
      )`
    );

    console.log("Private members table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Saved_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user INT,
        post INT,
        FOREIGN KEY (post) REFERENCES Posts(id),
        FOREIGN KEY (user) REFERENCES Users(id)
      )`
    );

    console.log("Saved posts table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Topics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50)
      )`
    );

    console.log("Topics table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user INT,
        message TEXT,
        link TEXT,
        FOREIGN KEY (user) REFERENCES Users(id)
      )`
    );

    console.log("Notifications table created");

    await conn.execute(
      `CREATE TABLE IF NOT EXISTS Members_from_restricted_subreddits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subreddit INT,
        user INT,
        FOREIGN KEY (subreddit) REFERENCES Subreddit(id),
        FOREIGN KEY (user) REFERENCES Users(id)
      )`
    );

    console.log("Members from restricted subreddits table created");

    console.log("\nDatabase setup finished");
    process.exit(0);
  } catch (err) {
    await conn.rollback();

    console.error(err);
    process.exit(0);
  }
}

setupDb();
