# JurnalMu Operational Runbook

**Version:** 1.0  
**Last Updated:** February 17, 2026  
**Applicable To:** v1.1+ Production Environment  
**Owner:** Development & Operations Team

---

## 📚 Document Purpose

This runbook provides step-by-step procedures for common operational tasks, incident response, and system administration for the JurnalMu platform. It serves as the single source of truth for operational procedures.

---

## 📋 Table of Contents

1. [Daily Operations](#daily-operations)
2. [Weekly Maintenance](#weekly-maintenance)
3. [Monthly Tasks](#monthly-tasks)
4. [Database Backup Procedures](#database-backup-procedures)
5. [Incident Response](#incident-response)
6. [Common Scenarios](#common-scenarios)
7. [Disaster Recovery](#disaster-recovery)
8. [Contact & Escalation](#contact--escalation)

---

## 🌅 Daily Operations

### Morning Health Check (Monday - Friday, 9:00 AM)

**Duration:** 10 minutes  
**Responsibility:** Operations Team

**Checklist:**
```bash
# 1. Check application status
curl https://journalmu.org/health
# Expected: {"status":"healthy"}

# 2. Check error logs
ssh server@jurnalmu.org
cd /path/to/jurnal_mu
tail -100 storage/logs/laravel.log | grep -i "ERROR\|CRITICAL"
# Expected: No critical errors from today

# 3. Check failed jobs
php artisan queue:failed
# Expected: 0 failed jobs (or investigate any failures)

# 4. Check disk space
df -h
# Expected: < 80% usage on all partitions

# 5. Check database connectivity
php artisan tinker
>>> DB::connection()->getPdo();
>>> exit
# Expected: PDO connection object

# 6. Verify queue worker is running
ps aux | grep "queue:work"
# Expected: Process running

# 7. Check recent backups
ls -lh storage/app/backups/ | head -5
# or
ls -lh /path/to/backup/location/
# Expected: Backup from today or yesterday
```

**If any check fails:**
- Document findings
- Follow incident response procedure (see below)
- Escalate if cannot resolve in 30 minutes

---

### End-of-Day Summary (Monday - Friday, 5:00 PM)

**Duration:** 5 minutes

```bash
# Check today's activity
php artisan tinker
>>> DB::table('journals')->whereDate('created_at', today())->count();
>>> DB::table('journal_assessments')->whereDate('created_at', today())->count();
>>> DB::table('users')->whereDate('created_at', today())->count();
>>> exit

# Log summary in operations log
echo "$(date): Journals: X, Assessments: Y, New Users: Z" >> /var/log/jurnal_mu_ops.log
```

---

## 📅 Weekly Maintenance

### Every Monday (10:00 AM)

**Duration:** 30 minutes  
**Responsibility:** Development Team

#### 1. Security Audit
```bash
# Check for vulnerable dependencies
composer audit
npm audit

# Review failed login attempts (if logging implemented)
# Check for suspicious IP addresses

# Verify SSL certificate expiry
openssl s_client -connect jurnalmu.org:443 -servername jurnalmu.org 2>/dev/null | openssl x509 -noout -dates
```

#### 2. Performance Check
```bash
# Check database size
mysql -u root -p -e "
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'jurnal_mu'
GROUP BY table_schema;"

# Check slow queries (if enabled)
mysql -u root -p -e "SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;"

# Check average response time (if monitoring tool installed)
# Or manually test key pages:
curl -w "@curl-format.txt" -o /dev/null -s https://jurnalmu.org/dashboard
```

#### 3. Backup Verification
```bash
# List recent backups
ls -lh storage/app/backups/ | head -7

# Verify backup integrity (sample one backup)
gunzip -t backup-YYYYMMDD.sql.gz
# Expected: No errors

# Document verification in ops log
echo "$(date): Backup verification OK" >> /var/log/jurnal_mu_ops.log
```

---

### Every Friday (4:00 PM)

**Duration:** 15 minutes

#### Weekly Report Generation
```bash
# Generate weekly statistics
php artisan tinker
>>> $weekStart = now()->startOfWeek();
>>> $weekEnd = now()->endOfWeek();
>>> 
>>> echo "Weekly Report: " . $weekStart->format('Y-m-d') . " to " . $weekEnd->format('Y-m-d') . "\n";
>>> echo "New Journals: " . DB::table('journals')->whereBetween('created_at', [$weekStart, $weekEnd])->count() . "\n";
>>> echo "Assessments Submitted: " . DB::table('journal_assessments')->where('status', 'submitted')->whereBetween('created_at', [$weekStart, $weekEnd])->count() . "\n";
>>> echo "New Users: " . DB::table('users')->whereBetween('created_at', [$weekStart, $weekEnd])->count() . "\n";
>>> echo "Active Universities: " . DB::table('users')->where('is_active', true)->distinct('university_id')->count() . "\n";
>>> exit
```

Send report to:
- Project Manager (Andri Pranolo)
- Stakeholder (Lukman Hakim)
- Operations Team

---

## 📆 Monthly Tasks

### First Monday of Month (10:00 AM)

**Duration:** 2 hours  
**Responsibility:** Full Team

#### 1. Full System Audit
```bash
# 1. Security Review
composer audit
npm audit
composer require --dev roave/security-advisories:dev-latest
npm update

# 2. Performance Audit
# Run Laravel Telescope (if installed) and review:
# - Slowest endpoints
# - N+1 queries
# - Memory usage peaks

# 3. Database Optimization
mysql -u root -p jurnal_mu -e "OPTIMIZE TABLE journals, journal_assessments, users;"

# 4. Log Rotation
find storage/logs/*.log -mtime +30 -delete
# Keep only last 30 days

# 5. Backup Restoration Test
# Restore latest backup to staging environment
# Verify data integrity
```

#### 2. Update Dependencies (if needed)
```bash
# Check for outdated packages
composer outdated
npm outdated

# Review changelog and update non-breaking versions
composer update --no-dev
npm update

# Run full test suite
php artisan test
npm run test

# If tests pass, deploy to staging for verification
```

#### 3. Documentation Review
- Review and update `docs/development/MAINTENANCE.md` if procedures changed
- Update runbook (this document) with lessons learned
- Document any new procedures or workarounds discovered

#### 4. Team Meeting
- Review metrics from last month
- Discuss issues encountered
- Plan improvements for next month
- Review v1.2 implementation progress

---

## � Database Backup Procedures

### Overview

| Type | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| Full Backup | Daily (02:00 AM) | 30 days | `mysqldump` |
| Weekly Snapshot | Every Sunday | 90 days | `mysqldump` + compress |
| Pre-deployment Backup | Before every deploy | 7 days | Manual |
| Monthly Archive | First day of month | 1 year | `mysqldump` + offsite |

---

### Manual Backup

**Use before deployments, major changes, or on demand.**

```bash
# Navigate to project root
cd /path/to/jurnal_mu

# Set variables
DB_NAME="jurnal_mu"
DB_USER="root"
DB_PASS="your_password"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="storage/app/backups"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# 1. Full database backup (uncompressed, for quick inspection)
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_${TIMESTAMP}.sql
# Expected: File created, no errors

# 2. Full database backup (compressed, recommended for storage)
mysqldump -u $DB_USER -p$DB_PASS \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  $DB_NAME | gzip > $BACKUP_DIR/backup_${TIMESTAMP}.sql.gz
# Expected: .sql.gz file created

# 3. Verify backup was created
ls -lh $BACKUP_DIR/backup_${TIMESTAMP}*
# Expected: Non-zero file size

# 4. Verify backup integrity
gunzip -t $BACKUP_DIR/backup_${TIMESTAMP}.sql.gz
# Expected: No errors (exit code 0)

# 5. Log the action
echo "$(date): Manual backup created: backup_${TIMESTAMP}.sql.gz by $(whoami)" \
  >> storage/logs/backup.log
```

---

### Automated Daily Backup (Cron)

**Setup — run once on the server:**

```bash
# Open crontab editor
crontab -e

# Add the following lines:
# Daily full backup at 02:00 AM
0 2 * * * /bin/bash /path/to/jurnal_mu/scripts/backup_db.sh >> /path/to/jurnal_mu/storage/logs/backup.log 2>&1

# Weekly backup on Sunday at 03:00 AM (kept 90 days)
0 3 * * 0 /bin/bash /path/to/jurnal_mu/scripts/backup_db_weekly.sh >> /path/to/jurnal_mu/storage/logs/backup.log 2>&1
```

**Create the daily backup script** (`scripts/backup_db.sh`):

```bash
#!/bin/bash
set -e

APP_DIR="/path/to/jurnal_mu"
BACKUP_DIR="$APP_DIR/storage/app/backups/daily"
DB_NAME="jurnal_mu"
DB_USER="root"
DB_PASS="your_password"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="daily_${TIMESTAMP}.sql.gz"

echo "[$(date)] Starting daily backup: $FILENAME"

mysqldump -u $DB_USER -p$DB_PASS \
  --single-transaction \
  --routines \
  --triggers \
  $DB_NAME | gzip > $BACKUP_DIR/$FILENAME

# Verify
gunzip -t $BACKUP_DIR/$FILENAME

# Delete backups older than RETENTION_DAYS
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Daily backup completed: $FILENAME ($(du -sh $BACKUP_DIR/$FILENAME | cut -f1))"
```

```bash
# Make scripts executable
chmod +x /path/to/jurnal_mu/scripts/backup_db.sh
chmod +x /path/to/jurnal_mu/scripts/backup_db_weekly.sh
```

---

### Backup Verification

**Run after each backup (automated or manual):**

```bash
# 1. Check file exists and has reasonable size
ls -lh storage/app/backups/daily/ | tail -5
# Expected: Latest file > 1 MB (varies by data volume)

# 2. Test gzip integrity
BACKUP_FILE="storage/app/backups/daily/daily_YYYYMMDD_HHMMSS.sql.gz"
gunzip -t $BACKUP_FILE && echo "OK: Backup integrity verified" || echo "ERROR: Backup file corrupted!"

# 3. Inspect backup content (check for key tables)
gunzip -c $BACKUP_FILE | grep -c "CREATE TABLE"
# Expected: Number matching total tables in schema (e.g., 15+)

# 4. Verify row counts are plausible
gunzip -c $BACKUP_FILE | grep -i "INSERT INTO \`journals\`" | wc -l
# Expected: > 0 if journals exist in DB
```

---

### Backup Restoration (Test / Emergency)

> ⚠️ **Never restore directly to production without testing on staging first.**

```bash
# 1. Create a new empty database for testing
mysql -u root -p -e "CREATE DATABASE jurnal_mu_restore_test;"

# 2. Restore backup into test database
gunzip -c storage/app/backups/daily/daily_YYYYMMDD_HHMMSS.sql.gz \
  | mysql -u root -p jurnal_mu_restore_test

# 3. Verify key tables and row counts
mysql -u root -p jurnal_mu_restore_test -e "
  SELECT 'users' AS tbl, COUNT(*) AS rows FROM users
  UNION SELECT 'journals', COUNT(*) FROM journals
  UNION SELECT 'journal_assessments', COUNT(*) FROM journal_assessments;
"
# Expected: Counts match production values

# 4. If verified OK and emergency restore to production is required:
#    a. Put application in maintenance mode
php artisan down

#    b. Drop and recreate production database
mysql -u root -p -e "DROP DATABASE jurnal_mu; CREATE DATABASE jurnal_mu;"

#    c. Restore
gunzip -c storage/app/backups/daily/daily_YYYYMMDD_HHMMSS.sql.gz \
  | mysql -u root -p jurnal_mu

#    d. Run any pending migrations
php artisan migrate --force

#    e. Clear caches and bring back online
php artisan optimize:clear
php artisan up

# 5. Clean up test database
mysql -u root -p -e "DROP DATABASE jurnal_mu_restore_test;"
```

---

### Backup Retention Policy

| Backup Type | Location | Retention | Action on Expiry |
|-------------|----------|-----------|------------------|
| Daily | `storage/app/backups/daily/` | 30 days | Auto-deleted by script |
| Weekly | `storage/app/backups/weekly/` | 90 days | Auto-deleted by script |
| Pre-deploy | `storage/app/backups/predeploy/` | 7 days | Auto-deleted by script |
| Monthly archive | Offsite / cloud storage | 1 year | Manual review before delete |

> **Note:** For production, offsite backup (e.g., Google Drive, S3, or external server) is strongly recommended. Do not rely solely on local storage.

---

## �🚨 Incident Response

### Incident Severity Matrix

| Severity | Impact | Response Time | Escalation |
|----------|--------|---------------|------------|
| **P1 - Critical** | System down, no workaround | 15 minutes | Immediate |
| **P2 - High** | Major function unavailable | 1 hour | Within 1 hour |
| **P3 - Medium** | Minor function impaired | 4 hours | Next business day |
| **P4 - Low** | Cosmetic/informational | Next sprint | Not required |

---

### P1: System Completely Down

**Symptoms:**
- Website unreachable (502/503 errors)
- Database connection failures across all pages
- Critical data corruption

**Immediate Actions (0-15 minutes):**
```bash
# 1. Enable maintenance mode (if accessible)
php artisan down --secret="emergency-access-$(date +%s)"
# Share secret URL with team immediately

# 2. Check server status
systemctl status apache2  # or nginx
systemctl status mysql

# 3. Check error logs
tail -100 /var/log/apache2/error.log
tail -100 storage/logs/laravel.log

# 4. Restart services if needed
sudo systemctl restart apache2
sudo systemctl restart mysql
sudo systemctl restart php8.2-fpm

# 5. Test basic connectivity
curl -I https://jurnalmu.org
mysql -u root -p -e "SELECT 1"

# 6. If services won't start, check disk space
df -h
# If disk full, emergency cleanup:
find /tmp -type f -atime +7 -delete
find storage/logs -name "*.log" -size +100M -delete
```

**Communication (5 minutes):**
```
Subject: P1 INCIDENT - JurnalMu System Down

Status: INVESTIGATING
Start Time: [TIME]
Impact: All users unable to access system
Current Action: [BRIEF DESCRIPTION]
Next Update: In 30 minutes or when resolved

Contact: [YOUR NAME] - [PHONE]
```

Send to:
- operations-team@example.com
- project-manager@example.com
- stakeholders (if > 30 minutes downtime)

**Resolution Steps:**
1. Identify root cause from logs
2. Apply fix or rollback recent changes
3. Verify system functionality
4. Disable maintenance mode
5. Monitor for 1 hour post-recovery

**Post-Incident (Within 24 hours):**
- Write incident report
- Identify preventive measures
- Update runbook with lessons learned

---

### P2: Major Feature Unavailable

**Examples:**
- Users cannot submit assessments
- Login broken for specific role
- Database queries timing out

**Response Procedure:**
```bash
# 1. Confirm issue
# Try to reproduce the exact steps user reported

# 2. Check related logs
grep -i "assessment\|submit" storage/logs/laravel.log | tail -50

# 3. Check queue status (if feature uses queues)
php artisan queue:failed

# 4. Quick fixes to try:
php artisan cache:clear
php artisan config:clear
php artisan queue:restart

# 5. If fix requires code change:
#    - Develop fix
#    - Test on staging
#    - Deploy to production
#    - Monitor

# 6. If cannot fix within 1 hour:
#    - Escalate to development team
#    - Document workaround for users (if any)
```

---

### P3: Minor Function Impaired

**Examples:**
- Slow page load on specific page
- Search not returning expected results
- Email notifications delayed

**Response Procedure:**
```bash
# 1. Document the issue
#    - Which page/feature?
#    - Error messages?
#    - Frequency (always, sometimes)?

# 2. Check if widespread or isolated
#    - Ask other users to test
#    - Check from different browsers/devices

# 3. Gather debugging info
#    - Browser console errors
#    - Network tab (slow requests?)
#    - Laravel logs for warnings

# 4. Create GitHub issue with details
#    - Steps to reproduce
#    - Expected vs actual behavior
#    - Screenshots/logs

# 5. Prioritize for next sprint
#    - If simple fix, apply immediately
#    - If complex, schedule for planned maintenance
```

---

## 🎭 Common Scenarios

### Scenario 1: User Locked Out (Forgot Password)

**Situation:** User cannot reset password (email not arriving, reset link expired)

**Solution:**
```bash
# Option A: Manually reset password
php artisan tinker
>>> $user = User::where('email', 'user@example.com')->first();
>>> $user->password = Hash::make('TemporaryPassword123!');
>>> $user->save();
>>> exit

# Send temporary password to user via alternative channel (phone, WhatsApp)
# Instruct user to change password immediately
```

**Option B: Resend verification email**
```bash
php artisan tinker
>>> $user = User::where('email', 'user@example.com')->first();
>>> $user->sendPasswordResetNotification($token);
>>> exit
```

**Documentation:**
- Log action in ops log
- Note: Password was reset manually for [USER] on [DATE] by [ADMIN]

---

### Scenario 2: Assessment Submission Stuck

**Situation:** User reports "Submit Assessment" button not working

**Diagnosis:**
```bash
# 1. Check user's assessment status
php artisan tinker
>>> $user = User::where('email', 'user@example.com')->first();
>>> $assessment = $user->journals()->first()->assessments()->latest()->first();
>>> echo $assessment->status;
>>> exit

# 2. Check validation errors
#    - Are all required indicators answered?
#    - Are file uploads valid?

# 3. Check JavaScript console (ask user for screenshot)

# 4. Check backend logs
grep -i "assessment.*validation" storage/logs/laravel.log | tail -20
```

**Common Fixes:**
1. **Incomplete responses:** Ask user to fill all required fields
2. **File upload issues:** Check file size limits, formats
3. **Session expired:** User should log out and log back in
4. **Cache issue:** Clear browser cache (Ctrl+Shift+Delete)

**If data is valid but stuck:**
```bash
# Manually update status (use with caution!)
php artisan tinker
>>> $assessment = Assessment::find([ID]);
>>> $assessment->status = 'submitted';
>>> $assessment->submitted_at = now();
>>> $assessment->save();
>>> exit

# Document this action and investigate root cause
```

---

### Scenario 3: Queue Worker Crashed

**Symptoms:**
- Emails not being sent
- Background jobs not processing
- Failed jobs accumulating

**Fix:**
```bash
# 1. Check if worker is running
ps aux | grep "queue:work"

# 2. If not running, start it
cd /path/to/jurnal_mu
nohup php artisan queue:work --tries=3 --timeout=90 > storage/logs/queue.log 2>&1 &

# 3. If using Supervisor (recommended)
sudo supervisorctl status jurnal-mu-worker
sudo supervisorctl restart jurnal-mu-worker

# 4. Process failed jobs
php artisan queue:retry all

# 5. Monitor for 15 minutes
tail -f storage/logs/queue.log
```

**Prevention:**
- Set up Supervisor to auto-restart queue workers
- Monitor queue worker health in daily check

---

### Scenario 4: Database Migration Failed During Deployment

**Situation:** Ran `php artisan migrate` and got error

**DO NOT PANIC. Follow these steps:**

```bash
# 1. Check migration status
php artisan migrate:status
# Identify which migration failed

# 2. Check error message
tail -100 storage/logs/laravel.log

# 3. Common issues:
#    a) Duplicate column: Migration already partially applied
#    b) Syntax error: Check migration file
#    c) Foreign key constraint: Related table doesn't exist

# 4. If safe to rollback (no data loss risk):
php artisan migrate:rollback --step=1

# 5. Fix the migration file, then:
php artisan migrate

# 6. If rollback not safe (production with data):
#    - Do NOT rollback
#    - Manually fix database to match expected state
#    - Mark migration as complete:
php artisan tinker
>>> DB::table('migrations')->insert([
>>>     'migration' => '2025_XX_XX_failed_migration_name',
>>>     'batch' => DB::table('migrations')->max('batch') + 1
>>> ]);
>>> exit
```

**Prevention:**
- Always test migrations on staging first
- Backup database before migrating
- Review migration file for errors

---

### Scenario 5: High Server Load / Slow Performance

**Symptoms:**
- Pages loading slowly (> 5 seconds)
- Timeouts occurring
- Server CPU/memory high

**Immediate Actions:**
```bash
# 1. Check server resources
top
# Identify process using most CPU/RAM

# 2. If Apache/PHP-FPM overloaded:
# Check concurrent requests
ss -tn | grep :80 | wc -l

# 3. Emergency performance boost (temporary):
# Clear all caches
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. If database is slow:
# Check for locked tables
mysql -u root -p -e "SHOW PROCESSLIST;"
# If long-running queries, consider killing them:
# mysql -u root -p -e "KILL [PROCESS_ID];"

# 5. Check for malicious traffic
tail -100 /var/log/apache2/access.log | awk '{print $1}' | sort | uniq -c | sort -rn
# If one IP has excessive requests, consider blocking
```

**Long-term fixes:**
- Optimize slow queries
- Add database indexes
- Implement Redis caching
- Scale server resources

---

## 💾 Disaster Recovery

### Scenario: Complete Data Loss

**Situation:** Database corrupted, server died, or catastrophic failure

**Recovery Steps:**

#### 1. Prepare New Environment
```bash
# On new server or fresh install:
git clone [repository]
cd jurnal_mu
composer install --no-dev
npm ci
cp .env.example .env
# Edit .env with production settings
php artisan key:generate
```

#### 2. Restore Database
```bash
# Locate latest backup
ls -lh /path/to/backups/ | tail -5

# Restore database
gunzip < backup-YYYYMMDD.sql.gz | mysql -u root -p jurnal_mu

# Verify restoration
mysql -u root -p jurnal_mu -e "SELECT COUNT(*) FROM journals;"
```

#### 3. Restore Uploaded Files
```bash
# If backups include storage/app/public:
tar -xzf storage-backup-YYYYMMDD.tar.gz -C storage/app/

# Re-create symlink
php artisan storage:link
```

#### 4. Verify Application
```bash
# Run migrations (should be up-to-date if backup recent)
php artisan migrate --force

# Clear and cache
php artisan optimize

# Start services
php artisan queue:work &
```

#### 5. Test Critical Paths
- [ ] Login as each role (Super Admin, Admin Kampus, User)
- [ ] View journals list
- [ ] View assessment details
- [ ] Submit test assessment (on staging, not production!)
- [ ] Check file uploads/downloads

#### 6. Bring System Online
```bash
# Remove maintenance mode if enabled
php artisan up

# Monitor logs closely for 24 hours
tail -f storage/logs/laravel.log
```

**Recovery Time Objective (RTO):** 4 hours  
**Recovery Point Objective (RPO):** 24 hours (daily backups)

---

### Backup Restoration Testing (Quarterly)

**Purpose:** Verify backups are valid and restoration procedure works

**Procedure:**
1. Provision temporary staging server
2. Attempt full restoration from latest backup
3. Test application functionality
4. Document any issues encountered
5. Update disaster recovery procedures
6. Destroy temporary server

**Responsibility:** Operations Team  
**Schedule:** January, April, July, October

---

## 📞 Contact & Escalation

### Emergency Contacts (24/7)

| Role | Name | Phone | Email | Primary Responsibility |
|------|------|-------|-------|----------------------|
| **Server Admin** | [Name] | +62 895-4232-00040 | [email] | Infrastructure, database |
| **Lead Developer** | [Name] | [Phone] | [email] | Application code |
| **Project Manager** | Andri Pranolo | [Phone] | [email] | Coordination, decisions |
| **Stakeholder** | Lukman Hakim | [Phone] | [email] | Business decisions |

### Escalation Path

```
Level 1: Operations Team Member
    ↓ (cannot resolve in 30 min for P1, 2 hours for P2)
Level 2: Lead Developer
    ↓ (cannot resolve in 2 hours for P1, 1 day for P2)
Level 3: Project Manager + Stakeholder
    ↓ (requires business decision or budget approval)
Level 4: Management Escalation
```

### Communication Channels

- **Normal Hours:** Email, Slack/WhatsApp
- **Emergency (P1):** Phone call
- **Status Updates:** Email + WhatsApp group
- **User Communications:** Email, website announcement

---

## 📊 Metrics & Reporting

### Key Performance Indicators (KPIs)

Track weekly:
- **Uptime:** Target > 99.9%
- **Average Response Time:** Target < 500ms
- **Error Rate:** Target < 0.1%
- **Failed Jobs:** Target < 5 per week
- **Mean Time to Recovery (MTTR):** Target < 1 hour for P2 incidents

### Reporting Schedule

| Report | Frequency | Audience | Content |
|--------|-----------|----------|---------|
| Daily Health Check | Daily (weekdays) | Ops team | Pass/Fail + issues |
| Weekly Summary | Weekly (Friday) | PM + Stakeholders | Usage stats, incidents |
| Monthly Review | Monthly | Full team | KPIs, trends, improvements |
| Incident Report | Per incident (P1/P2) | All stakeholders | Root cause, resolution, prevention |

---

## 📝 Runbook Maintenance

### Review Schedule
- **Minor updates:** As needed when procedures change
- **Major review:** Quarterly (with backup restoration test)
- **Version control:** Track changes in Git

### Contribution Process
1. Identify procedure gap or improvement
2. Document proposed change
3. Review with team
4. Update runbook
5. Commit to repository
6. Notify team of changes

---

## 📚 Related Documents

- [MAINTENANCE.md](./MAINTENANCE.md) - Detailed maintenance procedures
- [PRODUCTION_MIGRATION_GUIDE.md](../setup-deployment/PRODUCTION_MIGRATION_GUIDE.md) - Deployment guide
- [v1.2_STATUS_REPORT.md](../project-planning/v1.2_STATUS_REPORT.md) - Implementation status
- [ERD Database.md](../database/ERD%20Database.md) - Database schema reference

---

**Document Version:** 1.0  
**Created:** February 17, 2026  
**Last Updated:** February 17, 2026  
**Next Review:** May 17, 2026
