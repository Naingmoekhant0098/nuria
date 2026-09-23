<?php

namespace Database\Seeders;

use App\Models\NrcState;
use App\Models\NrcTownship;
use App\Models\NrcType;
use Illuminate\Database\Seeder;

class NrcSeeder extends Seeder
{
    public function run(): void
    {
        // get nrc types from data/nrc_types.json
        $nrcTypes = json_decode(file_get_contents(database_path('seeders/data/nrc_types.json')), true);
        foreach ($nrcTypes as $type) {
            NrcType::firstOrCreate(
                ['name' => $type['name']],
                [
                    'burmese_name' => $type['burmese_name'],
                    'status' => true,
                ]
            );
        }

        // get nrc states from data/nrc_states.json
        $nrcStates = json_decode(file_get_contents(database_path('seeders/data/nrc_states.json')), true);
        foreach ($nrcStates as $state) {
            NrcState::firstOrCreate(
                ['id' => $state['id']],
                [
                    'name' => $state['code'],
                    'burmese_name' => $state['burmese_code'],
                    'status' => true,
                ]
            );
        }

        // get nrc townships from data/nrc_townships.json
        $nrcTownships = json_decode(file_get_contents(database_path('seeders/data/nrc_townships.json')), true);
        foreach ($nrcTownships as $township) {
            NrcTownship::firstOrCreate(
                ['id' => $township['id']],
                [
                    'state_id' => $township['nrc_state_code_id']['id'],
                    'name' => $township['code'],
                    'burmese_name' => $township['burmese_code'],
                    'status' => true,
                ]
            );
        }
    }
}
