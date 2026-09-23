<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalProduct extends Model
{
    protected $fillable = ['medical_product_category_id', 'name', 'sku', 'is_active'];
}
