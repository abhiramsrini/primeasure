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
    'contact_ack_enabled' => true,
    'contact_ack_from_address' => 'sales@primeasure.com',
    'contact_ack_subject' => 'Thank You for Contacting Primeasure',
    'event_from_address' => 'sales@primeasure.com',
    'event_to_address' => 'sales@primeasure.com,anirudh@primeasure.com',
    'event_cc_address' => '',
    'event_ack_enabled' => true,
    'event_ack_from_address' => 'sales@primeasure.com',
    'event_ack_subject' => 'Registration Received - {{event_title}}',

    // Optional operational settings.
    'contact_min_submit_seconds' => 3,
    'contact_spam_max_links' => 2,
    'contact_spam_min_meaningful_chars' => 20,
    'rate_limit_window_seconds' => 900,
    'rate_limit_max_requests' => 3,
];
