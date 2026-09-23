<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Drug extends Model
{
    protected $fillable = ['drug_category_id', 'drug_form_id', 'manufacturer_id', 'name', 'strength', 'sku', 'is_active'];

    public function units(): HasMany
    {
        return $this->hasMany(DrugUnit::class);
    }

    public function batches(): HasMany
    {
        return $this->hasMany(DrugBatch::class);
    }
}
