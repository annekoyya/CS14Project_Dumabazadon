<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Http;

class LoginRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'email' => 'required|email',
            'password' => 'required|string',
            'captcha_token' => 'required|string',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $token = $this->captcha_token;

            // Verify token with Google
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => config('services.recaptcha.secret'),
                'response' => $token,
                'remoteip' => $this->ip(),
            ]);

            $result = $response->json();

            if (!isset($result['success']) || $result['success'] !== true || $result['score'] < 0.5) {
                $validator->errors()->add('captcha_token', 'Captcha verification failed. Are you a robot?');
            }
        });
    }
}