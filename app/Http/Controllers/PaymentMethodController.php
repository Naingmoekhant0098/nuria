<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentMethod\UpdatePaymentMethodRequest;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('payment-methods/index', [
            'paymentMethods' => PaymentMethod::query()
                ->supported()
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        abort_unless(in_array($paymentMethod->name, PaymentMethod::SUPPORTED_NAMES, true), 404);

        $paymentMethod->update($request->validated());

        return back()->with('success', 'Payment method updated successfully.');
    }
}
