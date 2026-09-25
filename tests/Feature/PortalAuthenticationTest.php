<?php

use App\Models\Clinic;
use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

it('authenticates admins in their own session portal', function () {
    $admin = User::factory()->create([
        'email' => 'admin@example.test',
        'password' => Hash::make('password'),
        'is_admin' => true,
    ]);

    $this->post(route('admin.login.store'), [
        'email' => 'admin@example.test',
        'password' => 'password',
    ])->assertRedirect(route('admin.dashboard'));

    $this->assertAuthenticatedAs($admin, 'admin');
    $this->get(route('admin.dashboard'))->assertOk();
    $this->get(route('dashboard'))->assertRedirect(route('clinic.login'));
});

it('issues a Sanctum token for admin API login', function () {
    User::factory()->create([
        'email' => 'api-admin@example.test',
        'password' => Hash::make('password'),
        'is_admin' => true,
    ]);

    $response = $this->postJson('/api/v1/admin/login', [
        'email' => 'api-admin@example.test',
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'roles', 'permissions']]);

    $this->withToken($response->json('token'))
        ->getJson('/api/v1/admin/me')
        ->assertOk()
        ->assertJsonPath('user.email', 'api-admin@example.test');
});

it('serves separate admin and clinic login pages', function () {
    $this->get(route('admin.login'))->assertOk();
    $this->get(route('clinic.login'))->assertOk();
});

it('allows creating one initial admin account and blocks later registration', function () {
    $this->get(route('admin.register'))->assertOk();

    $this->post(route('admin.register.store'), [
        'name' => 'First Admin',
        'email' => 'first-admin@example.test',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('admin.dashboard'));

    $this->assertDatabaseHas('users', [
        'email' => 'first-admin@example.test',
        'is_admin' => true,
    ]);
    $this->assertAuthenticated('admin');
    $this->post(route('admin.logout'));

    $this->get(route('admin.register'))->assertNotFound();
});

it('seeds the default admin account idempotently', function () {
    $this->seed(AdminSeeder::class);
    $this->seed(AdminSeeder::class);

    $admin = User::query()->where('email', 'admin123@gmail.com')->firstOrFail();

    expect($admin->is_admin)->toBeTrue()
        ->and($admin->admin_role)->toBe('super_admin')
        ->and($admin->name)->toBe('Clinic System Administrator')
        ->and(Hash::check('admin@123', $admin->password))->toBeTrue()
        ->and(User::query()->where('email', 'admin123@gmail.com')->count())->toBe(1);
});

it('enforces the permissions assigned to each admin role', function () {
    $inventoryAdmin = User::factory()->create([
        'is_admin' => true,
        'admin_role' => 'inventory_manager',
    ]);

    $this->actingAs($inventoryAdmin, 'admin');

    $this->get(route('admin.dashboard'))->assertOk();
    $this->get(route('admin.inventory.drugs'))->assertOk();
    $this->get(route('admin.inventory.reports'))->assertOk();
    $this->get(route('admin.inventory.reports.reservation-charges'))->assertForbidden();
    $this->get(route('admin.reservations.index'))->assertForbidden();
    $this->get(route('admin.users.index'))->assertForbidden();
});

it('lets a super admin assign roles to other admin accounts', function () {
    $superAdmin = User::factory()->create(['is_admin' => true, 'admin_role' => 'super_admin']);
    $this->actingAs($superAdmin, 'admin');

    $this->post(route('admin.users.store'), [
        'name' => 'Inventory Manager',
        'email' => 'inventory-manager@example.test',
        'password' => 'password',
        'admin_role' => 'inventory_manager',
    ])->assertRedirect(route('admin.users.index'));

    $inventoryAdmin = User::query()->where('email', 'inventory-manager@example.test')->firstOrFail();
    expect($inventoryAdmin->admin_role)->toBe('inventory_manager')
        ->and($inventoryAdmin->hasAdminPermission('inventory.manage'))->toBeTrue()
        ->and($inventoryAdmin->hasAdminPermission('finance.view'))->toBeFalse();

    $this->put(route('admin.users.update', $inventoryAdmin), [
        'admin_role' => 'report_viewer',
    ])->assertRedirect(route('admin.users.index'));

    expect($inventoryAdmin->fresh()->admin_role)->toBe('report_viewer');
});

it('does not allow a regular user to sign in to the admin portal', function () {
    User::factory()->create([
        'email' => 'user@example.test',
        'password' => Hash::make('password'),
        'is_admin' => false,
    ]);

    $this->from(route('admin.login'))
        ->post(route('admin.login.store'), [
            'email' => 'user@example.test',
            'password' => 'password',
        ])
        ->assertRedirect(route('admin.login'))
        ->assertSessionHasErrors('email');

    $this->assertGuest('admin');
});

it('authenticates clinics separately from admins', function () {
    $clinic = Clinic::create([
        'clinic_name' => 'Test Clinic',
        'clinic_permit' => 'PERMIT-001',
        'complete_address' => 'Clinic address',
        'status' => 'Approved',
        'user_name' => 'clinic001',
        'password' => Hash::make('password'),
    ]);

    $this->post(route('clinic.login.store'), [
        'user_name' => 'clinic001',
        'password' => 'password',
    ])->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($clinic, 'clinic');
    $this->get(route('dashboard'))->assertOk();
    $this->get(route('admin.dashboard'))->assertRedirect(route('admin.login'));
});
