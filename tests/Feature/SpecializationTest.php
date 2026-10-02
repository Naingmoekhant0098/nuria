<?php

use App\Actions\Doctors\CreateDoctorAction;
use App\Models\Doctor;
use App\Models\NrcState;
use App\Models\NrcTownship;
use App\Models\NrcType;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function makeAdmin(): User
{
    return User::factory()->create([
        'is_admin' => true,
        'admin_role' => 'super_admin',
    ]);
}

it('shows the specializations list in the admin panel', function () {
    $admin = makeAdmin();
    $this->actingAs($admin, 'admin');

    Specialization::factory()->create(['name' => 'Cardiology', 'description' => 'Heart care']);
    Specialization::factory()->create(['name' => 'Dermatology', 'description' => 'Skin care']);

    $this->get(route('admin.specializations.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/specializations/index')
            ->has('specializations', 2)
            ->where('specializations.0.name', 'Cardiology')
            ->where('specializations.1.name', 'Dermatology'));
});

it('lets an admin create a specialization', function () {
    $admin = makeAdmin();
    $this->actingAs($admin, 'admin');

    $this->post(route('admin.specializations.store'), [
        'name' => 'Neurology',
        'description' => 'Brain and nervous system',
    ])->assertRedirect(route('admin.specializations.index'));

    $this->assertDatabaseHas('specializations', [
        'name' => 'Neurology',
        'description' => 'Brain and nervous system',
    ]);
});

it('validates required fields when creating a specialization', function () {
    $admin = makeAdmin();
    $this->actingAs($admin, 'admin');

    $this->post(route('admin.specializations.store'), [])
        ->assertSessionHasErrors(['name']);
});

it('lets an admin update a specialization', function () {
    $admin = makeAdmin();
    $this->actingAs($admin, 'admin');

    $specialization = Specialization::factory()->create(['name' => 'Cardiology', 'description' => 'Old']);

    $this->put(route('admin.specializations.update', $specialization), [
        'name' => 'Cardiothoracic Surgery',
        'description' => 'Updated description',
    ])->assertRedirect(route('admin.specializations.index'));

    $this->assertDatabaseHas('specializations', [
        'id' => $specialization->id,
        'name' => 'Cardiothoracic Surgery',
        'description' => 'Updated description',
    ]);
});

it('lets an admin delete an unused specialization', function () {
    $admin = makeAdmin();
    $this->actingAs($admin, 'admin');

    $specialization = Specialization::factory()->create(['name' => 'General Practice']);

    $this->delete(route('admin.specializations.destroy', $specialization))
        ->assertRedirect(route('admin.specializations.index'));

    $this->assertDatabaseMissing('specializations', ['id' => $specialization->id]);
});

it('prevents deleting a specialization that doctors are using', function () {
    $admin = makeAdmin();
    $this->actingAs($admin, 'admin');

    $specialization = Specialization::factory()->create(['name' => 'General Practice']);

    Doctor::create([
        'id' => 'DOC-1',
        'first_name' => 'Aye',
        'last_name' => 'Chan',
        'specialization_id' => $specialization->id,
        'complete_address' => 'Yangon',
        'contact_number' => '09000000001',
        'proof_of_identity' => 'NRC',
        'email' => 'doctor-one@example.com',
        'user_name' => 'doctor-one',
        'status' => 'Active',
        'password' => 'secret',
    ]);

    $this->delete(route('admin.specializations.destroy', $specialization))
        ->assertRedirect(route('admin.specializations.index'))
        ->assertSessionHasErrors('specialization');

    $this->assertDatabaseHas('specializations', ['id' => $specialization->id]);
});

it('requires an authenticated admin to manage specializations', function () {
    $this->get(route('admin.specializations.index'))
        ->assertRedirect(route('admin.login'));
});

it('uses the selected specialization when creating a doctor', function () {
    $specialization = Specialization::factory()->create(['name' => 'Pediatrics']);

    $state = NrcState::create(['name' => 'Yangon']);
    $township = NrcTownship::create(['name' => 'Bahan', 'state_id' => $state->id]);
    $type = NrcType::create(['name' => 'N']);

    $doctor = app(CreateDoctorAction::class)->execute([
        'first_name' => 'Aye',
        'middle_name' => null,
        'last_name' => 'Chan',
        'specialization_id' => $specialization->id,
        'complete_address' => 'Yangon',
        'contact_number' => '09000000001',
        'proof_of_identity' => 'NRC',
        'user_name' => 'aye-chan',
        'email' => 'aye@example.com',
        'password' => 'password123',
        'status' => 'Active',
        'compensation_type' => 'per_appointment',
        'compensation_rate' => 15000,
        'nrc_state_id' => $state->id,
        'nrc_township_id' => $township->id,
        'nrc_type_id' => $type->id,
        'nrc_number' => '12/ABC(N)123456',
    ]);

    expect($doctor->specialization_id)->toBe($specialization->id)
        ->and($doctor->specialization->name)->toBe('Pediatrics');
});
