<?php

namespace Tests\Feature;

use App\Models\Journal;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Role;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;
use Symfony\Component\HttpKernel\Exception\HttpException;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    private function createRouteResolver(array $parameters)
    {
        return fn () => new class($parameters) {
            private $parameters;
            public function __construct($parameters) { $this->parameters = $parameters; }
            public function parameter($name, $default = null) { return $this->parameters[$name] ?? $default; }
        };
    }

    public function test_middleware_allows_user_with_role_for_journal()
    {
        $user = User::factory()->create(['is_active' => true]);
        $journal = Journal::factory()->create();

        UserRole::create([
            'user_id' => $user->id,
            'id_journal' => $journal->id,
            'role_name' => 'Editor',
            'status' => 'Active',
        ]);

        $request = Request::create('/journals/' . $journal->id, 'GET');
        $request->setUserResolver(fn () => $user);
        $request->setRouteResolver($this->createRouteResolver(['journal' => $journal]));

        $middleware = new RoleMiddleware();
        $response = $middleware->handle($request, function () {
            return response('Access Granted');
        }, 'Editor');

        $this->assertEquals('Access Granted', $response->getContent());
    }

    public function test_middleware_redirects_unauthenticated_user()
    {
        $request = Request::create('/journals/1', 'GET');
        $request->setUserResolver(fn () => null);

        $middleware = new RoleMiddleware();
        $response = $middleware->handle($request, function () {
            return response('Access Granted');
        }, 'Editor');

        $this->assertTrue($response->isRedirection());
        $this->assertEquals(route('login'), $response->headers->get('Location'));
        $this->assertEquals('You must be logged in to access this page.', session('error'));
    }

    public function test_middleware_redirects_inactive_user()
    {
        $user = User::factory()->create(['is_active' => false]);
        $request = Request::create('/journals/1', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new RoleMiddleware();
        $response = $middleware->handle($request, function () {
            return response('Access Granted');
        }, 'Editor');

        $this->assertTrue($response->isRedirection());
        $this->assertEquals(route('login'), $response->headers->get('Location'));
        $this->assertEquals('Your account has been deactivated.', session('error'));
    }

    public function test_middleware_resolves_journal_id_from_various_sources()
    {
        $user = User::factory()->create(['is_active' => true]);
        $journal = Journal::factory()->create();

        UserRole::create([
            'user_id' => $user->id,
            'id_journal' => $journal->id,
            'role_name' => 'Editor',
            'status' => 'Active',
        ]);

        $middleware = new RoleMiddleware();

        // 1. journal as numeric route parameter
        $req1 = Request::create('/journals/' . $journal->id, 'GET');
        $req1->setUserResolver(fn () => $user);
        $req1->setRouteResolver($this->createRouteResolver(['journal' => $journal->id]));
        $res1 = $middleware->handle($req1, fn () => response('Access Granted'), 'Editor');
        $this->assertEquals('Access Granted', $res1->getContent());

        // 2. journal as object in input parameter
        $req2 = Request::create('/journals', 'POST', ['journal' => $journal]);
        $req2->setUserResolver(fn () => $user);
        $res2 = $middleware->handle($req2, fn () => response('Access Granted'), 'Editor');
        $this->assertEquals('Access Granted', $res2->getContent());

        // 3. journal_id route parameter
        $req3 = Request::create('/some-route', 'GET');
        $req3->setUserResolver(fn () => $user);
        $req3->setRouteResolver($this->createRouteResolver(['journal_id' => $journal->id]));
        $res3 = $middleware->handle($req3, fn () => response('Access Granted'), 'Editor');
        $this->assertEquals('Access Granted', $res3->getContent());

        // 4. journal_id input parameter
        $req4 = Request::create('/some-route', 'POST', ['journal_id' => $journal->id]);
        $req4->setUserResolver(fn () => $user);
        $res4 = $middleware->handle($req4, fn () => response('Access Granted'), 'Editor');
        $this->assertEquals('Access Granted', $res4->getContent());

        // 5. id_journal route parameter
        $req5 = Request::create('/some-route', 'GET');
        $req5->setUserResolver(fn () => $user);
        $req5->setRouteResolver($this->createRouteResolver(['id_journal' => $journal->id]));
        $res5 = $middleware->handle($req5, fn () => response('Access Granted'), 'Editor');
        $this->assertEquals('Access Granted', $res5->getContent());

        // 6. id_journal input parameter
        $req6 = Request::create('/some-route', 'POST', ['id_journal' => $journal->id]);
        $req6->setUserResolver(fn () => $user);
        $res6 = $middleware->handle($req6, fn () => response('Access Granted'), 'Editor');
        $this->assertEquals('Access Granted', $res6->getContent());
    }

    public function test_middleware_checks_has_role_in_any_journal_when_no_journal_id()
    {
        $user = User::factory()->create(['is_active' => true]);
        $journal = Journal::factory()->create();

        UserRole::create([
            'user_id' => $user->id,
            'id_journal' => $journal->id,
            'role_name' => 'Editor',
            'status' => 'Active',
        ]);

        // No journal ID resolved
        $request = Request::create('/some-route', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new RoleMiddleware();
        $response = $middleware->handle($request, function () {
            return response('Access Granted');
        }, 'Editor');

        $this->assertEquals('Access Granted', $response->getContent());
    }

    public function test_middleware_checks_has_role_when_no_journal_id()
    {
        $user = User::factory()->create(['is_active' => true]);
        
        $role = Role::create([
            'name' => 'Editor',
            'display_name' => 'Editor',
            'description' => 'Editor role',
        ]);

        $user->roles()->attach($role, [
            'assigned_at' => now(),
            'assigned_by' => $user->id,
        ]);

        // No journal ID resolved
        $request = Request::create('/some-route', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new RoleMiddleware();
        $response = $middleware->handle($request, function () {
            return response('Access Granted');
        }, 'Editor');

        $this->assertEquals('Access Granted', $response->getContent());
    }

    public function test_middleware_aborts_unauthorized_access()
    {
        $user = User::factory()->create(['is_active' => true]);
        $journal = Journal::factory()->create();

        $request = Request::create('/journals/' . $journal->id, 'GET');
        $request->setUserResolver(fn () => $user);
        $request->setRouteResolver($this->createRouteResolver(['journal' => $journal]));

        $middleware = new RoleMiddleware();

        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Unauthorized. You do not have the required role for this journal.');

        $middleware->handle($request, function () {
            return response('Access Granted');
        }, 'Editor');
    }

    public function test_middleware_ignores_array_journal_id_to_prevent_injection()
    {
        $user = User::factory()->create(['is_active' => true]);

        // Input journal_id is an array
        $request = Request::create('/journals', 'POST', ['journal_id' => [1, 2]]);
        $request->setUserResolver(fn () => $user);

        $middleware = new RoleMiddleware();

        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Unauthorized. You do not have the required role for this journal.');

        $middleware->handle($request, function () {
            return response('Access Granted');
        }, 'Editor');
    }
}

