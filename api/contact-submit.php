<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$config = load_config();
$requiredConfigKeys = [
    'client_id',
    'client_secret',
    'refresh_token',
    'account_id',
    'zoho_dc',
    'from_address',
    'to_address',
];

foreach ($requiredConfigKeys as $key) {
    if (empty($config[$key]) || is_placeholder_value((string)$config[$key])) {
        json_response(['success' => false, 'message' => 'Server configuration is incomplete.'], 500);
    }
}

$honeypot = trim((string)($_POST['_honey'] ?? ''));
if ($honeypot !== '') {
    // Return success to avoid giving bots feedback.
    json_response(['success' => true], 200);
}

$name = clean_input($_POST['name'] ?? '');
$email = clean_input($_POST['email'] ?? '');
$phone = clean_input($_POST['phone'] ?? '');
$company = clean_input($_POST['company'] ?? '');
$subject = clean_input($_POST['subject'] ?? '');
$message = clean_input($_POST['message'] ?? '');

if (str_len($name) < 2 || str_len($name) > 100) {
    json_response(['success' => false, 'message' => 'Please enter a valid name.'], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || str_len($email) > 200) {
    json_response(['success' => false, 'message' => 'Please enter a valid email address.'], 400);
}
if ($phone !== '' && !preg_match('/^[0-9+\-\s()]{7,30}$/', $phone)) {
    json_response(['success' => false, 'message' => 'Please enter a valid phone number.'], 400);
}
if (str_len($company) > 120) {
    json_response(['success' => false, 'message' => 'Company name is too long.'], 400);
}
if (str_len($subject) < 3 || str_len($subject) > 150) {
    json_response(['success' => false, 'message' => 'Please enter a valid subject.'], 400);
}
if (str_len($message) < 5 || str_len($message) > 5000) {
    json_response(['success' => false, 'message' => 'Please enter a valid message.'], 400);
}

$ipAddress = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$limitWindow = (int)($config['rate_limit_window_seconds'] ?? 600);
$limitRequests = (int)($config['rate_limit_max_requests'] ?? 5);

if (!enforce_rate_limit($ipAddress, $limitWindow, $limitRequests)) {
    json_response([
        'success' => false,
        'message' => 'Too many submissions from this network. Please try again in a few minutes.'
    ], 429);
}

$accessToken = fetch_access_token($config);
if ($accessToken === null) {
    json_response(['success' => false, 'message' => 'Unable to submit your message right now.'], 502);
}

$mailPayload = [
    'fromAddress' => $config['from_address'],
    'toAddress' => normalize_address_list($config['to_address']),
    'subject' => 'Website Contact: ' . $subject,
    'content' => build_message_body($name, $email, $phone, $company, $subject, $message, $ipAddress),
    'mailFormat' => 'plaintext',
];

if (!empty($config['cc_address'])) {
    $mailPayload['ccAddress'] = normalize_address_list($config['cc_address']);
}

$sendResult = send_zoho_mail($config, $accessToken, $mailPayload);
if (!$sendResult['success']) {
    json_response(['success' => false, 'message' => 'Unable to submit your message right now.'], 502);
}

$ackEnabled = config_bool($config['contact_ack_enabled'] ?? true);
if ($ackEnabled) {
    $ackFromAddress = trim((string)($config['contact_ack_from_address'] ?? $config['from_address']));
    if ($ackFromAddress !== '' && !is_placeholder_value($ackFromAddress)) {
        $ackSubjectTemplate = trim((string)($config['contact_ack_subject'] ?? 'Thank You for Contacting Primeasure'));
        $ackSubject = $ackSubjectTemplate !== '' ? $ackSubjectTemplate : 'Thank You for Contacting Primeasure';

        $ackPayload = [
            'fromAddress' => $ackFromAddress,
            'toAddress' => $email,
            'subject' => $ackSubject,
            'content' => build_acknowledgement_body($name, $subject),
            'mailFormat' => 'plaintext',
        ];

        $ackResult = send_zoho_mail($config, $accessToken, $ackPayload);
        if (!$ackResult['success']) {
            error_log('Contact acknowledgement email failed to send.');
        }
    } else {
        error_log('Contact acknowledgement email skipped due to sender configuration.');
    }
}

json_response(['success' => true], 200);

function load_config(): array
{
    $configPath = __DIR__ . '/contact-config.php';
    if (is_file($configPath)) {
        $config = require $configPath;
        if (is_array($config)) {
            return $config;
        }
    }

    return [
        'client_id' => getenv('ZOHO_CLIENT_ID') ?: '',
        'client_secret' => getenv('ZOHO_CLIENT_SECRET') ?: '',
        'refresh_token' => getenv('ZOHO_REFRESH_TOKEN') ?: '',
        'account_id' => getenv('ZOHO_ACCOUNT_ID') ?: '',
        'zoho_dc' => getenv('ZOHO_DC') ?: 'com',
        'from_address' => getenv('CONTACT_FROM_ADDRESS') ?: '',
        'to_address' => getenv('CONTACT_TO_ADDRESS') ?: '',
        'cc_address' => getenv('CONTACT_CC_ADDRESS') ?: '',
        'contact_ack_enabled' => getenv('CONTACT_ACK_ENABLED') ?: '1',
        'contact_ack_from_address' => getenv('CONTACT_ACK_FROM_ADDRESS') ?: '',
        'contact_ack_subject' => getenv('CONTACT_ACK_SUBJECT') ?: 'Thank You for Contacting Primeasure',
        'rate_limit_window_seconds' => (int)(getenv('CONTACT_RATE_WINDOW') ?: 600),
        'rate_limit_max_requests' => (int)(getenv('CONTACT_RATE_MAX') ?: 5),
    ];
}

function clean_input(string $value): string
{
    return trim(preg_replace('/\s+/', ' ', $value) ?? '');
}

function normalize_address_list(string $value): string
{
    $parts = array_map('trim', explode(',', $value));
    $parts = array_values(array_filter($parts, static function ($email) {
        return $email !== '';
    }));
    return implode(',', $parts);
}

function str_len(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
}

function config_bool($value): bool
{
    if (is_bool($value)) {
        return $value;
    }

    $normalized = strtolower(trim((string)$value));
    return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
}

function is_placeholder_value(string $value): bool
{
    return strpos($value, 'REPLACE_WITH_') === 0;
}

function enforce_rate_limit(string $ipAddress, int $windowSeconds, int $maxRequests): bool
{
    $windowSeconds = max($windowSeconds, 60);
    $maxRequests = max($maxRequests, 1);

    $dir = sys_get_temp_dir() . '/primeasure-contact-rate-limit';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        // Fail open if filesystem is unavailable.
        return true;
    }

    $key = hash('sha256', $ipAddress . '|contact');
    $file = $dir . '/' . $key . '.json';
    $now = time();
    $timestamps = [];

    if (is_file($file)) {
        $raw = file_get_contents($file);
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $timestamps = array_values(array_filter($decoded, static function ($ts) use ($now, $windowSeconds) {
                    return is_int($ts) && ($now - $ts) < $windowSeconds;
                }));
            }
        }
    }

    if (count($timestamps) >= $maxRequests) {
        return false;
    }

    $timestamps[] = $now;
    @file_put_contents($file, json_encode($timestamps), LOCK_EX);
    return true;
}

function fetch_access_token(array $config): ?string
{
    $dc = rawurlencode((string)$config['zoho_dc']);
    $url = 'https://accounts.zoho.' . $dc . '/oauth/v2/token';

    $postFields = http_build_query([
        'grant_type' => 'refresh_token',
        'client_id' => $config['client_id'],
        'client_secret' => $config['client_secret'],
        'refresh_token' => $config['refresh_token'],
    ], '', '&', PHP_QUERY_RFC3986);

    $response = curl_request($url, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    ]);

    if (!$response['ok']) {
        return null;
    }

    $decoded = json_decode($response['body'], true);
    if (!is_array($decoded) || empty($decoded['access_token'])) {
        return null;
    }

    return (string)$decoded['access_token'];
}

function send_zoho_mail(array $config, string $accessToken, array $mailPayload): array
{
    $dc = rawurlencode((string)$config['zoho_dc']);
    $accountId = rawurlencode((string)$config['account_id']);
    $url = 'https://mail.zoho.' . $dc . '/api/accounts/' . $accountId . '/messages';

    $response = curl_request($url, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($mailPayload),
        CURLOPT_HTTPHEADER => [
            'Authorization: Zoho-oauthtoken ' . $accessToken,
            'Content-Type: application/json',
            'Accept: application/json',
        ],
    ]);

    if (!$response['ok']) {
        return ['success' => false];
    }

    $decoded = json_decode($response['body'], true);
    if (!is_array($decoded)) {
        return ['success' => false];
    }

    $status = $decoded['status'] ?? null;
    if (is_array($status) && ((int)($status['code'] ?? 0) === 200)) {
        return ['success' => true];
    }

    $firstData = $decoded['data'][0] ?? null;
    if (is_array($firstData) && ((int)($firstData['code'] ?? 0) === 200)) {
        return ['success' => true];
    }

    return ['success' => false];
}

function build_message_body(
    string $name,
    string $email,
    string $phone,
    string $company,
    string $subject,
    string $message,
    string $ipAddress
): string {
    $lines = [
        'New contact form submission from primeasure.com',
        '',
        'Name: ' . $name,
        'Email: ' . $email,
        'Phone: ' . ($phone !== '' ? $phone : 'N/A'),
        'Company: ' . ($company !== '' ? $company : 'N/A'),
        'Subject: ' . $subject,
        '',
        'Message:',
        $message,
        '',
        'IP: ' . $ipAddress,
        'Submitted At (UTC): ' . gmdate('Y-m-d H:i:s'),
    ];

    return implode("\n", $lines);
}

function build_acknowledgement_body(string $name, string $subject): string
{
    $recipient = $name !== '' ? $name : 'Customer';
    $lines = [
        'Dear ' . $recipient . ',',
        '',
        'Thank you for contacting Primeasure Technologies.',
        'We have received your message and appreciate your interest in our solutions.',
        '',
        'Our team will review your enquiry' . ($subject !== '' ? ' regarding "' . $subject . '"' : '') . ' and get back to you shortly.',
        'If your request is urgent, please call us at +91-9884900031.',
        '',
        'Best regards,',
        'Primeasure Technologies',
    ];

    return implode("\n", $lines);
}

function curl_request(string $url, array $options): array
{
    $ch = curl_init($url);
    if ($ch === false) {
        return ['ok' => false, 'status' => 0, 'body' => ''];
    }

    $defaultOptions = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ];

    curl_setopt_array($ch, $defaultOptions + $options);
    $body = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($body === false || $error !== '') {
        return ['ok' => false, 'status' => $status, 'body' => ''];
    }

    return ['ok' => ($status >= 200 && $status < 300), 'status' => $status, 'body' => (string)$body];
}

function json_response(array $data, int $statusCode): void
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}
