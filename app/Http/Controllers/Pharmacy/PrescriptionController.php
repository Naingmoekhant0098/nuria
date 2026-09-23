<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pharmacy\StorePrescriptionRequest;
use App\Models\Consultation;
use App\Models\DrugUnit;
use App\Models\Prescription;
use Illuminate\Support\Facades\DB;

class PrescriptionController extends Controller
{
    public function store(StorePrescriptionRequest $request)
    {
        $clinicId = auth()->user()->id;
        $data = $request->validated();
        $consultation = Consultation::query()->whereHas('reservation', fn ($query) => $query->where('clinic_id', $clinicId))->findOrFail($data['consultation_id']);
        $prescription = DB::transaction(function () use ($clinicId, $data, $consultation) {
            $prescription = Prescription::create(['consultation_id' => $consultation->id, 'clinic_id' => $clinicId, 'notes' => $data['notes'] ?? null]);
            foreach ($data['items'] as $item) {
                $unit = isset($item['drug_unit_id']) ? DrugUnit::query()->where('drug_id', $item['drug_id'])->findOrFail($item['drug_unit_id']) : DrugUnit::query()->where('drug_id', $item['drug_id'])->where('is_default', true)->firstOrFail();
                $prescription->items()->create($item + ['drug_unit_id' => $unit->id, 'base_quantity' => $item['quantity'] * $unit->conversion_quantity]);
            }

            return $prescription;
        });

        return back()->with('success', "Prescription {$prescription->id} created. Stock was not deducted.");
    }
}
