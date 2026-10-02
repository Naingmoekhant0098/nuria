<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Drug extends Model
{
    protected $fillable = ['drug_category_id', 'drug_form_id', 'manufacturer_id', 'name', 'strength', 'sku', 'image_path', 'is_active'];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        if ($this->image_path === null) {
            return null;
        }

        return str_starts_with($this->image_path, 'http') || str_starts_with($this->image_path, '/')
            ? $this->image_path
            : Storage::disk('public')->url($this->image_path);
    }

    public function units(): HasMany
    {
        return $this->hasMany(DrugUnit::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(DrugCategory::class, 'drug_category_id');
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(DrugForm::class, 'drug_form_id');
    }

    public function manufacturer(): BelongsTo
    {
        return $this->belongsTo(Manufacturer::class);
    }

    public function batches(): HasMany
    {
        return $this->hasMany(DrugBatch::class);
    }
}
