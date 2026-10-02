<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class MedicalProduct extends Model
{
    protected $fillable = ['medical_product_category_id', 'name', 'sku', 'image_path', 'is_active'];

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

    public function category(): BelongsTo
    {
        return $this->belongsTo(MedicalProductCategory::class, 'medical_product_category_id');
    }

    public function clinicProducts(): HasMany
    {
        return $this->hasMany(ClinicMedicalProduct::class);
    }
}
