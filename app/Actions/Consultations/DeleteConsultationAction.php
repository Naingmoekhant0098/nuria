<?php

namespace App\Actions\Consultations;

use App\Models\Consultation;
use Illuminate\Support\Facades\Storage;

class DeleteConsultationAction
{
    public function execute(
        Consultation $consultation
    ): void {
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

        $consultation->delete();
    }
}
