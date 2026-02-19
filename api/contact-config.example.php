<?php
declare(strict_types=1);

return [
    // OAuth client credentials from Zoho API Console.
    'client_id' => 'YOUR_ZOHO_CLIENT_ID',
    'client_secret' => 'YOUR_ZOHO_CLIENT_SECRET',
    'refresh_token' => 'YOUR_ZOHO_REFRESH_TOKEN',

    // Zoho Mail account details.
    'account_id' => '3683976000000002002',
    'zoho_dc' => 'in', // com | in | eu | com.au | jp

    // Mail routing.
    'from_address' => 'sales@primeasure.com',
    'to_address' => 'sales@primeasure.com,anirudh@primeasure.com',
    'cc_address' => '',
    'event_from_address' => 'sales@primeasure.com',
    'event_to_address' => 'sales@primeasure.com,anirudh@primeasure.com',
    'event_cc_address' => '',

    // Optional operational settings.
    'rate_limit_window_seconds' => 600,
    'rate_limit_max_requests' => 5,
];
