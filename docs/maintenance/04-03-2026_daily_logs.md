[u347029080@sg-nme-web423 public_html]$ tail -100 storage/logs/laravel.log | grep -i "ERROR\|CRITICAL"
[2026-02-19 12:52:30] local.ERROR: SQLSTATE[42S02]: Base table or view not found: 1146 Table 'u347029080_jurnal_mu.failed_jobs' doesn't exist (Connection: mysql, SQL: select * from `failed_jobs` order by `id` desc) {"exception":"[object] (Illuminate\\Database\\QueryException(code: 42S02): SQLSTATE[42S02]: Base table or view not found: 1146 Table 'u347029080_jurnal_mu.failed_jobs' doesn't exist (Connection: mysql, SQL: select * from `failed_jobs` order by `id` desc) at /home/u347029080/domains/journalmu.org/public_html/vendor/laravel/framework/src/Illuminate/Database/Connection.php:824)
[u347029080@sg-nme-web423 public_html]$ php artisan queue:failed

   INFO  No failed jobs found.

[u347029080@sg-nme-web423 public_html]$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sdb4       874G  816G   50G  95% /
tmpfs           188G   24K  188G   1% /dev/shm
tmpfs            20G  142M   20G   1% /dev/shm/lsws
/dev/sda1       3.5T  3.1T  378G  90% /tmp
tmpfs            76G  4.0G   72G   6% /run/systemd/journal/dev-log.cagefs
[u347029080@sg-nme-web423 public_html]$ php artisan tinker
>>> DB::connection()->getPdo();
>>> exit
Psy Shell v0.12.9 (PHP 8.2.29 — cli) by Justin Hileman
> DB::connection()->getPdo();
= PDO {#6630
    inTransaction: false,
    attributes: {
      CASE: NATURAL,
      ERRMODE: EXCEPTION,
      AUTOCOMMIT: 1,
      PERSISTENT: false,
      DRIVER_NAME: "mysql",
      SERVER_INFO: "Uptime: 2995992  Threads: 122  Questions: 21255327986  Slow queries: 7647  Opens: 6526058  Open tables: 102400  Queries per second avg: 7094.587",
      ORACLE_NULLS: NATURAL,
      CLIENT_VERSION: "mysqlnd 8.2.29",
      SERVER_VERSION: "11.8.3-MariaDB-log",
      STATEMENT_CLASS: [
        "PDOStatement",
      ],
      EMULATE_PREPARES: 0,
      CONNECTION_STATUS: "127.0.0.1 via TCP/IP",
      STRINGIFY_FETCHES: false,
      DEFAULT_FETCH_MODE: BOTH,
    },
  }

> exit;

   INFO  Goodbye.

-bash: syntax error near unexpected token `>'
-bash: syntax error near unexpected token `>'
[u347029080@sg-nme-web423 public_html]$ ps aux | grep "queue:work"
u347029+ 1953446  0.0  0.0 221672  2480 pts/1    S+   08:45   0:00 grep --color=auto queue:work
[u347029080@sg-nme-web423 public_html]$ ls -lh storage/app/backups/ | head -5
total 244K
-rw-r--r-- 1 u347029080 o1007543946  15K Feb 26 03:27 backup_20260226_032601.sql.gz
-rw-r--r-- 1 u347029080 o1007543946  15K Feb 27 07:33 backup_20260227_072828.sql.gz
-rw-r--r-- 1 u347029080 o1007543946  17K Mar  3 02:40 backup_20260303_024001.sql.gz
-rw-r--r-- 1 u347029080 o1007543946 191K Mar  4 04:30 backup_20260304_023953.sql.gz