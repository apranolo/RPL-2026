[u347029080@sg-nme-web423 public_html]$ tail -100 storage/logs/laravel.log | grep -i "Error\|CRITICAL"
[2026-02-11 17:20:31] local.ERROR: App\Models\Journal::scopeForUniversity(): Argument #2 ($universityId) must be of type int, null given, called in /home/u347029080/domains/journalmu.org/public_html/vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php on line 1748 {"userId":3,"exception":"[object] (TypeError(code: 0): App\\Models\\Journal::scopeForUniversity(): Argument #2 ($universityId) must be of type int, null given, called in /home/u347029080/domains/journalmu.org/public_html/vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php on line 1748 at /home/u347029080/domains/journalmu.org/public_html/app/Models/Journal.php:258)
#26 /home/u347029080/domains/journalmu.org/public_html/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}()
#27 /home/u347029080/domains/journalmu.org/public_html/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\\View\\Middleware\\ShareErrorsFromSession->handle()


[u347029080@sg-nme-web423 public_html]$ php artisan queue:failed

   Illuminate\Database\QueryException

  SQLSTATE[42S02]: Base table or view not found: 1146 Table 'u347029080_jurnal_mu.failed_jobs' doesn't exist (Connection: mysql, SQL: select * from `failed_jobs` order by `id` desc)

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      +25 vendor frames

  26  artisan:16
      Illuminate\Foundation\Application::handleCommand()


[u347029080@sg-nme-web423 public_html]$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sdb4       874G  794G   71G  92% /
tmpfs           188G   24K  188G   1% /dev/shm
tmpfs            20G  407M   20G   2% /dev/shm/lsws
/dev/sda1       3.5T  3.1T  424G  88% /tmp
tmpfs            76G  4.1G   72G   6% /run/systemd/journal/dev-log.cagefs


[u347029080@sg-nme-web423 public_html]$ php artisan tinker
Psy Shell v0.12.9 (PHP 8.2.29 — cli) by Justin Hileman
> DB::connection()->getPdo();
= PDO {#6605
    inTransaction: false,
    attributes: {
      CASE: NATURAL,
      ERRMODE: EXCEPTION,
      AUTOCOMMIT: 1,
      PERSISTENT: false,
      DRIVER_NAME: "mysql",
      SERVER_INFO: "Uptime: 1862552  Threads: 128  Questions: 12476354764  Slow queries: 4487  Opens: 4031012  Open tables: 102400  Queries per second avg: 6698.526",
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


[u347029080@sg-nme-web423 public_html]$ ps aux | grep "queue:work"
u347029+ 1322741  0.0  0.0 221672  2488 pts/0    S+   05:55   0:00 grep --color=auto queue:work


[u347029080@sg-nme-web423 public_html]$ ls -lh storage/app/backups/ | head -5
ls: cannot access 'storage/app/backups/': No such file or directory