# JurnalMu Maintenance Guide

This document outlines the standard procedures for maintaining, monitoring, and troubleshooting the JurnalMu application.

**Last Updated:** February 17, 2026  
**Applicable Version:** v1.1+ (Current: v1.1 Deployed)  
**Next Version:** v1.2 (Planned - See [v1.2_IMPLEMENTATION_PLAN.md](/v1.2_IMPLEMENTATION_PLAN.md))

---

## 🛠️ Routine Maintenance Tasks

### 1. Database Backups
**Frequency:** Daily (Recommended), Weekly (Verification)

⚠️ **IMPORTANT**: The `spatie/laravel-backup` package is **NOT currently installed**. You have two options:

#### Option A: Manual Backup (Current Method)
```bash
# Export database via mysqldump
mysqldump -u [username] -p jurnal_mu > backup-$(date +%Y%m%d).sql

# Compress for storage
gzip backup-$(date +%Y%m%d).sql

# Move to secure location
mv backup-*.sql.gz /path/to/secure/storage/
```

#### Option B: Install Laravel Backup Package (Recommended)
```bash
# Install package
composer require spatie/laravel-backup

# Publish configuration
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"

# Configure in config/backup.php
# Then run:
php artisan backup:run
```

**Storage Best Practices:**
- Keep backups in `storage/app/backups` (excluded from version control)
- Set up automated off-site backup to cloud storage (S3, Google Drive)
- Retain daily backups for 7 days, weekly for 30 days, monthly for 1 year

**Verification**: 
- **Monthly**: Attempt to restore a backup to a **staging** environment to ensure data integrity
- **Quarterly**: Run disaster recovery drill with full restoration

### 2. Cache Management
**Frequency:** After deployments or configuration changes.
- **Clear Application Cache**:
  ```bash
  php artisan cache:clear
  ```
- **Clear Config Cache** (Critical after `.env` changes):
  ```bash
  php artisan config:clear
  php artisan config:cache
  ```
- **Clear Route Cache**:
  ```bash
  php artisan route:clear
  php artisan route:cache
  ```
- **Clear View/Compiled Class Cache**:
  ```bash
  php artisan view:clear
  php artisan optimize:clear  # Clears everything
  ```

### 3. Log Rotation & Monitoring
**Frequency:** Weekly review, Critical issues monitored continuously

**Log Location**: `storage/logs/laravel.log`

**Monitoring Actions:**
1. **Check for Critical Errors**:
   ```bash
   # Search for ERROR and CRITICAL entries
   grep -i "ERROR\|CRITICAL" storage/logs/laravel.log | tail -50
   
   # Check today's errors
   grep "$(date +%Y-%m-%d)" storage/logs/laravel.log | grep -i "error"
   ```

2. **Monitor Application Health**:
   ```bash
   # Check failed jobs
   php artisan queue:failed
   
   # Monitor queue worker status
   php artisan queue:listen --tries=1  # Should be running in production
   ```

3. **Log Viewer Options**:
   - **Manual**: Direct file access via SSH/FTP
   - **Optional Package**: Install `rap2hpoutre/laravel-log-viewer` for web-based viewing
     ```bash
     composer require rap2hpoutre/laravel-log-viewer
     # Access at: /logs (requires authentication middleware)
     ```

**Log Rotation**: 
- Laravel handles rotation based on `config/logging.php` (default: daily)
- Old logs automatically compressed after 7 days
- Purge logs older than 30 days to save disk space:
  ```bash
  find storage/logs/*.log -mtime +30 -delete
  ```

### 4. Queue Worker Maintenance
**Frequency:** Check daily, restart on deployment

The application uses queues for:
- Email notifications (Assessment approvals, Pembinaan assignments)
- Background processing tasks

**Management:**
```bash
# Check queue status
php artisan queue:work --once  # Process one job

# Restart workers (required after code deployment)
php artisan queue:restart

# Monitor failed jobs
php artisan queue:failed
php artisan queue:retry all    # Retry failed jobs
php artisan queue:flush        # Clear all failed jobs

# Production worker (should run continuously)
php artisan queue:work --tries=3 --timeout=90
```

**Production Setup (Supervisor Recommended)**:
```ini
# /etc/supervisor/conf.d/jurnal-mu-worker.conf
[program:jurnal-mu-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/jurnal_mu/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/jurnal_mu/storage/logs/worker.log
```

### 5. Session & Cache Cleanup
**Frequency:** Monthly or when experiencing performance issues

```bash
# Clear old sessions (database-based sessions)
php artisan queue:prune-batches  # Laravel 11+

# Clear expired cache entries
php artisan cache:prune-stale-tags

# Full cache flush (use with caution)
php artisan cache:clear
php artisan view:clear
php artisan route:clear
php artisan config:clear
```

### 6. Storage Cleanup
**Frequency:** Monthly

```bash
# Check storage usage
du -sh storage/app/*

# Clean up temporary files
php artisan storage:link  # Ensure symlink exists

# Remove old uploaded files (manual review recommended)
# Check: storage/app/public/assessments/
# Check: storage/app/public/pembinaan/
```

---

## 🚀 Deployment & Updates

### Deployment Checklist
Before pushing to production:

**Pre-Deployment:**
1.  ✅ **Run All Tests**: 
    ```bash
    php artisan test                    # Pest PHP tests
    npm run test                        # Vitest frontend tests
    ```
2.  ✅ **Code Quality Checks**:
    ```bash
    ./vendor/bin/pint --test           # PHP linting
    npm run lint                        # ESLint
    npm run format:check                # Prettier
    npm run types                       # TypeScript checking
    ```
3.  ✅ **Frontend Build**: 
    ```bash
    npm run build                       # Production build
    npm run build:ssr                   # SSR support (if enabled)
    ```
4.  ✅ **Migration Status**: 
    ```bash
    php artisan migrate:status          # Check for pending migrations
    ```
5.  ✅ **Dependency Security Audit**: 
    ```bash
    composer audit                      # PHP vulnerabilities
    npm audit                           # Node.js vulnerabilities
    ```

**During Deployment:**
1.  **Enable Maintenance Mode**:
    ```bash
    php artisan down --secret="bypass-token"
    # Users can access: https://yoursite.com/bypass-token
    ```
2.  **Pull Latest Code**:
    ```bash
    git pull origin main
    ```
3.  **Update Dependencies**:
    ```bash
    composer install --no-dev --optimize-autoloader
    npm ci --production
    ```
4.  **Run Migrations**:
    ```bash
    php artisan migrate --force
    ```
5.  **Clear & Cache**:
    ```bash
    php artisan optimize:clear
    php artisan optimize              # Route, config, view caching
    ```
6.  **Restart Services**:
    ```bash
    php artisan queue:restart         # Queue workers
    # Restart PHP-FPM if applicable:
    # sudo systemctl restart php8.2-fpm
    ```
7.  **Build Frontend Assets** (if not done pre-deployment):
    ```bash
    npm run build
    ```
8.  **Disable Maintenance Mode**:
    ```bash
    php artisan up
    ```

**Post-Deployment Verification:**
- ✅ Test critical user flows (login, journal creation, assessment submission)
- ✅ Check error logs: `tail -f storage/logs/laravel.log`
- ✅ Verify queue is processing: `php artisan queue:failed`
- ✅ Monitor response times and server resources

### Rollback Procedure
If deployment fails:

```bash
# 1. Enable maintenance mode
php artisan down

# 2. Revert code
git reset --hard [previous-commit-hash]

# 3. Rollback database if migrations ran
php artisan migrate:rollback

# 4. Clear caches
php artisan optimize:clear

# 5. Restore from backup if necessary
mysql -u username -p jurnal_mu < backup-YYYYMMDD.sql

# 6. Disable maintenance mode
php artisan up
```

### Updating Dependencies
1.  **Backend (Composer)**:
    ```bash
    composer update
    # If major version update:
    # 1. Update composer.json
    # 2. Review upgrade guide
    # 3. composer update
    ```
2.  **Frontend (NPM)**:
    ```bash
    npm update
    # Check for outdated packages
    npm outdated
    ```

---

## 🔧 Troubleshooting Common Issues

### 1. "500 Server Error" (Blank Screen)
- **Immediate Action**: Check `storage/logs/laravel.log`.
- **Common Causes**:
  - Permissions issues on `storage` or `bootstrap/cache` folders.
    ```bash
    chmod -R 775 storage bootstrap/cache
    ```
  - `.env` file missing or invalid encryption key.
  - Database connection failure.

### 2. "419 Page Expired"
- **Cause**: CSRF token mismatch.
- **Fix**:
  - Clear browser cookies.
  - Clear session cache: `php artisan session:clear`.
  - Check `SESSION_DOMAIN` in `.env`.

### 3. Inertia/React Errors (Frontend)
- **Symptoms**: Blank page with console errors.
- **Fix**:
  - Rebuild assets: `npm run build`.
  - Ensure `APP_URL` in `.env` matches the browser URL.
  - Check browser console (F12) for specific React component errors.

### 4. Queue/Job Failures (Email, Notifications)
**Check Failed Jobs**:
```bash
php artisan queue:failed
```

**Common Causes:**
- Mail server configuration issues (`MAIL_*` in `.env`)
- Timeout on long-running jobs
- Database connection lost during job execution

**Retry Failed Jobs**:
```bash
php artisan queue:retry all              # Retry all failed
php artisan queue:retry [job-id]         # Retry specific job
```

**Clear Failed Jobs** (after fixing root cause):
```bash
php artisan queue:flush
```

**Restart Queue Worker**:
```bash
php artisan queue:restart
```

**Debug Mail Issues:**
```bash
# Test mail configuration
php artisan tinker
>>> Mail::raw('Test email', function($message) { $message->to('test@example.com')->subject('Test'); });
```

### 5. Inertia Version Mismatch
**Symptoms**: "Inertia version mismatch" modal appearing
**Cause**: Frontend assets cached after backend update

**Fix**:
```bash
# Client-side: Hard refresh browser (Ctrl+Shift+R)
# Server-side: Rebuild assets
npm run build
php artisan optimize:clear
```

### 6. File Upload Issues
**Symptoms**: "413 Request Entity Too Large" or timeout on file uploads

**Fix**:
1. **Check PHP Configuration** (`php.ini`):
   ```ini
   upload_max_filesize = 20M
   post_max_size = 25M
   max_execution_time = 300
   memory_limit = 256M
   ```

2. **Check Web Server Configuration**:
   - **Apache**: `.htaccess` or `httpd.conf`
   - **Nginx**: `client_max_body_size 20M;`

3. **Restart Services**:
   ```bash
   # XAMPP: Restart Apache from control panel
   # Linux:
   sudo systemctl restart apache2
   # or
   sudo systemctl restart nginx
   ```

### 7. Permission Issues
**Symptoms**: "Permission denied" errors, 500 errors after deployment

**Fix**:
```bash
# Laravel requires write access to these folders:
chmod -R 775 storage bootstrap/cache

# For XAMPP (Windows): Right-click → Properties → Security
# For Linux: Set proper ownership
sudo chown -R www-data:www-data storage bootstrap/cache

# Create storage symlink if missing
php artisan storage:link
```

### 8. Database Connection Errors
**Symptoms**: "SQLSTATE[HY000] [2002] Connection refused"

**Fix**:
1. **Check MySQL/MariaDB is running**:
   ```bash
   # XAMPP: Check control panel
   # Linux:
   sudo systemctl status mysql
   ```

2. **Verify `.env` configuration**:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=jurnal_mu
   DB_USERNAME=root
   DB_PASSWORD=
   ```

3. **Test connection**:
   ```bash
   php artisan tinker
   >>> DB::connection()->getPdo();
   ```

### 9. Slow Performance
**Causes and Solutions:**

1. **No Query Caching**:
   ```bash
   # Enable route and config caching
   php artisan route:cache
   php artisan config:cache
   php artisan view:cache
   ```

2. **N+1 Query Problems**:
   - Check Laravel Debugbar (if installed in dev)
   - Use eager loading: `->with(['relation1', 'relation2'])`

3. **Large Log Files**:
   ```bash
   # Truncate log file
   echo "" > storage/logs/laravel.log
   ```

4. **Session Issues**:
   ```bash
   # Clear old sessions
   php artisan session:table  # If using database sessions
   php artisan migrate
   ```

---

## 🔒 Security Practices

### Regular Security Audits
**Frequency:** Weekly (automated), Monthly (manual review)

1.  **Dependency Vulnerability Scanning**:
    ```bash
    # PHP dependencies
    composer audit
    composer require --dev roave/security-advisories:dev-latest
    
    # Node.js dependencies
    npm audit
    npm audit fix  # Auto-fix non-breaking updates
    ```

2.  **Environment Configuration Check**:
    ```bash
    # ⚠️ CRITICAL: Never expose in production
    APP_DEBUG=false
    APP_ENV=production
    
    # ✅ MUST be set securely
    APP_KEY=base64:...  # Never commit this!
    DB_PASSWORD=...     # Use strong passwords
    ```

3.  **File Permission Audit**:
    ```bash
    # .env MUST NOT be publicly accessible
    chmod 600 .env
    
    # Verify web root permissions
    find public/ -type f -exec chmod 644 {} \;
    find public/ -type d -exec chmod 755 {} \;
    ```

4.  **Sensitive File Protection**:
    ```apache
    # Apache: Ensure .htaccess blocks sensitive files
    <Files .env>
        Require all denied
    </Files>
    ```
    
    ```nginx
    # Nginx: Add to server block
    location ~ /\.env {
        deny all;
        return 404;
    }
    ```

### Security Checklist (Monthly Review)

- [ ] `APP_DEBUG=false` in production
- [ ] `.env` file permissions set to 600 (not readable by others)
- [ ] SSL/TLS certificate valid and auto-renewal configured
- [ ] Database backups encrypted
- [ ] User sessions expire after inactivity (configured in `config/session.php`)
- [ ] CSRF protection enabled (default in Laravel)
- [ ] XSS protection via Blade escaping (use `{{ }}` not `{!! !!}`)
- [ ] Rate limiting configured on sensitive routes (login, API)
- [ ] File upload validation (type, size, malware scanning recommended)
- [ ] SQL injection protection (use Eloquent/Query Builder, never raw queries with user input)
- [ ] Review failed login attempts logs
- [ ] Audit user permissions and roles

### Security Incident Response

**If breach suspected:**
1. **Immediate Actions**:
   ```bash
   # Enable maintenance mode
   php artisan down
   
   # Capture current state
   cp storage/logs/laravel.log logs-incident-$(date +%Y%m%d).log
   mysqldump -u root -p jurnal_mu > db-incident-$(date +%Y%m%d).sql
   ```

2. **Investigation**:
   - Check `storage/logs/laravel.log` for suspicious activity
   - Review database for unauthorized changes
   - Check file system for modified files: `find . -mtime -1 -type f`

3. **Recovery**:
   - Change all passwords (database, `.env`, admin accounts)
   - Regenerate `APP_KEY`: `php artisan key:generate`
   - Update dependencies: `composer update && npm update`
   - Review and patch vulnerability

4. **Communication**:
   - Notify affected users if data compromised
   - Document incident and resolution steps
   - Update security procedures

---

## 📊 Performance Monitoring

### Key Metrics to Track

1. **Application Performance**:
   ```bash
   # Check response times (requires Laravel Telescope or similar)
   # Monitor: Average response time < 500ms
   
   # Database query performance
   php artisan tinker
   >>> DB::enableQueryLog();
   >>> // Run your code
   >>> dd(DB::getQueryLog());
   ```

2. **Server Resources**:
   ```bash
   # CPU and Memory usage
   top
   htop  # If installed
   
   # Disk space
   df -h
   
   # Check PHP-FPM status (if applicable)
   sudo systemctl status php8.2-fpm
   ```

3. **Database Performance**:
   ```sql
   -- Check slow queries
   SHOW PROCESSLIST;
   
   -- Table sizes
   SELECT 
       table_name AS 'Table',
       ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
   FROM information_schema.TABLES
   WHERE table_schema = 'jurnal_mu'
   ORDER BY (data_length + index_length) DESC;
   ```

### Performance Optimization

**When to Optimize:**
- Response time > 1 second for average requests
- Database size > 1GB
- High CPU usage (> 80%) during normal operation

**Optimization Strategies:**
1. **Enable Caching**:
   ```bash
   # Configuration caching (production only)
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   
   # Application caching (use Redis for production)
   # Update .env:
   CACHE_STORE=redis
   SESSION_DRIVER=redis
   ```

2. **Database Indexing**:
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_journals_user_id ON journals(user_id);
   CREATE INDEX idx_journals_university_id ON journals(university_id);
   CREATE INDEX idx_assessments_status ON journal_assessments(status);
   ```

3. **Query Optimization**:
   - Use eager loading to prevent N+1 queries
   - Paginate large result sets
   - Use `select()` to retrieve only needed columns

4. **Asset Optimization**:
   ```bash
   # Frontend build optimization
   npm run build  # Uses Vite production optimizations
   
   # Consider CDN for static assets
   ```

---

## 🚨 Monitoring & Alerting (Recommended Setup)

### Application Monitoring Tools

**Option 1: Laravel Telescope** (Development/Staging)
```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```
- Access at: `/telescope`
- Monitor requests, exceptions, queries, jobs

**Option 2: Sentry** (Production Error Tracking)
```bash
composer require sentry/sentry-laravel
php artisan sentry:publish --dsn=YOUR_DSN
```
- Real-time error notifications
- Performance monitoring
- Release tracking

**Option 3: Laravel Pulse** (Real-time Metrics)
```bash
composer require laravel/pulse
php artisan pulse:install
```
- Server metrics, slow queries, exceptions
- Lightweight dashboard

### Health Check Endpoint

Create a health check route for monitoring tools:

```php
// routes/web.php
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now(),
            'services' => [
                'database' => 'connected',
                'cache' => Cache::has('health_check') ? 'working' : 'unknown',
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'unhealthy',
            'error' => $e->getMessage()
        ], 500);
    }
});
```

### Automated Monitoring Script

```bash
#!/bin/bash
# monitor.sh - Run via cron every 5 minutes

URL="https://jurnalmu.org/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -ne 200 ]; then
    echo "JurnalMu is DOWN! Status: $RESPONSE" | mail -s "ALERT: JurnalMu Down" admin@example.com
fi
```

**Crontab setup**:
```cron
*/5 * * * * /path/to/monitor.sh
```

---

## 📝 Documentation & Knowledge Management

### Required Documentation Updates

When making changes, update these documents:

1. **Code Changes**:
   - Update PHPDoc blocks and JSDoc comments
   - Update TypeScript interfaces in `resources/js/types/`
   - Run type checking: `npm run types`

2. **Database Changes**:
   - Document in [ERD Database.md](../database/ERD%20Database.md)
   - Create migration file with clear description
   - Update model relationships and fillable attributes

3. **Feature Changes**:
   - Create/update feature doc in `docs/features/`
   - Update [v1.2_IMPLEMENTATION_PLAN.md](/v1.2_IMPLEMENTATION_PLAN.md) if applicable
   - Screenshot new UI changes in `docs/screenshots/`

4. **API Changes**:
   - Update route documentation
   - Update Inertia component props interfaces
   - Test with `npm run types`

### Knowledge Base

| Topic | Document |
|-------|----------|
| Project Overview | [copilot-instructions.md](/.github/copilot-instructions.md) |
| MVP Features | [jurnal_mu MVP v1.1 - UPDATED.md](../project-planning/jurnal_mu%20MVP%20v1.1%20-%20UPDATED.md) |
| Database Schema | [ERD Database.md](../database/ERD%20Database.md) |
| Assessment Flow | [ASSESSMENT_QUICK_REFERENCE.md](../features/ASSESSMENT_QUICK_REFERENCE.md) |
| Pembinaan Flow | [PEMBINAAN_QUICK_REFERENCE.md](../features/PEMBINAAN_QUICK_REFERENCE.md) |
| Testing Guide | [policy testing.md](../testing/policy%20testing.md) |
| Deployment | [PRODUCTION_MIGRATION_GUIDE.md](../setup-deployment/PRODUCTION_MIGRATION_GUIDE.md) |

---

## 🆘 Emergency Contacts & Escalation

## 🆘 Emergency Contacts & Escalation

### Support Levels

| Level | Issue Type | Contact | Response Time |
|-------|-----------|---------|---------------|
| **L1** | User questions, how-to | Help desk / FAQ | 1-2 business days |
| **L2** | Bug reports, data issues | Development team | 1 business day |
| **L3** | Critical outage, security | System admin / DevOps | 1-2 hours |
| **L4** | Data loss, major breach | CTO / Management | Immediate |

### Contact Information

- **Development Team (UAD)**: [Insert contact details]
- **Server Administrator**: HP +62 895-4232-00040
- **Project Manager**: Andri Pranolo (UAD)
- **Stakeholder (Majelis Dikti)**: Lukman Hakim
- **Emergency Email**: [Insert emergency email]

### Escalation Matrix

**Severity Definitions:**

| Severity | Description | Example | Max Resolution Time |
|----------|-------------|---------|-------------------|
| **P1 - Critical** | System down, data loss | Database crash, security breach | 2 hours |
| **P2 - High** | Major feature broken | Login broken, assessment submission failing | 4 hours |
| **P3 - Medium** | Feature partially working | Slow performance, minor UI bugs | 2 business days |
| **P4 - Low** | Cosmetic issues | Typos, minor formatting issues | Next release |

**Escalation Flow:**
1. **User reports issue** → Help desk or email
2. **L1 Support** → Initial triage and basic troubleshooting
3. **Development Team** → Bug investigation and fix
4. **System Admin** → Infrastructure and deployment issues
5. **Management** → Business decisions and major incidents

---

## 📚 Additional Resources

### Learning Resources
- **Laravel Documentation**: https://laravel.com/docs/12.x
- **Inertia.js Documentation**: https://inertiajs.com/
- **React Documentation**: https://react.dev/
- **Pest PHP Testing**: https://pestphp.com/

### Development Tools
- **Local Development**: XAMPP (Apache + MySQL + PHP)
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions (see [PR_AUTOMATION_FLOW.md](../setup-deployment/PR_AUTOMATION_FLOW.md))
- **Code Quality**: Laravel Pint, ESLint, Prettier, TypeScript

### Useful Commands Reference

```bash
# Development
composer dev           # Start all services (server, queue, vite)
npm run dev           # Frontend dev server only
php artisan serve     # Backend dev server only

# Testing
php artisan test      # Run Pest tests
php artisan dusk      # Run browser tests
npm run test          # Run Vitest tests

# Code Quality
./vendor/bin/pint     # PHP formatting
npm run lint          # JS/TS linting
npm run format        # Prettier formatting
npm run types         # TypeScript checking

# Database
php artisan migrate              # Run migrations
php artisan migrate:fresh --seed # Reset DB with seed data
php artisan db:seed              # Seed data only

# Cache Management
php artisan optimize:clear  # Clear all caches
php artisan optimize        # Cache routes, config, views

# Queue Management
php artisan queue:work      # Start queue worker
php artisan queue:failed    # List failed jobs
php artisan queue:restart   # Restart queue workers
```

---

## 📋 Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Feb 12, 2026 | Initial version | JurnalMU Team |
| 1.1 | Feb 17, 2026 | Major update: Added comprehensive sections for monitoring, performance, security, troubleshooting. Corrected backup information (spatie package not installed). Added emergency contacts and escalation matrix. | AI Assistant |

---

**For questions or corrections to this document, please contact the development team or update via Git pull request.**
