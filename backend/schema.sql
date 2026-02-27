-- JobNest Database Schema

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS exam_attempts;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS job_applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS user_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS otp_verifications;
DROP TABLE IF EXISTS contact_requests;
DROP TABLE IF EXISTS admin_logs;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    id                   INT PRIMARY KEY AUTO_INCREMENT,
    mobile               VARCHAR(15)  NOT NULL UNIQUE,
    name                 VARCHAR(100),
    email                VARCHAR(100),
    role                 ENUM('employer', 'job_seeker', 'admin') NOT NULL DEFAULT 'job_seeker',
    area                 VARCHAR(255),
    city                 VARCHAR(100),
    state                VARCHAR(100),
    pincode              VARCHAR(10),
    latitude             DECIMAL(10, 8),
    longitude            DECIMAL(11, 8),
    bio                  TEXT,
    experience_years     INT DEFAULT 0,
    availability         ENUM('immediate', 'within_week', 'within_month', 'not_available') DEFAULT 'immediate',
    expected_salary_min  DECIMAL(10, 2),
    expected_salary_max  DECIMAL(10, 2),
    is_verified          BOOLEAN DEFAULT FALSE,
    exam_passed          BOOLEAN DEFAULT FALSE,
    subscription_status  ENUM('free', 'active', 'expired') DEFAULT 'free',
    subscription_end_date DATETIME,
    profile_completed    BOOLEAN DEFAULT FALSE,
    is_active            BOOLEAN DEFAULT TRUE,
    last_login           DATETIME,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location   (latitude, longitude),
    INDEX idx_role       (role),
    INDEX idx_subscription (subscription_status),
    INDEX idx_verified   (is_verified),
    INDEX idx_exam       (exam_passed)
);

CREATE TABLE skills (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL UNIQUE,
    category    VARCHAR(100),
    description TEXT,
    icon        VARCHAR(255),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_name     (name)
);

CREATE TABLE user_skills (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    user_id          INT NOT NULL,
    skill_id         INT NOT NULL,
    proficiency      ENUM('beginner', 'intermediate', 'expert') DEFAULT 'beginner',
    years_experience INT DEFAULT 0,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_id),
    INDEX idx_user  (user_id),
    INDEX idx_skill (skill_id)
);

CREATE TABLE jobs (
    id                    INT PRIMARY KEY AUTO_INCREMENT,
    employer_id           INT NOT NULL,
    title                 VARCHAR(200) NOT NULL,
    description           TEXT,
    skill_id              INT,
    job_type              ENUM('full_time', 'part_time', 'contract', 'daily_wage') DEFAULT 'full_time',
    salary_min            DECIMAL(10, 2),
    salary_max            DECIMAL(10, 2),
    salary_type           ENUM('hourly', 'daily', 'weekly', 'monthly') DEFAULT 'monthly',
    area                  VARCHAR(255),
    city                  VARCHAR(100),
    state                 VARCHAR(100),
    latitude              DECIMAL(10, 8),
    longitude             DECIMAL(11, 8),
    radius_km             INT DEFAULT 10,
    vacancies             INT DEFAULT 1,
    availability_required ENUM('immediate', 'within_week', 'within_month', 'flexible') DEFAULT 'flexible',
    experience_required   INT DEFAULT 0,
    job_duration          VARCHAR(100),
    is_active             BOOLEAN DEFAULT TRUE,
    expires_at            DATETIME,
    views_count           INT DEFAULT 0,
    applications_count    INT DEFAULT 0,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (skill_id)    REFERENCES skills(id) ON DELETE SET NULL,
    INDEX idx_employer (employer_id),
    INDEX idx_skill    (skill_id),
    INDEX idx_location (latitude, longitude),
    INDEX idx_active   (is_active),
    INDEX idx_created  (created_at)
);

CREATE TABLE job_applications (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    job_id         INT NOT NULL,
    applicant_id   INT NOT NULL,
    status         ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'hired') DEFAULT 'pending',
    cover_letter   TEXT,
    employer_notes TEXT,
    applied_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id)       REFERENCES jobs(id)  ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, applicant_id),
    INDEX idx_job       (job_id),
    INDEX idx_applicant (applicant_id),
    INDEX idx_status    (status)
);

CREATE TABLE subscriptions (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    user_id                 INT NOT NULL,
    plan_type               ENUM('monthly', 'quarterly', 'yearly') DEFAULT 'monthly',
    amount                  DECIMAL(10, 2) NOT NULL,
    razorpay_subscription_id VARCHAR(100),
    status                  ENUM('created', 'active', 'paused', 'cancelled', 'expired') DEFAULT 'created',
    start_date              DATETIME,
    end_date                DATETIME,
    is_first_month          BOOLEAN DEFAULT TRUE,
    auto_renew              BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user     (user_id),
    INDEX idx_status   (status),
    INDEX idx_end_date (end_date)
);

CREATE TABLE payments (
    id                   INT PRIMARY KEY AUTO_INCREMENT,
    user_id              INT NOT NULL,
    payment_type         ENUM('subscription', 'skill_exam', 'verified_badge') NOT NULL,
    amount               DECIMAL(10, 2) NOT NULL,
    razorpay_order_id    VARCHAR(100),
    razorpay_payment_id  VARCHAR(100),
    razorpay_signature   VARCHAR(255),
    status               ENUM('created', 'pending', 'completed', 'failed', 'refunded') DEFAULT 'created',
    metadata             JSON,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user          (user_id),
    INDEX idx_razorpay_order (razorpay_order_id),
    INDEX idx_status        (status),
    INDEX idx_type          (payment_type)
);

CREATE TABLE exams (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    skill_id       INT NOT NULL,
    question       TEXT NOT NULL,
    option_a       VARCHAR(255) NOT NULL,
    option_b       VARCHAR(255) NOT NULL,
    option_c       VARCHAR(255) NOT NULL,
    option_d       VARCHAR(255) NOT NULL,
    correct_option ENUM('a', 'b', 'c', 'd') NOT NULL,
    difficulty     ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_skill  (skill_id),
    INDEX idx_active (is_active)
);

CREATE TABLE exam_attempts (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL,
    skill_id        INT NOT NULL,
    payment_id      INT,
    questions_data  JSON,
    answers_data    JSON,
    score           INT DEFAULT 0,
    total_questions INT DEFAULT 10,
    passed          BOOLEAN DEFAULT FALSE,
    started_at      DATETIME,
    completed_at    DATETIME,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (skill_id)   REFERENCES skills(id)   ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    INDEX idx_user   (user_id),
    INDEX idx_skill  (skill_id),
    INDEX idx_passed (passed)
);

CREATE TABLE otp_verifications (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    mobile      VARCHAR(15)  NOT NULL,
    otp_hash    VARCHAR(255) NOT NULL,
    expires_at  DATETIME NOT NULL,
    attempts    INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mobile  (mobile),
    INDEX idx_expires (expires_at)
);

CREATE TABLE contact_requests (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    employer_id   INT NOT NULL,
    job_seeker_id INT NOT NULL,
    job_id        INT,
    status        ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    message       TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_seeker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id)        REFERENCES jobs(id)  ON DELETE SET NULL,
    INDEX idx_employer (employer_id),
    INDEX idx_seeker   (job_seeker_id)
);

CREATE TABLE admin_logs (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    admin_id    INT NOT NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id   INT,
    details     JSON,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin  (admin_id),
    INDEX idx_action (action)
);

-- Default skills
INSERT INTO skills (name, category, description) VALUES
('Farming',          'Agriculture',       'General farming and crop cultivation'),
('Tractor Driving',  'Agriculture',       'Operating tractors and farm machinery'),
('Animal Husbandry', 'Agriculture',       'Livestock care and management'),
('Carpentry',        'Construction',      'Woodworking and furniture making'),
('Masonry',          'Construction',      'Brick and stone work'),
('Plumbing',         'Construction',      'Water and pipe fitting'),
('Electrical Work',  'Construction',      'Electrical installations and repairs'),
('Welding',          'Manufacturing',     'Metal welding and fabrication'),
('Tailoring',        'Textile',           'Clothing and garment making'),
('Cooking',          'Food & Hospitality','Food preparation and cooking'),
('Driving',          'Transport',         'Vehicle driving - cars, trucks'),
('Security Guard',   'Security',          'Security and watchman services'),
('Housekeeping',     'Domestic',          'Cleaning and household maintenance'),
('Gardening',        'Landscaping',       'Garden maintenance and landscaping'),
('Mobile Repair',    'Technical',         'Mobile phone repair and servicing');

-- Sample exam questions
INSERT INTO exams (skill_id, question, option_a, option_b, option_c, option_d, correct_option, difficulty) VALUES
(1, 'What is the best time to sow wheat in North India?',  'March-April', 'June-July', 'October-November', 'January-February', 'c', 'easy'),
(1, 'Which fertilizer is best for paddy crops?',           'Urea', 'DAP', 'Potash', 'All of above',        'd', 'medium'),
(1, 'What is the ideal pH for most crops?',                '4-5', '6-7', '8-9', '10-11',                   'b', 'easy'),
(4, 'Which wood is best for furniture making?',            'Pine', 'Teak', 'Rubber', 'Bamboo',              'b', 'easy'),
(4, 'What tool is used for smoothing wood?',               'Hammer', 'Chisel', 'Plane', 'Saw',              'c', 'easy'),
(7, 'What is the unit of electrical resistance?',          'Volt', 'Ampere', 'Ohm', 'Watt',                 'c', 'easy'),
(7, 'Which wire color indicates ground/earth?',            'Red', 'Black', 'Green', 'Blue',                 'c', 'medium'),
(11,'What does a red traffic light mean?',                 'Go', 'Slow down', 'Stop', 'Reverse',            'c', 'easy'),
(11,'Which side should you drive on in India?',            'Right', 'Left', 'Center', 'Any side',           'b', 'easy'),
(10,'What temperature should a refrigerator be set at?',   '10°C', '4°C', '-5°C', '20°C',                  'b', 'medium');

-- Default admin user (mobile can be updated after setup)
INSERT INTO users (mobile, name, role, is_active, is_verified, profile_completed)
VALUES ('9999999999', 'System Admin', 'admin', TRUE, TRUE, TRUE);

-- To change admin mobile, run:
-- UPDATE users SET mobile = 'YOUR_NUMBER' WHERE role = 'admin';