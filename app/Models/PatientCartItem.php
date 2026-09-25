<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientCartItem extends Model
{
    protected $fillable = ['patient_id', 'clinic_id', 'item_type', 'drug_id', 'drug_unit_id', 'medical_product_id', 'quantity'];

    public function drug(): BelongsTo
    {
        return $this->belongsTo(Drug::class);
    }

    public function drugUnit(): BelongsTo
    {
        return $this->belongsTo(DrugUnit::class);
    }

    public function medicalProduct(): BelongsTo
    {
        return $this->belongsTo(MedicalProduct::class);
    }
}
