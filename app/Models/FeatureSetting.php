<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class FeatureSetting extends Model
{
    protected $fillable = ['feature', 'globally_enabled', 'subscription_enabled'];

    protected $casts = [
        'globally_enabled' => 'boolean',
        'subscription_enabled' => 'boolean',
    ];

    public static function isGloballyEnabled(string $feature): bool
    {
        if (! Schema::hasTable('feature_settings')) {
            return false;
        }

        return static::query()
            ->where('feature', $feature)
            ->where('globally_enabled', true)
            ->exists();
    }

    public static function isSubscriptionEnabled(string $feature): bool
    {
        if (! Schema::hasTable('feature_settings') || ! Schema::hasColumn('feature_settings', 'subscription_enabled')) {
            return true;
        }

        return (bool) (static::query()
            ->where('feature', $feature)
            ->value('subscription_enabled') ?? true);
    }
}
