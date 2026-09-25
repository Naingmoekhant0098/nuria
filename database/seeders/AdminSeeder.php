<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    private const string ADMIN_NAME = 'Clinic System Administrator';

    private const string ADMIN_EMAIL = 'admin123@gmail.com';

    private const string ADMIN_PASSWORD = 'admin@123';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => self::ADMIN_EMAIL],
            [
                'name' => self::ADMIN_NAME,
                'password' => Hash::make(self::ADMIN_PASSWORD),
                'is_admin' => true,
                'admin_role' => 'super_admin',
            ],
        );

        $user->syncRoles(['super_admin']);
    }
}
