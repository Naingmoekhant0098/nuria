<?php

namespace App\Actions\Consultations;

use App\Models\Consultation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UpdateConsultationAction
{
    public function execute(
        Consultation $consultation,
        array $data
    ): Consultation {
        return DB::transaction(function () use (
            $consultation,
            $data
        ) {

            if (
                isset($data['upload_prescription'])
                && $data['upload_prescription'] instanceof UploadedFile
            ) {
                if (
                    $consultation->upload_prescription
                    && Storage::disk('public')->exists(
                        $consultation->upload_prescription
                    )
                ) {
                    Storage::disk('public')->delete(
                        $consultation->upload_prescription
                    );
                }

                $data['upload_prescription'] =
                    $data['upload_prescription']
                        ->store(
                            'prescriptions',
                            'public'
                        );
            }

            $consultation->update($data);

            return $consultation->fresh();
        });
    }
}
