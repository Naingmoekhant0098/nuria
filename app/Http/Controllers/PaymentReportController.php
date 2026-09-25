<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PaymentReportController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('payment-report/index', [
            'payments' => Payment::query()
                ->with('reservation.patient')
                ->whereHas('reservation', fn ($query) => $query->where('clinic_id', $request->user()->id))
                ->latest()
                ->paginate($request->integer('limit', 15))
                ->withQueryString(),
            'paymentMethods' => PaymentMethod::query()->supported()->where('status', 'Active')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        abort_unless((int) $payment->reservation()->value('clinic_id') === (int) $request->user()->id, 404);
        $data = $request->validate([
            'payment_status' => ['sometimes', 'required', Rule::in(['Pending', 'Paid', 'Failed', 'Refunded', 'Cancelled'])],
        ]);
        abort_if($data === [], 422, 'Select a payment field to update.');
        $payment->update($data);

        return back()->with('success', 'Payment updated.');
    }
}
