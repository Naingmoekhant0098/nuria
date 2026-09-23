<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrescriptionItem extends Model
{
    protected $fillable = ['prescription_id', 'item_type', 'drug_id', 'drug_unit_id', 'medical_product_id', 'quantity', 'base_quantity', 'unit_price', 'instructions'];

    public function drug(): BelongsTo
    {
        return $this->belongsTo(Drug::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(DrugUnit::class, 'drug_unit_id');
    }

    public function medicalProduct(): BelongsTo
    {
        return $this->belongsTo(MedicalProduct::class);
    }
}
