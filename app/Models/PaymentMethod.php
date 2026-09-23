<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    public const SUPPORTED_NAMES = ['Cash', 'KBZPay', 'Wave Money'];

    protected $fillable = ['name', 'status'];

    public function scopeSupported(Builder $query): Builder
    {
        return $query->whereIn('name', self::SUPPORTED_NAMES);
    }
}
